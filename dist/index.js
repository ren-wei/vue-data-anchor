(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["vue-anchor"] = factory());
})(this, (function () { 'use strict';

    const VueAnchor = {
        install(Vue, options) {
            const mergedOptions = Object.assign({
                anchor: 'anchor',
            }, options);
            const { anchor } = mergedOptions;
            Vue.mixin({
                created() {
                    const anchorOptions = this.$options[anchor];
                    if (anchorOptions) {
                        Object.entries(anchorOptions).forEach(([name, config]) => {
                            console.log('name:', name);
                            console.log('config:', config);
                        });
                    }
                },
            });
        },
    };

    return VueAnchor;

}));
