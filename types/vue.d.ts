import Vue from "vue";
import 'vue-router';
import Anchor from '../src/anchor';

declare module 'vue/types/vue' {
    interface Vue {
        $anchor: Anchor;
    }
}
declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        anchor?: AnchorOptions;
    }
}