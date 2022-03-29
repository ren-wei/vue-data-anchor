import { shallowMount, mount, createLocalVue } from '@vue/test-utils';
import { describe, it, expect } from '@jest/globals';
// Why is VueRouter undefined?
// import VueRouter from 'vue-router';
const VueRouter = require('vue-router');
import Anchor from '../src/anchor';

const localVue = createLocalVue();
localVue.use(VueRouter);

describe('restore', () => {
    it('Unconfigured options should not be reverted.', async() => {});
    it('Options that should restore the bound primitive type.', async() => {});
    it('Options that should restore the bound object type.', async() => {});
    it('When $route.query changes, the data should follow the change.', async() => {});
    it('When unregister `key` value, unbind the value.', async() => {});
});
