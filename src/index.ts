import { PluginObject } from 'vue';
import Anchor from './anchor';

const VueDataAnchor: PluginObject<PluginOptions> = {
    install(Vue, options) {
        Vue.mixin({
            created() {
                (this as Vue).$anchor = new Anchor((this as Vue), options);
            },
        });
    },
};

export default VueDataAnchor;
