import { PluginObject } from 'vue';
import Anchor from './anchor';

const VueAnchor: PluginObject<PluginOptions> = {
    install(Vue, options) {
        Vue.mixin({
            created() {
                this.$anchor = new Anchor(this);
            },
        });
    },
};

export default VueAnchor;
