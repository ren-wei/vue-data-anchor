import Vue from 'vue';

class Anchor {
    private vm: Vue;
    private unWatchs: Dictionary<(() => void)[]> = {};
    private options: Dictionary<AnchorOption> = {};

    constructor(vm: Vue) {
        this.vm = vm;
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

        // When the value has not changed, return directly.
        if (packValue === this.vm.$route.query[option.name as string]) return;

        // Update the corresponding part of the url based on the value of the key.
        const defaults = typeof option.defaults === 'function' ? option.defaults(key) : option.defaults;
        if (value !== defaults) {
            const query = Object.assign(Object.assign({}, this.vm.$route.query), {
                [option.name as string]: packValue,
            });
            this.vm.$router.replace({
                query: query,
            });
        } else if (this.vm.$route.query[option.name as string]) {
            // When the value of key is the same as the default value, delete the corresponding part of the url.
            const query = Object.assign({}, this.vm.$route.query);
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
            this.setValue(key, this.unpack(packValue));
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
        return option;
    }

    private pack(value: any): string {
        const typeofValue = typeof value;
        switch (typeofValue) {
            case 'string':
                return 's' + encodeURI(value);
            case 'number':
                return 'n' + encodeURI(value);
            case 'bigint':
                return 'i' + encodeURI(value);
            case 'boolean':
                return value ? 'b1' : 'b0';
            case 'undefined':
                return 'd';
            case 'object':
                if (value === null) {
                    return 'u';
                } else {
                    return 'o' + encodeURI(JSON.stringify(value));
                }
            default:
                throw (`[vue-anchor]: The value of type "${typeofValue}" are not supported.`);
        }
    }

    private unpack(packValue: string): any {
        const typeofValue = packValue[0];
        const raw = decodeURI(packValue.slice(1));
        switch (typeofValue) {
            case 's':
                return raw;
            case 'n':
                return Number(raw);
            case 'i':
                return BigInt(raw);
            case 'b':
                return raw === 'b1';
            case 'd':
                return undefined;
            case 'u':
                return null;
            case 'o':
                return JSON.parse(raw);
            default:
                throw ('[vue-anchor]: Could not restore value correctly. The url may have changed.');
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
