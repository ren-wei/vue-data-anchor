import { PluginObject } from 'vue';
import Anchor from './anchor';

const VueDataAnchor: PluginObject<PluginOptions> = {
    install(Vue, options) {
        Vue.mixin({
            created() {
                this.$anchor = new Anchor(this, options);
            },
        });
    },
};

export default VueDataAnchor;
