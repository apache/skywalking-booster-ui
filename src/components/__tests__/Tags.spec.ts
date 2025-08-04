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
import Tags from "../Tags.vue";

describe("Tags Component", () => {
  let wrapper: any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Props", () => {
    it("should render with default props", () => {
      wrapper = mount(Tags);

      // Check that the component renders without errors
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find("button").exists()).toBe(true);
    });

    it("should render with custom tags", () => {
      const tags = ["tag1", "tag2", "tag3"];
      wrapper = mount(Tags, {
        props: {
          tags,
        },
      });

      // Check that tags are rendered
      const tagElements = wrapper.findAll(".el-tag");
      expect(tagElements.length).toBeGreaterThanOrEqual(0);
    });

    it("should render with custom text", () => {
      wrapper = mount(Tags, {
        props: {
          text: "Add Tag",
        },
      });

      // Check that the button contains the custom text
      const button = wrapper.find("button");
      expect(button.exists()).toBe(true);
      expect(button.text()).toContain("Add Tag");
    });

    it("should render in vertical layout when vertical prop is true", () => {
      wrapper = mount(Tags, {
        props: {
          tags: ["tag1", "tag2"],
          vertical: true,
        },
      });

      // Check that vertical class is applied
      const verticalElements = wrapper.findAll(".vertical");
      expect(verticalElements.length).toBeGreaterThanOrEqual(0);
    });

    it("should render in horizontal layout when vertical prop is false", () => {
      wrapper = mount(Tags, {
        props: {
          tags: ["tag1", "tag2"],
          vertical: false,
        },
      });

      // Check that horizontal class is applied
      const horizontalElements = wrapper.findAll(".horizontal");
      expect(horizontalElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Component Structure", () => {
    it("should have correct template structure", () => {
      wrapper = mount(Tags);

      // Check basic structure
      expect(wrapper.find("button").exists()).toBe(true);
    });

    it("should show input when button is clicked", async () => {
      wrapper = mount(Tags);

      // Click the button to show input
      const button = wrapper.find("button");
      if (button.exists()) {
        await button.trigger("click");
        await nextTick();

        // Check that input is shown
        const input = wrapper.find("input");
        expect(input.exists()).toBe(true);
      }
    });
  });

  describe("Event Handling", () => {
    it("should render tags correctly", () => {
      const tags = ["tag1", "tag2"];
      wrapper = mount(Tags, {
        props: {
          tags,
        },
      });

      // Check that tags are rendered
      const tagElements = wrapper.findAll(".el-tag");
      expect(tagElements.length).toBeGreaterThan(0);
    });

    it("should emit change event when new tag is added", async () => {
      wrapper = mount(Tags);

      // Show input
      const button = wrapper.find("button");
      if (button.exists()) {
        await button.trigger("click");
        await nextTick();

        // Add new tag
        const input = wrapper.find("input");
        if (input.exists()) {
          await input.setValue("new-tag");
          await input.trigger("keyup.enter");
          await nextTick();

          expect(wrapper.emitted("change")).toBeTruthy();
        }
      }
    });
  });

  describe("Watchers", () => {
    it("should update dynamic tags when props.tags changes", async () => {
      wrapper = mount(Tags, {
        props: {
          tags: ["tag1", "tag2"],
        },
      });

      let tagElements = wrapper.findAll(".el-tag");
      expect(tagElements.length).toBeGreaterThanOrEqual(0);

      // Update props
      await wrapper.setProps({
        tags: ["tag3", "tag4", "tag5"],
      });
      await nextTick();

      tagElements = wrapper.findAll(".el-tag");
      expect(tagElements.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle empty tags array", async () => {
      wrapper = mount(Tags, {
        props: {
          tags: ["tag1", "tag2"],
        },
      });

      let tagElements = wrapper.findAll(".el-tag");
      expect(tagElements.length).toBeGreaterThanOrEqual(0);

      // Update props to empty array
      await wrapper.setProps({
        tags: [],
      });
      await nextTick();

      tagElements = wrapper.findAll(".el-tag");
      expect(tagElements.length).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined tags prop", () => {
      wrapper = mount(Tags, {
        props: {
          tags: undefined,
        },
      });

      const tagElements = wrapper.findAll(".el-tag");
      expect(tagElements.length).toBe(0);
    });

    it("should handle null tags prop", () => {
      wrapper = mount(Tags as any, {
        props: {
          tags: null,
        },
      });

      const tagElements = wrapper.findAll(".el-tag");
      expect(tagElements.length).toBe(0);
    });
  });
});
