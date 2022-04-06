import { mount, createLocalVue } from '@vue/test-utils';
import { describe, it, expect } from '@jest/globals';
import { ComponentOptions } from 'vue';
// Why is VueRouter undefined?
// import VueRouter from 'vue-router';
const VueRouter = require('vue-router');
import Anchor from '../src/anchor';

const localVue = createLocalVue();
localVue.use(VueRouter);

describe('object', () => {
    it('The `key` value of the property of the changed object should be bound to `$route.query[key]`.', async() => {
        const app: ComponentOptions<Vue> = {
            template: '<div></div>',
            data() {
                return {
                    params: {
                        pageNum: 1,
                    },
                };
            },
            anchor: ['params.pageNum'],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        wrapper.vm.$data.params.pageNum = 2;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query['pageNum'])).toBe(2);

        if (Object.keys(wrapper.vm.$route.query).length) wrapper.vm.$router.replace({ query: {}});
    });

    it('The `key` value of an object type should bind its properties.', async() => {
        const app: ComponentOptions<Vue> = {
            template: '<div></div>',
            data() {
                return {
                    params: {
                        pageNum: 1,
                    },
                };
            },
            anchor: ['params'],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        wrapper.vm.$data.params.pageNum = 2;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query['pageNum'])).toBe(2);

        if (Object.keys(wrapper.vm.$route.query).length) wrapper.vm.$router.replace({ query: {}});
    });

    it('When unregistering an object, unregister all properties.', async() => {
        const app: ComponentOptions<Vue> = {
            template: '<div></div>',
            data() {
                return {
                    params: {
                        pageNum: 1,
                        pageSize: 10,
                    },
                };
            },
            anchor: ['params'],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        wrapper.vm.$data.params.pageNum = 2;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query['pageNum'])).toBe(2);

        expect(Object.keys(anchor['unWatchs']).length).toBe(3);
        anchor.unregister('params');
        expect(Object.keys(anchor['unWatchs']).length).toBe(0);

        wrapper.vm.$data.params.pageNum = 3;
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$route.query['pageNum']).toBeUndefined();

        if (Object.keys(wrapper.vm.$route.query).length) wrapper.vm.$router.replace({ query: {}});
    });

    it('When changing the object value directly, it should be re-registered.', async() => {
        const app: ComponentOptions<Vue> = {
            template: '<div></div>',
            data() {
                return {
                    params: {
                        pageNum: 1,
                        pageSize: 10,
                    },
                };
            },
            anchor: ['params'],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        expect(Object.keys(anchor['unWatchs'])).toEqual(['params', 'params.pageNum', 'params.pageSize']);
        wrapper.vm.$data.params = { pageNum: 2, total: 10 };
        await wrapper.vm.$nextTick();
        expect(Object.keys(anchor['unWatchs'])).toEqual(['params', 'params.pageNum', 'params.total']);

        if (Object.keys(wrapper.vm.$route.query).length) wrapper.vm.$router.replace({ query: {}});
    });
});
