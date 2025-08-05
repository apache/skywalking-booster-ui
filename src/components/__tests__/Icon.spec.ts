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

import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Icon from "../Icon.vue";

describe("Icon Component", () => {
  it("should render with default props", () => {
    const wrapper = mount(Icon);

    expect(wrapper.find("svg").exists()).toBe(true);
    expect(wrapper.find("use").exists()).toBe(true);
    expect(wrapper.find("use").attributes("href")).toBe("#");
    expect(wrapper.classes()).toContain("icon");
    expect(wrapper.classes()).toContain("sm");
  });

  it("should render with custom icon name", () => {
    const wrapper = mount(Icon, {
      props: {
        iconName: "test-icon",
      },
    });

    expect(wrapper.find("use").attributes("href")).toBe("#test-icon");
  });

  it("should apply correct size classes", () => {
    const sizes = ["sm", "middle", "lg", "xl", "logo"];

    sizes.forEach((size) => {
      const wrapper = mount(Icon, {
        props: { size },
      });

      expect(wrapper.classes()).toContain(size);
    });
  });

  it("should apply loading class when loading prop is true", () => {
    const wrapper = mount(Icon, {
      props: {
        loading: true,
      },
    });

    expect(wrapper.classes()).toContain("loading");
  });

  it("should not apply loading class when loading prop is false", () => {
    const wrapper = mount(Icon, {
      props: {
        loading: false,
      },
    });

    expect(wrapper.classes()).not.toContain("loading");
  });

  it("should combine multiple classes correctly", () => {
    const wrapper = mount(Icon, {
      props: {
        size: "lg",
        loading: true,
      },
    });

    expect(wrapper.classes()).toContain("icon");
    expect(wrapper.classes()).toContain("lg");
    expect(wrapper.classes()).toContain("loading");
  });

  it("should have correct SVG structure", () => {
    const wrapper = mount(Icon, {
      props: {
        iconName: "test-icon",
      },
    });

    const svg = wrapper.find("svg");
    const use = wrapper.find("use");

    expect(svg.exists()).toBe(true);
    expect(use.exists()).toBe(true);
    expect(use.element.parentElement).toBe(svg.element);
  });
});
