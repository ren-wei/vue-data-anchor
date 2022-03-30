import { shallowMount, mount, createLocalVue } from '@vue/test-utils';
import { describe, it, expect } from '@jest/globals';
// Why is VueRouter undefined?
// import VueRouter from 'vue-router';
const VueRouter = require('vue-router');
import Anchor from '../src/anchor';

const localVue = createLocalVue();
localVue.use(VueRouter);

describe('restore', () => {
    it('Unconfigured options should not be reverted.', async() => {
        const app = {
            template: '<div></div>',
            data() {
                return {
                    name: 'anchor',
                    count: 1,
                    big: BigInt(12345678987654321),
                    flag: false,
                    dynamic: 'dynamic',
                };
            },
            anchor: ['count', 'big', 'flag', 'dynamic'],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });

        wrapper.vm.$router.replace({ query: { name: 'schanged-anchor' }});
        await wrapper.vm.$nextTick();

        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        expect(wrapper.vm.$data.name).toBe('anchor');
    });

    it('Options that should restore the bound primitive type.', async() => {
        const app = {
            template: '<div></div>',
            data() {
                return {
                    name: 'anchor',
                    count: 1,
                    big: BigInt(12345678987654321),
                    flag: false,
                    dynamic: 'dynamic',
                };
            },
            anchor: ['name', 'count', 'big', 'flag', 'dynamic'],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });

        wrapper.vm.$router.replace({ query: {
            name: 'schanged-name',
            count: '011',
            big: 'i1234567898765432',
            flag: 't',
            dynamic: 'u',
        }});
        await wrapper.vm.$nextTick();

        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        expect(wrapper.vm.$data.name).toBe('changed-name');
        expect(wrapper.vm.$data.count).toBe(11);
        expect(typeof wrapper.vm.$data.big).toBe('bigint');
        expect(wrapper.vm.$data.big.toString()).toBe('1234567898765432');
        expect(wrapper.vm.$data.flag).toBeTruthy();
        expect(wrapper.vm.$data.dynamic).toBeNull();
    });

    it('Options that should restore the bound object type.', async() => {
        const app = {
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

        wrapper.vm.$router.replace({ query: {
            params: '*' + JSON.stringify({ pageNum: 11 }),
        }});
        await wrapper.vm.$nextTick();

        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        expect(wrapper.vm.$data.params).toEqual({ pageNum: 11 });
    });

    it('When $route.query changes, the data should follow the change.', async() => {
        const app = {
            template: '<div></div>',
            data() {
                return {
                    name: 'anchor',
                    count: 1,
                    big: BigInt(12345678987654321),
                    flag: false,
                    dynamic: 'dynamic',
                };
            },
            anchor: ['name', 'count', 'big', 'flag', 'dynamic'],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });

        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        wrapper.vm.$router.replace({ query: { name: 'schanged-restore' }});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.name).toBe('changed-restore');

        wrapper.vm.$router.replace({ query: { count: '021' }});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.count).toBe(21);

        wrapper.vm.$router.replace({ query: { big: 'i12345678987654' }});
        await wrapper.vm.$nextTick();
        expect(typeof wrapper.vm.$data.big).toBe('bigint');
        expect(wrapper.vm.$data.big.toString()).toBe('12345678987654');

        wrapper.vm.$router.replace({ query: { flag: 't' }});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.flag).toBeTruthy();

        wrapper.vm.$router.replace({ query: { dynamic: '-' }});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.dynamic).toBeUndefined();

        wrapper.vm.$router.replace({ query: { dynamic: 'u' }});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.dynamic).toBeNull();
    });

    it('When unregister `key` value, unbind the value.', async() => {
        const app = {
            template: '<div></div>',
            data() {
                return {
                    name: 'anchor',
                    count: 1,
                    big: BigInt(12345678987654321),
                    flag: false,
                    dynamic: 'dynamic',
                };
            },
            anchor: ['name', 'count', 'big', 'flag', 'dynamic'],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        wrapper.vm.$router.replace({ query: {
            name: 'schanged-first',
            count: '031',
        }});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.name).toBe('changed-first');
        expect(wrapper.vm.$data.count).toBe(31);

        anchor.unregister('name');

        wrapper.vm.$router.replace({ query: {
            name: 'schanged-second',
            count: '041',
        }});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.name).toBe('changed-first');
        expect(wrapper.vm.$data.count).toBe(41);
    });

    it('A value that cannot be restored should throw an error.', async() => {
        const app = {
            template: '<div></div>',
            data() {
                return {
                    name: 'anchor',
                };
            },
            anchor: ['name'],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        expect(() => anchor.unpack('change')).toThrowError();
    });
});
