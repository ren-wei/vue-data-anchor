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

export { VueAnchor as default };
