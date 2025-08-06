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
import Selector from "../Selector.vue";

describe("Selector Component", () => {
  let wrapper: Recordable;

  const mockOptions = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3", disabled: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Props", () => {
    it("should render with default props", () => {
      wrapper = mount(Selector);

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.vm.selected).toEqual([]);
    });

    it("should render with custom value", () => {
      wrapper = mount(Selector, {
        props: {
          options: mockOptions,
          value: "option1",
        },
      });

      expect(wrapper.vm.selected).toBe("option1");
    });

    it("should render in multiple mode", () => {
      wrapper = mount(Selector, {
        props: {
          options: mockOptions,
          multiple: true,
          value: ["option1", "option2"],
        },
      });

      expect(wrapper.vm.selected).toEqual(["option1", "option2"]);
    });

    it("should render with custom placeholder", () => {
      wrapper = mount(Selector, {
        props: {
          placeholder: "Custom placeholder",
        },
      });

      expect(wrapper.props("placeholder")).toBe("Custom placeholder");
    });

    it("should render with custom size", () => {
      wrapper = mount(Selector, {
        props: {
          size: "small",
        },
      });

      expect(wrapper.props("size")).toBe("small");
    });

    it("should render with custom border radius", () => {
      wrapper = mount(Selector, {
        props: {
          borderRadius: 8,
        },
      });

      expect(wrapper.props("borderRadius")).toBe(8);
    });

    it("should render in disabled mode", () => {
      wrapper = mount(Selector, {
        props: {
          disabled: true,
        },
      });

      expect(wrapper.props("disabled")).toBe(true);
    });

    it("should render with clearable option", () => {
      wrapper = mount(Selector, {
        props: {
          clearable: true,
        },
      });

      expect(wrapper.props("clearable")).toBe(true);
    });

    it("should render in remote mode", () => {
      wrapper = mount(Selector, {
        props: {
          isRemote: true,
        },
      });

      expect(wrapper.props("isRemote")).toBe(true);
    });

    it("should render with filterable option", () => {
      wrapper = mount(Selector, {
        props: {
          filterable: true,
        },
      });

      expect(wrapper.props("filterable")).toBe(true);
    });

    it("should render with collapse tags", () => {
      wrapper = mount(Selector, {
        props: {
          multiple: true,
          collapseTags: true,
        },
      });

      expect(wrapper.props("collapseTags")).toBe(true);
    });

    it("should render with collapse tags tooltip", () => {
      wrapper = mount(Selector, {
        props: {
          multiple: true,
          collapseTagsTooltip: true,
        },
      });

      expect(wrapper.props("collapseTagsTooltip")).toBe(true);
    });
  });

  describe("Component Structure", () => {
    it("should have correct template structure", () => {
      wrapper = mount(Selector, {
        props: {
          options: mockOptions,
        },
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.props("options")).toEqual(mockOptions);
    });

    it("should render options correctly", () => {
      wrapper = mount(Selector, {
        props: {
          options: mockOptions,
        },
      });

      expect(wrapper.props("options")).toEqual(mockOptions);
      expect(wrapper.props("options").length).toBe(3);
    });
  });

  describe("Event Handling", () => {
    it("should emit change event when selection changes", async () => {
      wrapper = mount(Selector, {
        props: {
          options: mockOptions,
        },
      });

      // Simulate selection change
      await wrapper.vm.changeSelected();

      expect(wrapper.emitted("change")).toBeTruthy();
    });

    it("should emit change event with correct data for single selection", async () => {
      wrapper = mount(Selector, {
        props: {
          options: mockOptions,
          value: "option1",
        },
      });

      await wrapper.vm.changeSelected();

      const emitted = wrapper.emitted("change");
      expect(emitted).toBeTruthy();
      expect(emitted[0][0]).toEqual([{ label: "Option 1", value: "option1" }]);
    });

    it("should emit change event with correct data for multiple selection", async () => {
      wrapper = mount(Selector, {
        props: {
          options: mockOptions,
          multiple: true,
          value: ["option1", "option2"],
        },
      });

      await wrapper.vm.changeSelected();

      const emitted = wrapper.emitted("change");
      expect(emitted).toBeTruthy();
      expect(emitted[0][0]).toEqual([
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" },
      ]);
    });

    it("should emit query event in remote mode", async () => {
      wrapper = mount(Selector, {
        props: {
          isRemote: true,
        },
      });

      await wrapper.vm.remoteMethod("test query");

      const emitted = wrapper.emitted("query");
      expect(emitted).toBeTruthy();
      expect(emitted[0][0]).toBe("test query");
    });

    it("should not emit query event when not in remote mode", async () => {
      wrapper = mount(Selector, {
        props: {
          isRemote: false,
        },
      });

      await wrapper.vm.remoteMethod("test query");

      expect(wrapper.emitted("query")).toBeFalsy();
    });
  });

  describe("Watchers", () => {
    it("should update selected value when props.value changes", async () => {
      wrapper = mount(Selector, {
        props: {
          options: mockOptions,
          value: "option1",
        },
      });

      expect(wrapper.vm.selected).toBe("option1");

      await wrapper.setProps({
        value: "option2",
      });
      await nextTick();

      expect(wrapper.vm.selected).toBe("option2");
    });

    it("should update selected value for multiple selection", async () => {
      wrapper = mount(Selector, {
        props: {
          options: mockOptions,
          multiple: true,
          value: ["option1"],
        },
      });

      expect(wrapper.vm.selected).toEqual(["option1"]);

      await wrapper.setProps({
        value: ["option1", "option2"],
      });
      await nextTick();

      expect(wrapper.vm.selected).toEqual(["option1", "option2"]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty options array", () => {
      wrapper = mount(Selector, {
        props: {
          options: [],
        },
      });

      expect(wrapper.props("options")).toEqual([]);
    });

    it("should handle undefined value", () => {
      wrapper = mount(Selector, {
        props: {
          options: mockOptions,
          value: undefined,
        },
      });

      // The component uses default value [] when value is undefined
      expect(wrapper.vm.selected).toEqual([]);
    });

    it("should handle null value", () => {
      wrapper = mount(Selector, {
        props: {
          options: mockOptions,
          value: null,
        },
      });

      expect(wrapper.vm.selected).toBeNull();
    });

    it("should handle changeSelected with no matching options", async () => {
      wrapper = mount(Selector, {
        props: {
          options: mockOptions,
          value: "nonexistent",
        },
      });

      await wrapper.vm.changeSelected();

      const emitted = wrapper.emitted("change");
      expect(emitted).toBeTruthy();
      expect(emitted[0][0]).toEqual([]);
    });
  });

  describe("Integration", () => {
    it("should work with all props combined", () => {
      wrapper = mount(Selector, {
        props: {
          options: mockOptions,
          value: "option1",
          size: "small",
          placeholder: "Select option",
          borderRadius: 5,
          multiple: false,
          disabled: false,
          clearable: true,
          isRemote: false,
          filterable: true,
          collapseTags: false,
          collapseTagsTooltip: false,
        },
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.vm.selected).toBe("option1");
      expect(wrapper.props("options")).toEqual(mockOptions);
    });

    it("should handle complex multiple selection scenario", async () => {
      wrapper = mount(Selector, {
        props: {
          options: mockOptions,
          multiple: true,
          value: ["option1"],
          clearable: true,
          filterable: true,
        },
      });

      expect(wrapper.vm.selected).toEqual(["option1"]);

      await wrapper.setProps({
        value: ["option1", "option2"],
      });
      await nextTick();

      expect(wrapper.vm.selected).toEqual(["option1", "option2"]);

      await wrapper.vm.changeSelected();

      const emitted = wrapper.emitted("change");
      expect(emitted).toBeTruthy();
      expect(emitted[0][0]).toEqual([
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" },
      ]);
    });
  });
});
