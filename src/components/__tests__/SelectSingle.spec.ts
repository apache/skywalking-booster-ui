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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import SelectSingle from "../SelectSingle.vue";

describe("SelectSingle Component", () => {
  let wrapper: Recordable;

  const mockOptions = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock document.body.addEventListener
    vi.spyOn(document.body, "addEventListener").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Props", () => {
    it("should render with default props", () => {
      wrapper = mount(SelectSingle);

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find(".bar-select").exists()).toBe(true);
      expect(wrapper.find(".no-data").text()).toBe("Please select a option");
    });

    it("should render with custom options", () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
        },
      });

      expect(wrapper.props("options")).toEqual(mockOptions);
    });

    it("should render with selected value", () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
          value: "option1",
        },
      });

      expect(wrapper.vm.selected.value).toBe("option1");
      expect(wrapper.vm.selected.label).toBe("Option 1");
    });

    it("should render with clearable option", () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
          value: "option1",
          clearable: true,
        },
      });

      expect(wrapper.props("clearable")).toBe(true);
      expect(wrapper.find(".remove-icon").exists()).toBe(true);
    });

    it("should not show remove icon when clearable is false", () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
          value: "option1",
          clearable: false,
        },
      });

      expect(wrapper.find(".remove-icon").exists()).toBe(false);
    });
  });

  describe("Component Structure", () => {
    it("should have correct template structure", () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
        },
      });

      expect(wrapper.find(".bar-select").exists()).toBe(true);
      expect(wrapper.find(".bar-i").exists()).toBe(true);
      expect(wrapper.find(".opt-wrapper").exists()).toBe(true);
    });

    it("should render options correctly", () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
        },
      });

      const options = wrapper.findAll(".opt");
      expect(options.length).toBe(3);
      expect(options[0].text()).toBe("Option 1");
      expect(options[1].text()).toBe("Option 2");
      expect(options[2].text()).toBe("Option 3");
    });

    it("should show selected option text", () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
          value: "option1",
        },
      });

      expect(wrapper.find(".bar-i span").text()).toBe("Option 1");
    });

    it("should show placeholder when no option is selected", () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
          value: "",
        },
      });

      expect(wrapper.find(".no-data").text()).toBe("Please select a option");
    });
  });

  describe("Event Handling", () => {
    it("should emit change event when option is selected", async () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
        },
      });

      // Open dropdown
      await wrapper.find(".bar-i").trigger("click");
      await nextTick();

      // Select an option
      await wrapper.find(".opt").trigger("click");

      expect(wrapper.emitted("change")).toBeTruthy();
      expect(wrapper.emitted("change")[0][0]).toBe("option1");
    });

    it("should emit change event with empty string when remove is clicked", async () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
          value: "option1",
          clearable: true,
        },
      });

      await wrapper.find(".remove-icon").trigger("click");

      expect(wrapper.emitted("change")).toBeTruthy();
      expect(wrapper.emitted("change")[0][0]).toBe("");
    });

    it("should toggle dropdown visibility when bar-i is clicked", async () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
        },
      });

      expect(wrapper.vm.visible).toBe(false);

      await wrapper.find(".bar-i").trigger("click");
      expect(wrapper.vm.visible).toBe(true);

      await wrapper.find(".bar-i").trigger("click");
      expect(wrapper.vm.visible).toBe(false);
    });

    it("should not select disabled option", async () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
          value: "option1",
        },
      });

      // Open dropdown
      await wrapper.find(".bar-i").trigger("click");
      await nextTick();

      // Try to select the already selected option (which should be disabled)
      const disabledOption = wrapper.find(".select-disabled");
      expect(disabledOption.exists()).toBe(true);
      expect(disabledOption.text()).toBe("Option 1");
    });
  });

  describe("Watchers", () => {
    it("should update selected value when props.value changes", async () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
          value: "option1",
        },
      });

      expect(wrapper.vm.selected.value).toBe("option1");

      await wrapper.setProps({
        value: "option2",
      });
      await nextTick();

      expect(wrapper.vm.selected.value).toBe("option2");
      expect(wrapper.vm.selected.label).toBe("Option 2");
    });

    it("should handle value change to empty string", async () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
          value: "option1",
        },
      });

      expect(wrapper.vm.selected.value).toBe("option1");

      await wrapper.setProps({
        value: "",
      });
      await nextTick();

      expect(wrapper.vm.selected.value).toBe("");
      expect(wrapper.vm.selected.label).toBe("");
    });

    it("should handle value change to non-existent option", async () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
          value: "option1",
        },
      });

      expect(wrapper.vm.selected.value).toBe("option1");

      await wrapper.setProps({
        value: "nonexistent",
      });
      await nextTick();

      expect(wrapper.vm.selected.value).toBe("");
      expect(wrapper.vm.selected.label).toBe("");
    });
  });

  describe("Methods", () => {
    it("should handle select option correctly", async () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
        },
      });

      await wrapper.vm.handleSelect(mockOptions[1]);

      expect(wrapper.vm.selected.value).toBe("option2");
      expect(wrapper.vm.selected.label).toBe("Option 2");
      expect(wrapper.emitted("change")[0][0]).toBe("option2");
    });

    it("should handle remove selected correctly", async () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
          value: "option1",
        },
      });

      await wrapper.vm.removeSelected();

      expect(wrapper.vm.selected.value).toBe("");
      expect(wrapper.vm.selected.label).toBe("");
      expect(wrapper.emitted("change")[0][0]).toBe("");
    });

    it("should handle setPopper correctly", async () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
        },
      });

      const event = { stopPropagation: vi.fn() };
      await wrapper.vm.setPopper(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(wrapper.vm.visible).toBe(true);
    });

    it("should handle click outside correctly", async () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
        },
      });

      // Open dropdown
      await wrapper.find(".bar-i").trigger("click");
      expect(wrapper.vm.visible).toBe(true);

      // Simulate click outside
      await wrapper.vm.handleClick();
      expect(wrapper.vm.visible).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty options array", () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: [],
        },
      });

      expect(wrapper.props("options")).toEqual([]);
      expect(wrapper.findAll(".opt").length).toBe(0);
    });

    it("should handle undefined value", () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
          value: undefined,
        },
      });

      expect(wrapper.vm.selected.value).toBe("");
      expect(wrapper.vm.selected.label).toBe("");
    });

    it("should handle null value", () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
          value: null as any,
        },
      });

      expect(wrapper.vm.selected.value).toBe("");
      expect(wrapper.vm.selected.label).toBe("");
    });

    it("should handle options with empty values", () => {
      const optionsWithEmptyValues = [
        { label: "Option 1", value: "" },
        { label: "Option 2", value: "option2" },
      ];

      wrapper = mount(SelectSingle, {
        props: {
          options: optionsWithEmptyValues,
          value: "",
        },
      });

      expect(wrapper.vm.selected.value).toBe("");
      expect(wrapper.vm.selected.label).toBe("Option 1");
    });
  });

  describe("Integration", () => {
    it("should work with all props combined", () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
          value: "option1",
          clearable: true,
        },
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.vm.selected.value).toBe("option1");
      expect(wrapper.vm.selected.label).toBe("Option 1");
      expect(wrapper.props("clearable")).toBe(true);
      expect(wrapper.find(".remove-icon").exists()).toBe(true);
    });

    it("should handle complete selection workflow", async () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
          clearable: true,
        },
      });

      // Initially no selection
      expect(wrapper.vm.selected.value).toBe("");
      expect(wrapper.find(".no-data").text()).toBe("Please select a option");

      // Open dropdown
      await wrapper.find(".bar-i").trigger("click");
      expect(wrapper.vm.visible).toBe(true);

      // Select an option
      await wrapper.find(".opt").trigger("click");
      expect(wrapper.vm.selected.value).toBe("option1");
      expect(wrapper.emitted("change")[0][0]).toBe("option1");

      // Clear selection
      await wrapper.find(".remove-icon").trigger("click");
      expect(wrapper.vm.selected.value).toBe("");
      expect(wrapper.emitted("change")[1][0]).toBe("");
    });

    it("should handle dropdown toggle and option selection", async () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
        },
      });

      // Toggle dropdown
      await wrapper.find(".bar-i").trigger("click");
      expect(wrapper.vm.visible).toBe(true);

      // Select option
      const options = wrapper.findAll(".opt");
      await options[1].trigger("click");

      expect(wrapper.vm.selected.value).toBe("option2");
      expect(wrapper.emitted("change")[0][0]).toBe("option2");
      expect(wrapper.vm.visible).toBe(true); // Should stay open after selection
    });
  });

  describe("CSS Classes", () => {
    it("should apply active class when dropdown is visible", async () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
        },
      });

      expect(wrapper.find(".bar-select").classes()).not.toContain("active");

      await wrapper.find(".bar-i").trigger("click");
      expect(wrapper.find(".bar-select").classes()).toContain("active");
    });

    it("should apply select-disabled class to selected option", async () => {
      wrapper = mount(SelectSingle, {
        props: {
          options: mockOptions,
          value: "option1",
        },
      });

      await wrapper.find(".bar-i").trigger("click");
      await nextTick();

      const options = wrapper.findAll(".opt");
      expect(options[0].classes()).toContain("select-disabled");
      expect(options[1].classes()).not.toContain("select-disabled");
      expect(options[2].classes()).not.toContain("select-disabled");
    });
  });
});
