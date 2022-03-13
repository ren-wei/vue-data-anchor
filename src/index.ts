import { PluginObject } from 'vue';

const VueAnchor: PluginObject<VueAnchorOption> = {
    install(Vue, options) {
        console.log('VueAnchor installed');
        Vue.mixin({
            created() {
                console.log('created');
            },
        });
    },
};

export default VueAnchor;
