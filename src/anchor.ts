import Vue from 'vue';

class Anchor {
    public pluginOptions: PluginOptions;
    public options: Dictionary<RegisteredOption> = {};
    private vm: Vue;
    private unWatchs: Dictionary<(() => void)[]> = {};

    constructor(vm: Vue, pluginOptions?: PluginOptions) {
        this.vm = vm;
        this.pluginOptions = pluginOptions || {};
        this.register(this.vm.$options.anchor);
    }

    public register(anchorOptions: AnchorOptions = []): void {
        const options: RegisteredOption[] = this.getRegisteredOptions(anchorOptions);
        // For each option, bind key to $route.query.
        options.forEach((option) => {
            this.unregister(option.key);
            this.options[option.key] = option;
            this.restore(option.key);
            this.update(option.key);
            this.unWatchs[option.key] = [
                this.vm.$watch(option.key, () => this.update(option.key)),
                this.vm.$watch(`$route.query.${option.name}`, () => this.restore(option.key)),
            ];
        });
    }

    public unregister(key: string, clearRoute = true): boolean {
        if (this.unWatchs[key]) {
            this.unWatchs[key].forEach(cb => cb());
            if (clearRoute && this.options[key] && this.vm.$route.query[this.options[key].name]) {
                const query = { ...this.vm.$route.query };
                delete query[this.options[key].name as string];
                this.vm.$router.replace({
                    query: query,
                });
            }
            delete this.unWatchs[key];
            delete this.options[key];
            return true;
        }
        return false;
    }

    public update(key: string): void {
        const option = this.options[key];
        if (!option) throw (`[vue-data-anchor]: The '${key}' is not registered, please register first.`);
        const value = this.getValue(key);
        const packValue = this.pack(value);
        const oldPackValue = this.vm.$route.query[option.name as string];

        // When the value has not changed, return directly.
        if (packValue === oldPackValue) return;

        // If mode is true, update the value.
        // If mode is false, clear the value.
        // If mode is null, return directly.
        const mode = option.updateCheck.call(this.vm, key, value);
        if (mode === null) return;

        if (mode) {
            // Update $route.query based on the value of the key.
            const defaults = this.pack(typeof option.defaults === 'function' ? option.defaults.call(this.vm, key) : option.defaults);
            if (packValue !== defaults) {
                const query = { ...this.vm.$route.query, ...{
                    [option.name as string]: packValue,
                }};
                this.vm.$router.replace({
                    query: query,
                });
            } else if (oldPackValue) {
                // When the value of key is the same as the default value, delete the corresponding part of the url.
                const query = { ...this.vm.$route.query };
                delete query[option.name as string];
                this.vm.$router.replace({
                    query: query,
                });
            }
        } else if (oldPackValue) {
            const query = { ...this.vm.$route.query };
            delete query[option.name as string];
            this.vm.$router.replace({
                query: query,
            });
        }
    }

    public restore(key: string): void {
        const option = this.options[key];
        const packValue = this.vm.$route.query[option.name as string];

        if (packValue) {
            const value = this.unpack(packValue);
            option.restore && option.restore.call(this.vm, key, value);
        }
    }

    public pack(value: any): string {
        if (value === null) return 'u';
        const typeofValue = typeof value;
        switch (typeofValue) {
            case 'string':
                return 's' + encodeURI(value);
            case 'number':
                return '0' + encodeURI(value);
            case 'bigint':
                return 'i' + encodeURI(value);
            case 'boolean':
                return value ? 't' : 'f';
            case 'undefined':
                return '-';
            default:
                throw (`[vue-data-anchor]: The value of type "${typeofValue}" are not supported.`);
        }
    }

    public unpack(packValue: string | (string | null)[] | undefined): any {
        if (packValue === undefined) return undefined;
        if (typeof packValue !== 'string') {
            if (packValue[0]) {
                packValue = packValue[0];
            } else {
                throw ('[vue-data-anchor]: Could not restore value correctly.');
            }
        }
        const typeofValue = packValue[0];
        const raw = decodeURI(packValue.slice(1));
        switch (typeofValue) {
            case 's':
                return raw;
            case '0':
                return Number(raw);
            case 'i':
                return BigInt(raw);
            case 't':
                return true;
            case 'f':
                return false;
            case '-':
                return undefined;
            case 'u':
                return null;
            default:
                throw ('[vue-data-anchor]: Could not restore value correctly. The url may have changed.');
        }
    }

    private getRegisteredOptions(options: AnchorOptions): RegisteredOption[] {
        const result: RegisteredOption[] = [];
        for (const item of options) {
            const key = typeof item === 'string' ? item : item.key;
            const value = this.getValue(key);
            if (value !== null && typeof value === 'object') {
                const keys = Object.keys(value).map(k => `${key}.${k}`);
                this.unWatchs[key] = [
                    // When the value is changed, re-register.
                    this.vm.$watch(key, () => {
                        keys.forEach(k => this.unregister(k));
                        this.register([key]);
                    }),
                    () => keys.forEach(k => this.unregister(k)),
                ];
                result.push(...this.getRegisteredOptions(keys));
            } else {
                if (typeof item === 'string') {
                    result.push({
                        key,
                        name: this.pluginOptions.rename ? this.pluginOptions.rename.call(this.vm, key) : key.slice(key.lastIndexOf('.') + 1),
                        defaults: this.getValue(key),
                        updateCheck: (this.pluginOptions.updateCheck || (() => true)).bind(this.vm),
                        restore: (this.pluginOptions.restore || (this.setValue)).bind(this.vm),
                    });
                } else {
                    const name = item.name
                        ? (typeof item.name === 'string' ? item.name : item.name.call(this.vm, key))
                        : this.pluginOptions.rename ? this.pluginOptions.rename.call(this.vm, key) : key.slice(key.lastIndexOf('.') + 1);
                    result.push({
                        key,
                        name,
                        defaults: item.defaults || this.getValue(key),
                        updateCheck: (item.updateCheck || this.pluginOptions.updateCheck || (() => true)).bind(this.vm),
                        restore: (item.restore || this.pluginOptions.restore || (this.setValue)).bind(this.vm),
                    });
                }
            }
        }
        return result;
    }

    /** Get value from vue's data. */
    private getValue(key: string): any {
        let target: any = this.vm;
        key.split('.').forEach(k => {
            target = target[k];
        });
        return target;
    }

    /** Set Value to vue's data. */
    private setValue(this: Vue, key: string, value: any) {
        let current: any = this;
        let target: any;
        let targetKey = key;
        key.split('.').forEach(k => {
            target = current;
            current = current[k];
            targetKey = k;
        });
        this.$set(target, targetKey, value);
    }
}

export default Anchor;
