import { shallowMount, mount, createLocalVue } from '@vue/test-utils';
import { describe, it, expect } from '@jest/globals';
// Why is VueRouter undefined?
// import VueRouter from 'vue-router';
const VueRouter = require('vue-router');
import Anchor from '../src/anchor';

const localVue = createLocalVue();
localVue.use(VueRouter);

describe('update', () => {
    it('Empty options should be generated before registration.', () => {
        const wrapper = shallowMount({
            template: '<div></div>',
        });
        const anchor = new Anchor(wrapper.vm);
        expect(Object.keys(anchor.options).length).toBe(0);
    });

    it('The changed the `key` value of a basic type should be bound to `$route.query[key]`.', async() => {
        const app = {
            template: '<div></div>',
            data() {
                return {
                    name: 'anchor',
                    count: 1,
                    big: BigInt(12345678987654321),
                    flag: false,
                    status: true,
                    dynamic: 'dynamic',
                };
            },
            anchor: ['name', 'count', 'big', 'flag', 'status', 'dynamic'],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        // change string value
        wrapper.vm.$data.name = 'changed-anchor';
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.name)).toBe('changed-anchor');

        // change number value
        wrapper.vm.$data.count = 2;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.count)).toBe(2);

        // change bigint value
        const value = BigInt(123456789876543210);
        wrapper.vm.$data.big = value;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.big)).toEqual(value);

        // change false value
        wrapper.vm.$data.flag = true;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.flag)).toBeTruthy();

        // change true value
        wrapper.vm.$data.status = false;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.status)).toBeFalsy();

        // change to undefined value
        wrapper.vm.$data.dynamic = undefined;
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$route.query.dynamic).toBe('-');

        // change to null value
        wrapper.vm.$data.dynamic = null;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.dynamic)).toBeNull();
    });

    it('The `key` value of the property of the changed object should be bound to `$route.query[key]`.', async() => {
        const app = {
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
        expect(anchor.unpack(wrapper.vm.$route.query['params.pageNum'])).toBe(2);
    });

    it('The `key` value of the object type should be bound to `$route.query[key]`.', async() => {
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
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;
        anchor.unregister('params.pageNum'); // Clean up the impact of other test cases.

        wrapper.vm.$data.params = { pageNum: 2 };
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query['params'])).toEqual({ pageNum: 2 });

        wrapper.vm.$data.params.pageNum = 3;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query['params'])).toEqual({ pageNum: 3 });
    });

    it('When the `key` value is the same as the default value, delete the `$route.query[key]`', async() => {
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

        // change string value
        wrapper.vm.$data.name = 'change';
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.name)).toBe('change');

        // change string value to default
        wrapper.vm.$data.name = 'anchor';
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.name)).toBeUndefined();
    });

    it('When the default value is a function, the function should be executed to get the default value.', async() => {
        let flag = false;
        const app = {
            template: '<div></div>',
            data() {
                return {
                    name: 'anchor',
                };
            },
            anchor: [{
                key: 'name',
                defaults(key: string) {
                    expect(key).toBe('name');
                    flag = true;
                    return 'defaults';
                },
            }],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        expect(flag).toBeTruthy();
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.name)).toBe('anchor');

        wrapper.vm.$data.name = 'defaults';
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.name)).toBeUndefined();
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

        // first change string value
        wrapper.vm.$data.name = 'first change';
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.name)).toBe('first change');

        // first change number value
        wrapper.vm.$data.count = 2;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.count)).toBe(2);

        anchor.unregister('name');

        // second change string value
        wrapper.vm.$data.name = 'second change';
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.name)).toBe('first change');

        // second change number value
        wrapper.vm.$data.count = 3;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.count)).toBe(3);
    });

    it('Binding the symbol value should throw an error.', async() => {
        const app = {
            template: '<div></div>',
            data() {
                return {
                    sym: Symbol('sym'),
                };
            },
            anchor: ['sym'],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        expect(() => new Anchor(wrapper.vm)).toThrow();
    });
});
