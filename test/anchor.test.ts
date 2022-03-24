import { shallowMount } from '@vue/test-utils';
import Anchor from '../src/anchor';
import { describe, it, expect } from '@jest/globals';

describe('Anchor', () => {
    it('Empty options should be generated before registration.', () => {
        const wrapper = shallowMount({
            template: '<div></div>',
        });
        const anchor = new Anchor(wrapper.vm);
        expect(Object.keys(anchor.options).length).toBe(0);
    });
});
