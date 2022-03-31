import { shallowMount, mount, createLocalVue } from '@vue/test-utils';
import { describe, it, expect } from '@jest/globals';
// Why is VueRouter undefined?
// import VueRouter from 'vue-router';
const VueRouter = require('vue-router');
import Anchor from '../src/anchor';

const localVue = createLocalVue();
localVue.use(VueRouter);

describe('AnchorOption', () => {
    it('AnchorOption name', async() => {
        const app = {
            template: '<div></div>',
            data() {
                return {
                    name: 'anchor',
                    params: {
                        pageNum: 1,
                    },
                };
            },
            anchor: [
                { key: 'name', name: 'other' },
                { key: 'params.pageNum', name: 'pageNum' },
            ],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        // change name value
        wrapper.vm.$data.name = 'change1';
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.other)).toBe('change1');

        wrapper.vm.$router.replace({ query: { other: 'schange2' }});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.name).toBe('change2');

        // change params.pageNum value
        wrapper.vm.$data.params.pageNum = 2;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.pageNum)).toBe(2);

        wrapper.vm.$router.replace({ query: { pageNum: '03' }});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.params.pageNum).toBe(3);
    });

    it('AnchorOption defaults', async() => {
        const app = {
            template: '<div></div>',
            data() {
                return {
                    name: 'anchor',
                    params: {
                        pageNum: 1,
                    },
                };
            },
            anchor: [
                { key: 'name', defaults: 'defaults' },
                { key: 'params.pageNum', defaults: 2 },
            ],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.name)).toBe('anchor');
        expect(anchor.unpack(wrapper.vm.$route.query['params.pageNum'])).toBe(1);

        wrapper.vm.$data.name = 'defaults';
        wrapper.vm.$data.params.pageNum = 2;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.name)).toBeUndefined();
        expect(anchor.unpack(wrapper.vm.$route.query['params.pageNum'])).toBeUndefined();
    });

    it('AnchorOption lifecycle', async() => {
        let stage: 'none' | 'beforeUpdate' | 'afterUpdate' | 'beforeRestore' | 'afterRestore' = 'none';
        const app = {
            template: '<div></div>',
            data() {
                return {
                    name: 'old',
                };
            },
            anchor: [
                {
                    key: 'name',
                    beforeUpdate: (key: string, value: any) => {
                        expect(key).toBe('name');
                        expect(value).toBeUndefined();
                        expect(stage).toBe('none');
                        expect(wrapper.vm.$data.name).toBe('new');
                        expect(wrapper.vm.$route.query.name).toBeUndefined();
                        stage = 'beforeUpdate';
                    },
                    afterUpdate: (key: string, value: any) => {
                        expect(key).toBe('name');
                        expect(value).toBe('new');
                        expect(stage).toBe('beforeUpdate');
                        expect(wrapper.vm.$data.name).toBe('new');
                        expect(anchor.unpack(wrapper.vm.$route.query.name)).toBe('new');
                        stage = 'afterUpdate';
                    },
                    beforeRestore: (key: string, value: any) => {
                        expect(key).toBe('name');
                        expect(value).toBe('new');
                        expect(stage).toBe('afterUpdate');
                        expect(wrapper.vm.$data.name).toBe('new');
                        expect(anchor.unpack(wrapper.vm.$route.query.name)).toBe('new');
                        stage = 'beforeRestore';
                    },
                    afterRestore: (key: string, value: any) => {
                        expect(key).toBe('name');
                        expect(value).toBe('new');
                        expect(stage).toBe('beforeRestore');
                        expect(wrapper.vm.$data.name).toBe('new');
                        expect(anchor.unpack(wrapper.vm.$route.query.name)).toBe('new');
                        stage = 'afterRestore';
                    },
                },
            ],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        expect(stage).toBe('none');

        wrapper.vm.$data.name = 'new';
        await wrapper.vm.$nextTick();
        expect(stage).toBe('afterRestore');
    });

    it('AnchorOption updateCheck', async() => {
        let mode: null | boolean = true;
        let expected: string = 'old';
        const app = {
            template: '<div></div>',
            data() {
                return {
                    name: 'old',
                };
            },
            anchor: [
                {
                    key: 'name',
                    updateCheck: (key: string, value: any) => {
                        expect(key).toBe('name');
                        expect(value).toBe(expected);
                        return mode;
                    },
                },
            ],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        // When updateCheck return true
        mode = true;
        wrapper.vm.$data.name = 'new1';
        expected = 'new1';
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.name)).toBe('new1');

        // When updateCheck return null
        mode = null;
        wrapper.vm.$data.name = 'new2';
        expected = 'new2';
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.name)).toBe('new1');

        // When updateCheck return false
        mode = false;
        wrapper.vm.$data.name = 'new3';
        expected = 'new3';
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.name)).toBeUndefined();
    });

    it('AnchorOption restore', async() => {
        let target = 'old';
        const app = {
            template: '<div></div>',
            data() {
                return {
                    name: 'old',
                };
            },
            anchor: [
                {
                    key: 'name',
                    restore: (key: string, value: any) => {
                        expect(key).toBe('name');
                        target = value;
                    },
                },
            ],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        wrapper.vm.$router.replace({ query: { name: 'snew' }});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.name).toBe('old');
        expect(target).toBe('new');
    });
});
