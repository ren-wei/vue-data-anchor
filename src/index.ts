import { PluginObject } from 'vue';

const VueAnchor: PluginObject<PluginOptions> = {
    install(Vue, options) {
        const mergedOptions: PluginOptions = Object.assign({
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

export default VueAnchor;
