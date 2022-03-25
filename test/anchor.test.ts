import { shallowMount, mount, createLocalVue } from '@vue/test-utils';
import { describe, it, expect } from '@jest/globals';
// Why is VueRouter undefined?
// import VueRouter from 'vue-router';
const VueRouter = require('vue-router');
import Anchor from '../src/anchor';

const localVue = createLocalVue();
localVue.use(VueRouter);

describe('Anchor', () => {
    it('Empty options should be generated before registration.', () => {
        const wrapper = shallowMount({
            template: '<div></div>',
        });
        const anchor = new Anchor(wrapper.vm);
        expect(Object.keys(anchor.options).length).toBe(0);
    });

    it('The changed `key` value should be bound to `$route.query[key]`.', async() => {
        const app = {
            template: '<div></div>',
            data() {
                return {
                    name: 'anchor',
                    count: 1,
                    big: BigInt(12345678987654321),
                    flag: false,
                };
            },
            anchor: ['name', 'count', 'big', 'flag'],
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

        // change boolean value
        wrapper.vm.$data.flag = true;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.flag)).toBeTruthy();
    });
});
