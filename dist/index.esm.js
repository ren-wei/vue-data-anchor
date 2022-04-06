class Anchor {
    constructor(vm, pluginOptions) {
        this.options = {};
        this.unWatchs = {};
        this.vm = vm;
        this.pluginOptions = pluginOptions || {};
        this.register(this.vm.$options.anchor);
    }
    register(anchorOptions = []) {
        const options = this.getRegisteredOptions(anchorOptions);
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
    unregister(key, clearRoute = true) {
        if (this.unWatchs[key]) {
            this.unWatchs[key].forEach(cb => cb());
            if (clearRoute && this.options[key] && this.vm.$route.query[this.options[key].name]) {
                const query = Object.assign({}, this.vm.$route.query);
                delete query[this.options[key].name];
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
    update(key) {
        const option = this.options[key];
        if (!option)
            throw (`[vue-data-anchor]: The '${key}' is not registered, please register first.`);
        const value = this.getValue(key);
        const packValue = this.pack(value);
        const oldPackValue = this.vm.$route.query[option.name];
        // When the value has not changed, return directly.
        if (packValue === oldPackValue)
            return;
        // If mode is true, update the value.
        // If mode is false, clear the value.
        // If mode is null, return directly.
        const mode = option.updateCheck.call(this.vm, key, value);
        if (mode === null)
            return;
        if (mode) {
            // Update $route.query based on the value of the key.
            const defaults = this.pack(typeof option.defaults === 'function' ? option.defaults.call(this.vm, key) : option.defaults);
            if (packValue !== defaults) {
                const query = Object.assign(Object.assign({}, this.vm.$route.query), {
                    [option.name]: packValue,
                });
                this.vm.$router.replace({
                    query: query,
                });
            }
            else if (oldPackValue) {
                // When the value of key is the same as the default value, delete the corresponding part of the url.
                const query = Object.assign({}, this.vm.$route.query);
                delete query[option.name];
                this.vm.$router.replace({
                    query: query,
                });
            }
        }
        else if (oldPackValue) {
            const query = Object.assign({}, this.vm.$route.query);
            delete query[option.name];
            this.vm.$router.replace({
                query: query,
            });
        }
    }
    restore(key) {
        const option = this.options[key];
        const packValue = this.vm.$route.query[option.name];
        if (packValue) {
            const value = this.unpack(packValue);
            option.restore && option.restore.call(this.vm, key, value);
        }
    }
    pack(value) {
        if (value === null)
            return 'u';
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
    unpack(packValue) {
        if (packValue === undefined)
            return undefined;
        if (typeof packValue !== 'string') {
            if (packValue[0]) {
                packValue = packValue[0];
            }
            else {
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
    getRegisteredOptions(options) {
        const result = [];
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
            }
            else {
                if (typeof item === 'string') {
                    result.push({
                        key,
                        name: this.pluginOptions.rename ? this.pluginOptions.rename.call(this.vm, key) : key.slice(key.lastIndexOf('.') + 1),
                        defaults: this.getValue(key),
                        updateCheck: (this.pluginOptions.updateCheck || (() => true)).bind(this.vm),
                        restore: (this.pluginOptions.restore || (this.setValue)).bind(this.vm),
                    });
                }
                else {
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
    getValue(key) {
        let target = this.vm;
        key.split('.').forEach(k => {
            target = target[k];
        });
        return target;
    }
    /** Set Value to vue's data. */
    setValue(key, value) {
        let current = this;
        let target;
        let targetKey = key;
        key.split('.').forEach(k => {
            target = current;
            current = current[k];
            targetKey = k;
        });
        this.$set(target, targetKey, value);
    }
}

const VueDataAnchor = {
    install(Vue, options) {
        Vue.mixin({
            created() {
                this.$anchor = new Anchor(this, options);
            },
        });
    },
};

export { VueDataAnchor as default };
