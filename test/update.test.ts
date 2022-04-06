import { shallowMount, mount, createLocalVue } from '@vue/test-utils';
import { describe, it, expect } from '@jest/globals';
import { ComponentOptions } from 'vue';
// Why is VueRouter undefined?
// import VueRouter from 'vue-router';
const VueRouter = require('vue-router');
import Anchor from '../src/anchor';

const localVue = createLocalVue();
localVue.use(VueRouter);

describe('update', () => {
    it('Empty options should be generated before registration.', () => {
        const app: ComponentOptions<Vue> = {
            template: '<div></div>',
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        expect(Object.keys(anchor.options).length).toBe(0);

        if (Object.keys(wrapper.vm.$route.query).length) wrapper.vm.$router.replace({ query: {}});
    });

    it('The changed the `key` value of a basic type should be bound to `$route.query[key]`.', async() => {
        const app: ComponentOptions<Vue> = {
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
            anchor: ['name', 'count', 'big', 'flag', 'status', 'empty', 'dynamic'],
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

        if (Object.keys(wrapper.vm.$route.query).length) wrapper.vm.$router.replace({ query: {}});
    });

    it('When the `key` value is the same as the default value, delete the `$route.query[key]`', async() => {
        const app: ComponentOptions<Vue> = {
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

        if (Object.keys(wrapper.vm.$route.query).length) wrapper.vm.$router.replace({ query: {}});
    });

    it('When the default value is a function, the function should be executed to get the default value.', async() => {
        let flag = false;
        const app: ComponentOptions<Vue> = {
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
                    expect(this === wrapper.vm).toBeTruthy();
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

        if (Object.keys(wrapper.vm.$route.query).length) wrapper.vm.$router.replace({ query: {}});
    });

    it('Binding the symbol value should throw an error.', async() => {
        const app: ComponentOptions<Vue> = {
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

        if (Object.keys(wrapper.vm.$route.query).length) wrapper.vm.$router.replace({ query: {}});
    });
});
