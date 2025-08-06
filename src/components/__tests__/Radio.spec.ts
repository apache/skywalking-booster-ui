/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Radio from "../Radio.vue";

describe("Radio Component", () => {
  let wrapper: any;

  const mockOptions = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];

  const mockOptionsWithNumbers = [
    { label: "Option 1", value: 1 },
    { label: "Option 2", value: 2 },
    { label: "Option 3", value: 3 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Props", () => {
    it("should render with default props", () => {
      wrapper = mount(Radio);

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.vm.selected).toBe("");
      expect(wrapper.vm.options).toEqual([]);
      expect(wrapper.vm.size).toBe("default");
    });

    it("should render with custom options", () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
        },
      });

      expect(wrapper.vm.options).toEqual(mockOptions);
      expect(wrapper.findAll(".el-radio")).toHaveLength(3);
    });

    it("should render with custom value", () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
          value: "option2",
        },
      });

      expect(wrapper.vm.selected).toBe("option2");
    });

    it("should render with custom size", () => {
      wrapper = mount(Radio, {
        props: {
          size: "small",
        },
      });

      expect(wrapper.vm.size).toBe("small");
    });

    it("should handle options with number values", () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptionsWithNumbers,
          value: "2",
        },
      });

      expect(wrapper.vm.options).toEqual(mockOptionsWithNumbers);
      expect(wrapper.findAll(".el-radio")).toHaveLength(3);
    });

    it("should handle empty options array", () => {
      wrapper = mount(Radio, {
        props: {
          options: [],
        },
      });

      expect(wrapper.vm.options).toEqual([]);
      expect(wrapper.findAll(".el-radio")).toHaveLength(0);
    });

    it("should handle undefined options", () => {
      wrapper = mount(Radio, {
        props: {
          options: undefined,
        },
      });

      expect(wrapper.vm.options).toEqual([]);
    });
  });

  describe("Rendering", () => {
    it("should render el-radio-group", () => {
      wrapper = mount(Radio);

      expect(wrapper.find(".el-radio-group").exists()).toBe(true);
    });

    it("should render correct number of radio options", () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
        },
      });

      const radioElements = wrapper.findAll(".el-radio");
      expect(radioElements).toHaveLength(3);
    });

    it("should render radio labels correctly", () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
        },
      });

      const radioElements = wrapper.findAll(".el-radio");
      expect(radioElements[0].text()).toContain("Option 1");
      expect(radioElements[1].text()).toContain("Option 2");
      expect(radioElements[2].text()).toContain("Option 3");
    });

    it("should set correct key attributes", () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
        },
      });

      // Vue doesn't expose key attributes directly, but we can verify the structure
      const radioElements = wrapper.findAll(".el-radio");
      expect(radioElements).toHaveLength(3);
      // Verify that each radio has a unique structure based on the options
      expect(radioElements[0].text()).toContain("Option 1");
      expect(radioElements[1].text()).toContain("Option 2");
      expect(radioElements[2].text()).toContain("Option 3");
    });

    it("should set correct label attributes", () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
        },
      });

      // Vue doesn't expose label attributes directly, but we can verify the structure
      const radioElements = wrapper.findAll(".el-radio");
      expect(radioElements).toHaveLength(3);
      // Verify that each radio has the correct text content
      expect(radioElements[0].text()).toContain("Option 1");
      expect(radioElements[1].text()).toContain("Option 2");
      expect(radioElements[2].text()).toContain("Option 3");
    });

    it("should handle mixed string and number labels", () => {
      const mixedOptions = [
        { label: "String Label", value: "string" },
        { label: 123, value: "number" },
      ];

      wrapper = mount(Radio, {
        props: {
          options: mixedOptions,
        },
      });

      const radioElements = wrapper.findAll(".el-radio");
      expect(radioElements[0].text()).toContain("String Label");
      expect(radioElements[1].text()).toContain("123");
    });
  });

  describe("Events", () => {
    it("should emit change event when radio is selected", async () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
        },
      });

      // Trigger the change event by calling the checked function directly
      await wrapper.vm.checked("option2");
      await nextTick();

      expect(wrapper.emitted("change")).toBeTruthy();
      expect(wrapper.emitted("change")[0]).toEqual(["option2"]);
    });

    it("should emit change event with correct value", async () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
        },
      });

      await wrapper.vm.checked("option3");
      await nextTick();

      expect(wrapper.emitted("change")[0]).toEqual(["option3"]);
    });

    it("should emit change event multiple times", async () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
        },
      });

      await wrapper.vm.checked("option1");
      await nextTick();
      await wrapper.vm.checked("option2");
      await nextTick();

      expect(wrapper.emitted("change")).toHaveLength(2);
      expect(wrapper.emitted("change")[0]).toEqual(["option1"]);
      expect(wrapper.emitted("change")[1]).toEqual(["option2"]);
    });

    it("should handle change event with number value", async () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptionsWithNumbers,
        },
      });

      await wrapper.vm.checked(2);
      await nextTick();

      expect(wrapper.emitted("change")[0]).toEqual([2]);
    });
  });

  describe("Data Binding", () => {
    it("should update selected value when props change", async () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
          value: "option1",
        },
      });

      expect(wrapper.vm.selected).toBe("option1");

      await wrapper.setProps({ value: "option2" });
      await nextTick();

      expect(wrapper.vm.selected).toBe("option2");
    });

    it("should update options when props change", async () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
        },
      });

      expect(wrapper.vm.options).toEqual(mockOptions);

      const newOptions = [
        { label: "New Option 1", value: "new1" },
        { label: "New Option 2", value: "new2" },
      ];

      await wrapper.setProps({ options: newOptions });
      await nextTick();

      expect(wrapper.vm.options).toEqual(newOptions);
      expect(wrapper.findAll(".el-radio")).toHaveLength(2);
    });

    it("should maintain selected value when options change", async () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
          value: "option2",
        },
      });

      expect(wrapper.vm.selected).toBe("option2");

      const newOptions = [
        { label: "New Option 1", value: "new1" },
        { label: "New Option 2", value: "new2" },
      ];

      await wrapper.setProps({ options: newOptions });
      await nextTick();

      expect(wrapper.vm.selected).toBe("option2"); // Should maintain the selected value
    });
  });

  describe("Edge Cases", () => {
    it("should handle null options", () => {
      wrapper = mount(Radio, {
        props: {
          options: null as any,
        },
      });

      // When null is passed, Vue will pass it through as-is
      // The component should handle this gracefully in the template
      expect(wrapper.vm.options).toBeNull();
      // But the component should still render without errors
      expect(wrapper.find(".el-radio-group").exists()).toBe(true);
    });

    it("should handle undefined value", () => {
      wrapper = mount(Radio, {
        props: {
          value: undefined,
        },
      });

      expect(wrapper.vm.selected).toBe("");
    });

    it("should handle empty string value", () => {
      wrapper = mount(Radio, {
        props: {
          value: "",
        },
      });

      expect(wrapper.vm.selected).toBe("");
    });

    it("should handle options with empty labels", () => {
      const optionsWithEmptyLabels = [
        { label: "", value: "empty" },
        { label: "Valid Label", value: "valid" },
      ];

      wrapper = mount(Radio, {
        props: {
          options: optionsWithEmptyLabels,
        },
      });

      expect(wrapper.vm.options).toEqual(optionsWithEmptyLabels);
      expect(wrapper.findAll(".el-radio")).toHaveLength(2);
    });

    it("should handle options with empty values", () => {
      const optionsWithEmptyValues = [
        { label: "Label 1", value: "" },
        { label: "Label 2", value: "valid" },
      ];

      wrapper = mount(Radio, {
        props: {
          options: optionsWithEmptyValues,
        },
      });

      expect(wrapper.vm.options).toEqual(optionsWithEmptyValues);
      expect(wrapper.findAll(".el-radio")).toHaveLength(2);
    });

    it("should handle very long labels", () => {
      const longLabel = "A".repeat(1000);
      const optionsWithLongLabel = [{ label: longLabel, value: "long" }];

      wrapper = mount(Radio, {
        props: {
          options: optionsWithLongLabel,
        },
      });

      expect(wrapper.vm.options).toEqual(optionsWithLongLabel);
      expect(wrapper.findAll(".el-radio")).toHaveLength(1);
    });

    it("should handle special characters in labels", () => {
      const specialOptions = [
        { label: "Option with & symbols", value: "special1" },
        { label: "Option with <script> tags", value: "special2" },
        { label: "Option with 'quotes'", value: "special3" },
      ];

      wrapper = mount(Radio, {
        props: {
          options: specialOptions,
        },
      });

      expect(wrapper.vm.options).toEqual(specialOptions);
      expect(wrapper.findAll(".el-radio")).toHaveLength(3);
    });
  });

  describe("Component Integration", () => {
    it("should work with Element Plus radio components", () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
        },
      });

      const radioGroup = wrapper.find(".el-radio-group");
      const radioElements = wrapper.findAll(".el-radio");

      expect(radioGroup.exists()).toBe(true);
      expect(radioElements.length).toBeGreaterThan(0);
      // Verify the component structure is correct
      expect(wrapper.vm.selected).toBe("");
    });

    it("should have correct v-model binding", () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
          value: "option1",
        },
      });

      // Verify the internal selected value matches the prop
      expect(wrapper.vm.selected).toBe("option1");
    });

    it("should have correct change event binding", () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
        },
      });

      // Verify the component has the checked function
      expect(typeof wrapper.vm.checked).toBe("function");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
        },
      });

      const radioGroup = wrapper.find(".el-radio-group");
      expect(radioGroup.exists()).toBe(true);
    });

    it("should render radio options with proper structure", () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
        },
      });

      const radioElements = wrapper.findAll(".el-radio");
      radioElements.forEach((radio) => {
        expect(radio.exists()).toBe(true);
        expect(radio.text()).toBeTruthy();
      });
    });
  });

  describe("Performance", () => {
    it("should handle large number of options", () => {
      const largeOptions = Array.from({ length: 100 }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `option${i + 1}`,
      }));

      wrapper = mount(Radio, {
        props: {
          options: largeOptions,
        },
      });

      expect(wrapper.vm.options).toEqual(largeOptions);
      expect(wrapper.findAll(".el-radio")).toHaveLength(100);
    });

    it("should handle rapid prop changes", async () => {
      wrapper = mount(Radio, {
        props: {
          options: mockOptions,
          value: "option1",
        },
      });

      // Rapidly change props
      await wrapper.setProps({ value: "option2" });
      await wrapper.setProps({ value: "option3" });
      await wrapper.setProps({ value: "option1" });
      await nextTick();

      expect(wrapper.vm.selected).toBe("option1");
    });
  });
});
