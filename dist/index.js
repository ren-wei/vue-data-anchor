(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["vue-anchor"] = factory());
})(this, (function () { 'use strict';

    const VueAnchor = {
        install(Vue, options) {
            console.log('VueAnchor installed');
            Vue.mixin({
                created() {
                    console.log('created');
                },
            });
        },
    };

    return VueAnchor;

}));
