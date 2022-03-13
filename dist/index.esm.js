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

export { VueAnchor as default };
