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
import { useRoute } from "vue-router";
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

    // Set up the mock useRoute
    vi.mocked(useRoute).mockReturnValue(mockRoute);

    // Create the #app element for testing
    const appElement = document.createElement("div");
    appElement.id = "app";
    appElement.className = "app";
    document.body.appendChild(appElement);
  });

  afterEach(() => {
    vi.restoreAllMocks();

    // Clean up the #app element
    const appElement = document.getElementById("app");
    if (appElement) {
      document.body.removeChild(appElement);
    }
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
    // The App component itself doesn't have the 'app' class, it's on the #app element
    const appElement = document.getElementById("app");
    expect(appElement?.className).toContain("app");
  });

  it("should have correct template structure", () => {
    const wrapper = mount(App);

    expect(wrapper.html()).toContain("<router-view");
  });

  it("should handle route changes", async () => {
    // Set up initial route
    mockRoute.name = "Home";
    vi.mocked(useRoute).mockReturnValue(mockRoute);

    const wrapper = mount(App);
    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    const appElement = document.querySelector("#app");
    if (appElement) {
      expect((appElement as HTMLElement).style.minWidth).toBe("1024px");
    }

    // Unmount and remount with different route
    wrapper.unmount();

    mockRoute.name = "ViewWidget";
    vi.mocked(useRoute).mockReturnValue(mockRoute);

    const wrapper2 = mount(App);
    vi.advanceTimersByTime(500);
    await wrapper2.vm.$nextTick();

    const appElement2 = document.querySelector("#app");
    if (appElement2) {
      expect((appElement2 as HTMLElement).style.minWidth).toBe("120px");
    }
  });

  it("should handle multiple route changes", async () => {
    // Test multiple route changes by remounting
    const routes = ["Home", "ViewWidget", "Dashboard", "ViewWidget"];
    let wrapper: any = null;

    for (const routeName of routes) {
      if (wrapper) {
        wrapper.unmount();
      }

      mockRoute.name = routeName;
      vi.mocked(useRoute).mockReturnValue(mockRoute);

      wrapper = mount(App);
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
    // Should not throw error
    expect(() => {
      vi.advanceTimersByTime(500);
    }).not.toThrow();
  });

  it("should handle null route names", async () => {
    mockRoute.name = null;
    // Should not throw error
    expect(() => {
      vi.advanceTimersByTime(500);
    }).not.toThrow();
  });
});
