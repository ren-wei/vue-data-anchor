import { mount, createLocalVue } from '@vue/test-utils';
import { describe, it, expect } from '@jest/globals';
import { ComponentOptions } from 'vue';
// Why is VueRouter undefined?
// import VueRouter from 'vue-router';
const VueRouter = require('vue-router');
import Anchor from '../src/anchor';

const localVue = createLocalVue();
localVue.use(VueRouter);

const app: ComponentOptions<Vue> = {
    template: '<div></div>',
};
const router = new VueRouter({ routes: [{ path: '/', component: app }] });
const wrapper = mount(app, {
    localVue,
    router,
});
const anchor = new Anchor(wrapper.vm);

describe('method', () => {
    it('update', async() => {
        expect(() => anchor.update('update')).toThrow();
    });

    it('unpack', async() => {
        expect(anchor.unpack('sa')).toBe('a');
        expect(anchor.unpack(['t'])).toBeTruthy();
        expect(anchor.unpack(undefined)).toBeUndefined();
        expect(() => anchor.unpack([null])).toThrow();
    });

    it('unregister', async() => {
        const app: ComponentOptions<Vue> = {
            template: '<div></div>',
            data() {
                return {
                    name1: 'anchor',
                    count1: 1,
                    name2: 'anchor',
                    count2: 11,
                };
            },
            anchor: ['name1', 'count1', 'name2', 'count2'],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        // first change value
        wrapper.vm.$data.name1 = 'first change';
        wrapper.vm.$data.count1 = 2;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.name1)).toBe('first change');
        expect(anchor.unpack(wrapper.vm.$route.query.count1)).toBe(2);

        anchor.unregister('name1');
        anchor.unregister('count1', false);

        // second change value
        wrapper.vm.$data.name1 = 'second change';
        wrapper.vm.$data.count1 = 3;
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$route.query.name1).toBeUndefined();
        expect(anchor.unpack(wrapper.vm.$route.query.count1)).toBe(2);

        // first change router
        wrapper.vm.$router.replace({ query: {
            name2: 'schanged-first',
            count2: '012',
        }});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.name2).toBe('changed-first');
        expect(wrapper.vm.$data.count2).toBe(12);

        anchor.unregister('name2');
        anchor.unregister('count2', false);

        // second change router
        wrapper.vm.$router.replace({ query: {
            name2: 'schanged-second',
            count2: '013',
        }});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.name2).toBe('changed-first');
        expect(wrapper.vm.$data.count2).toBe(12);

        if (Object.keys(wrapper.vm.$route.query).length) wrapper.vm.$router.replace({ query: {}});
    });
});
