import { mount, createLocalVue } from '@vue/test-utils';
import { describe, it, expect } from '@jest/globals';
// Why is VueRouter undefined?
// import VueRouter from 'vue-router';
const VueRouter = require('vue-router');
import Anchor from '../src/anchor';

const localVue = createLocalVue();
localVue.use(VueRouter);

const app = {
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
});
