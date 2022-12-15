import { describe, it, expect } from "vitest";

// import { mount } from '@vue/test-utils'
// import HelloWorld from '../HelloWorld.vue'

// describe('HelloWorld', () => {
//   it('renders properly', () => {
//     const wrapper = mount(HelloWorld, { props: { msg: 'Hello Vitest' } })
//     expect(wrapper.text()).toContain('Hello Vitest')
//   })
// })
describe("My First Test", () => {
  it("renders props.msg when passed", () => {
    const msg = "new message";
    console.log(msg);
  });
});
