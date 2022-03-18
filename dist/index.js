(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["vue-anchor"] = factory());
})(this, (function () { 'use strict';

    class Anchor {
        constructor(vm) {
            this.unWatchs = {};
            this.options = {};
            this.vm = vm;
            this.register(this.vm.$options.anchor);
        }
        register(anchorOptions = []) {
            const options = anchorOptions.map(item => this.getDefaultOption(item));
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
        unregister(key) {
            if (this.unWatchs[key]) {
                this.unWatchs[key].forEach(cb => cb());
                delete this.unWatchs[key];
                delete this.options[key];
                return true;
            }
            return false;
        }
        update(key) {
            const option = this.options[key];
            const value = this.getValue(key);
            const packValue = this.pack(value);
            // When the value has not changed, return directly.
            if (packValue === this.vm.$route.query[option.name])
                return;
            // Update the corresponding part of the url based on the value of the key.
            const defaults = typeof option.defaults === 'function' ? option.defaults(key) : option.defaults;
            if (value !== defaults) {
                const query = Object.assign(Object.assign({}, this.vm.$route.query), {
                    [option.name]: packValue,
                });
                this.vm.$router.replace({
                    query: query,
                });
            }
            else if (this.vm.$route.query[option.name]) {
                // When the value of key is the same as the default value, delete the corresponding part of the url.
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
                this.setValue(key, this.unpack(packValue));
            }
        }
        getDefaultOption(item) {
            // Convert string to AnchorOption.
            let option;
            if (typeof item === 'string') {
                option = {
                    key: item,
                };
            }
            else {
                option = item;
            }
            // Complete default value.
            if (!option.defaults)
                option.defaults = this.getValue(option.key);
            if (!option.name)
                option.name = option.key;
            return option;
        }
        pack(value) {
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
                    }
                    else {
                        return '*' + encodeURI(JSON.stringify(value));
                    }
                default:
                    throw (`[vue-anchor]: The value of type "${typeofValue}" are not supported.`);
            }
        }
        unpack(packValue) {
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
                    throw ('[vue-anchor]: Could not restore value correctly. The url may have changed.');
            }
        }
        /** Get value from vue's data. */
        getValue(key) {
            let target = this.vm.$data;
            key.split('.').forEach(k => {
                target = target[k];
            });
            return target;
        }
        /** Set Value to vue's data. */
        setValue(key, value) {
            let current = this.vm.$data;
            let target;
            let targetKey = key;
            key.split('.').forEach(k => {
                target = current;
                current = current[k];
                targetKey = k;
            });
            this.vm.$set(target, targetKey, value);
        }
    }

    const VueAnchor = {
        install(Vue, options) {
            Vue.mixin({
                created() {
                    this.$anchor = new Anchor(this);
                },
            });
        },
    };

    return VueAnchor;

}));
