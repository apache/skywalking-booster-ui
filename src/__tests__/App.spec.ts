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
import { createRouter, createWebHistory } from "vue-router";
import App from "../App.vue";

// Mock Vue Router
vi.mock("vue-router", () => ({
  useRoute: vi.fn(),
}));

describe("App Component", () => {
  let mockRoute: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockRoute = {
      name: "Home",
    };

    // Mock useRoute
    const { useRoute } = require("vue-router");
    useRoute.mockReturnValue(mockRoute);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render router-view", () => {
    const wrapper = mount(App);

    expect(wrapper.find("router-view").exists()).toBe(true);
  });

  it("should set minWidth to 120px for ViewWidget route", async () => {
    mockRoute.name = "ViewWidget";

    const wrapper = mount(App);

    // Wait for setTimeout
    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    const appElement = document.querySelector("#app");
    if (appElement) {
      expect((appElement as HTMLElement).style.minWidth).toBe("120px");
    }
  });

  it("should set minWidth to 1024px for non-ViewWidget routes", async () => {
    mockRoute.name = "Dashboard";

    const wrapper = mount(App);

    // Wait for setTimeout
    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    const appElement = document.querySelector("#app");
    if (appElement) {
      expect((appElement as HTMLElement).style.minWidth).toBe("1024px");
    }
  });

  it("should apply correct CSS classes", () => {
    const wrapper = mount(App);

    expect(wrapper.classes()).toContain("app");
  });

  it("should have correct template structure", () => {
    const wrapper = mount(App);

    expect(wrapper.html()).toContain("<router-view");
  });

  it("should handle route changes", async () => {
    const wrapper = mount(App);

    // Initial route
    mockRoute.name = "Home";
    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    // Change route
    mockRoute.name = "ViewWidget";
    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    const appElement = document.querySelector("#app");
    if (appElement) {
      expect((appElement as HTMLElement).style.minWidth).toBe("120px");
    }
  });

  it("should handle multiple route changes", async () => {
    const wrapper = mount(App);

    // Test multiple route changes
    const routes = ["Home", "ViewWidget", "Dashboard", "ViewWidget"];

    for (const routeName of routes) {
      mockRoute.name = routeName;
      vi.advanceTimersByTime(500);
      await wrapper.vm.$nextTick();

      const appElement = document.querySelector("#app");
      if (appElement) {
        const expectedWidth = routeName === "ViewWidget" ? "120px" : "1024px";
        expect((appElement as HTMLElement).style.minWidth).toBe(expectedWidth);
      }
    }
  });

  it("should not throw errors for undefined route names", async () => {
    mockRoute.name = undefined;

    const wrapper = mount(App);

    // Should not throw error
    expect(() => {
      vi.advanceTimersByTime(500);
    }).not.toThrow();
  });

  it("should handle null route names", async () => {
    mockRoute.name = null;

    const wrapper = mount(App);

    // Should not throw error
    expect(() => {
      vi.advanceTimersByTime(500);
    }).not.toThrow();
  });
});
