import Vue from 'vue';

class Anchor {
    private vm: Vue;
    private unWatchs: Dictionary<(() => void)[]> = {};
    private options: Dictionary<AnchorOption> = {};
    private pluginOptions: PluginOptions;

    constructor(vm: Vue, pluginOptions?: PluginOptions) {
        this.vm = vm;
        this.pluginOptions = pluginOptions || {};
        this.register(this.vm.$options.anchor);
    }

    public register(anchorOptions: AnchorOptions = []): void {
        const options: AnchorOption[] = anchorOptions.map(item => this.getDefaultOption(item));
        // For each option, bind key to the corresponding part of the url.
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

    public unregister(key: string): boolean {
        if (this.unWatchs[key]) {
            this.unWatchs[key].forEach(cb => cb());
            delete this.unWatchs[key];
            delete this.options[key];
            return true;
        }
        return false;
    }

    public update(key: string): void {
        const option = this.options[key];
        const value = this.getValue(key);
        const packValue = this.pack(value);
        const oldPackValue = this.vm.$route.query[option.name as string];

        // When the value has not changed, return directly.
        if (packValue === oldPackValue) return;

        if (this.pluginOptions.beforeUpdate) this.pluginOptions.beforeUpdate(key, this.unpack(oldPackValue));
        if (option.beforeUpdate) option.beforeUpdate(key, this.unpack(oldPackValue));

        // If mode is true, update the value.
        // If mode is false, clear the value.
        // If mode is null, return directly.
        let mode: boolean | null = true;

        if (option.updateCheck) {
            mode = option.updateCheck(key, value);
            if (mode === null) return;
        } else if (this.pluginOptions.updateCheck) {
            mode = this.pluginOptions.updateCheck(key, value);
            if (mode === null) return;
        }

        // Update the corresponding part of the url based on the value of the key.
        const defaults = this.pack(typeof option.defaults === 'function' ? option.defaults(key) : option.defaults);
        if (mode && packValue !== defaults) {
            const query = Object.assign(Object.assign({}, this.vm.$route.query), {
                [option.name as string]: packValue,
            });
            this.vm.$router.replace({
                query: query,
            });
        } else if (!mode || (packValue === defaults && oldPackValue)) {
            // When the value of key is the same as the default value, delete the corresponding part of the url.
            const query = Object.assign({}, this.vm.$route.query);
            delete query[option.name as string];
            this.vm.$router.replace({
                query: query,
            });
        }

        if (mode && option.afterUpdate) option.afterUpdate(key, value);
        if (mode && this.pluginOptions.afterUpdate) this.pluginOptions.afterUpdate(key, value);
    }

    public restore(key: string): void {
        const option = this.options[key];
        const packValue = this.vm.$route.query[option.name as string];
        const value = this.unpack(packValue);

        if (packValue && option.restore) {
            if (this.pluginOptions.beforeRestore) this.pluginOptions.beforeRestore(key, value);
            if (option.beforeRestore) option.beforeRestore(key, value);
            option.restore(key, value);
            if (option.afterRestore) option.afterRestore(key, value);
            if (this.pluginOptions.afterRestore) this.pluginOptions.afterRestore(key, value);
        }
    }

    private getDefaultOption(item: string | AnchorOption) {
        // Convert string to AnchorOption.
        let option: AnchorOption;
        if (typeof item === 'string') {
            option = {
                key: item,
            };
        } else {
            option = item;
        }
        // Complete default value.
        if (!option.defaults) option.defaults = this.getValue(option.key);
        if (!option.name) option.name = option.key;
        if (!option.restore) option.restore = this.setValue;
        return option;
    }

    private pack(value: any): string {
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
            case 'object':
                if (value === null) {
                    return 'u';
                } else {
                    return '*' + encodeURI(JSON.stringify(value));
                }
            default:
                throw (`[vue-data-anchor]: The value of type "${typeofValue}" are not supported.`);
        }
    }

    private unpack(packValue: string): any {
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
            case '*':
                return JSON.parse(raw);
            default:
                throw ('[vue-data-anchor]: Could not restore value correctly. The url may have changed.');
        }
    }

    /** Get value from vue's data. */
    private getValue(key: string): any {
        let target: any = this.vm.$data;
        key.split('.').forEach(k => {
            target = target[k];
        });
        return target;
    }

    /** Set Value to vue's data. */
    private setValue(key: string, value: any) {
        let current: any = this.vm.$data;
        let target: any;
        let targetKey = key;
        key.split('.').forEach(k => {
            target = current;
            current = current[k];
            targetKey = k;
        });
        this.vm.$set(target, targetKey, value);
    }
}

export default Anchor;
