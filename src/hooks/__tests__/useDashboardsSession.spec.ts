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
import { ConfigFieldTypes } from "@/views/dashboard/data";
import getDashboard from "../useDashboardsSession";
import { ElMessage } from "element-plus";

// Mock ElMessage from element-plus
vi.mock("element-plus", () => ({
  ElMessage: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

// Mock dashboard store
let mockDashboardStore: any;
vi.mock("@/store/modules/dashboard", () => ({
  useDashboardStore: () => mockDashboardStore,
}));

function setupContainers() {
  document.body.innerHTML = "";
  const main = document.createElement("div");
  main.className = "ds-main";
  // allow scrollTop to be writable in jsdom
  Object.defineProperty(main, "scrollTop", { value: 0, writable: true });

  const tab = document.createElement("div");
  tab.className = "tab-layout";
  Object.defineProperty(tab, "scrollTop", { value: 0, writable: true });

  document.body.appendChild(main);
  document.body.appendChild(tab);
}

describe("useDashboardsSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    setupContainers();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("selects dashboard by NAME using param and flattens widgets (including Tab children)", () => {
    const dashboards = [
      { name: "A", layer: "L1", entity: "Service", isDefault: false },
      { name: "B", layer: "L1", entity: "Service", isDefault: true },
    ];
    sessionStorage.setItem("dashboards", JSON.stringify(dashboards));

    // layout: Tab with grandchildren + a non-tab widget
    const layout = [
      {
        type: "Tab",
        id: "tab0",
        y: 10,
        h: 20,
        children: [
          { name: "Tab1", children: [] },
          {
            name: "Tab2",
            children: [
              { type: "Card", id: "tab0-1-0", y: 5, h: 10 },
              { type: "Line", id: "tab0-1-1", y: 6, h: 12 },
            ],
          },
        ],
      },
      { type: "Line", id: "wid1", y: 2, h: 4 },
    ];

    const setWidget = vi.fn();
    const setActiveTabIndex = vi.fn();
    mockDashboardStore = {
      layout,
      currentDashboard: { name: "B", layer: "L1", entity: "Service" },
      setWidget,
      setActiveTabIndex,
    };

    const { dashboard, widgets } = getDashboard({ name: "A", layer: "L1", entity: "Service" }, ConfigFieldTypes.NAME);

    expect(dashboard).toEqual(dashboards[0]);
    // widgets should include: Tab itself + grandchildren (2) + non-tab (1) = 4
    expect(widgets).toHaveLength(4);
    expect(widgets.map((w: any) => w.id)).toEqual(["tab0", "tab0-1-0", "tab0-1-1", "wid1"]);
  });

  it("selects dashboard by ISDEFAULT using currentDashboard when param omitted", () => {
    const dashboards = [
      { name: "A", layer: "L1", entity: "Service", isDefault: false },
      { name: "B", layer: "L1", entity: "Service", isDefault: true },
    ];
    sessionStorage.setItem("dashboards", JSON.stringify(dashboards));

    mockDashboardStore = {
      layout: [],
      currentDashboard: { name: "C", layer: "L1", entity: "Service" },
      setWidget: vi.fn(),
      setActiveTabIndex: vi.fn(),
    };

    const { dashboard } = getDashboard(undefined, ConfigFieldTypes.ISDEFAULT);
    expect(dashboard).toEqual(dashboards[1]);
  });

  it("associationWidget: non-tab widget scrolls main container and sets widget", () => {
    const layout = [{ type: "Line", id: "wid1", y: 3, h: 7 }];
    const setWidget = vi.fn();
    const setActiveTabIndex = vi.fn();
    mockDashboardStore = { layout, currentDashboard: {}, setWidget, setActiveTabIndex };

    const { associationWidget } = getDashboard({ name: "A", layer: "L1", entity: "Service" }, ConfigFieldTypes.NAME);

    associationWidget("src", { k: 1 }, "Line");

    expect(setWidget).toHaveBeenCalledTimes(1);
    const arg = setWidget.mock.calls[0][0];
    expect(arg.filters).toEqual({ k: 1 });
    expect(arg.id).toBe("wid1");

    // No tab index change for non-tab widget
    expect(setActiveTabIndex).not.toHaveBeenCalled();

    const main = document.querySelector(".ds-main") as HTMLElement;
    expect(main.scrollTop).toBe(3 * 10 + 7 * 5);
  });

  it("associationWidget: tab child widget sets active tab and scrolls both containers", () => {
    const layout = [
      {
        type: "Tab",
        id: "tab0",
        y: 10,
        h: 20,
        children: [
          { name: "Tab1", children: [] },
          { name: "Tab2", children: [{ type: "Card", id: "tab0-1-0", y: 5, h: 10 }] },
        ],
      },
    ];
    const setWidget = vi.fn();
    const setActiveTabIndex = vi.fn();
    mockDashboardStore = { layout, currentDashboard: {}, setWidget, setActiveTabIndex };

    const { associationWidget } = getDashboard({ name: "A", layer: "L1", entity: "Service" }, ConfigFieldTypes.NAME);

    associationWidget("tab0-0-9", { f: true }, "Card");

    // set widget called with merged filters
    expect(setWidget).toHaveBeenCalledTimes(1);
    expect(setWidget.mock.calls[0][0].id).toBe("tab0-1-0");
    expect(setWidget.mock.calls[0][0].filters).toEqual({ f: true });

    // active tab index set to 1 (from target id tab0-1-0)
    expect(setActiveTabIndex).toHaveBeenCalledWith(1);

    const main = document.querySelector(".ds-main") as HTMLElement;
    const tab = document.querySelector(".tab-layout") as HTMLElement;
    expect(main.scrollTop).toBe(10 * 10 + 20 * 5); // scroll to Tab container
    expect(tab.scrollTop).toBe(5 * 10 + 10 * 5); // scroll to widget inside tab layout
  });

  it("associationWidget: when widget is missing, shows info message", () => {
    const layout: any[] = [{ type: "Line", id: "wid1", y: 0, h: 0 }];
    mockDashboardStore = { layout, currentDashboard: {}, setWidget: vi.fn(), setActiveTabIndex: vi.fn() };

    const { associationWidget } = getDashboard({ name: "A", layer: "L1", entity: "Service" }, ConfigFieldTypes.NAME);
    associationWidget("src", {}, "Table");

    expect(ElMessage.info as any).toHaveBeenCalledTimes(1);
    expect((ElMessage.info as any).mock.calls[0][0]).toContain("Table");
  });

  it("associationWidget: if sourceId equals target widget id, only sets widget and returns early", () => {
    const layout = [{ type: "Line", id: "wid1", y: 3, h: 7 }];
    const setWidget = vi.fn();
    const setActiveTabIndex = vi.fn();
    mockDashboardStore = { layout, currentDashboard: {}, setWidget, setActiveTabIndex };

    const { associationWidget } = getDashboard({ name: "A", layer: "L1", entity: "Service" }, ConfigFieldTypes.NAME);

    associationWidget("wid1", { a: 1 }, "Line");

    expect(setWidget).toHaveBeenCalledTimes(1);
    expect(setActiveTabIndex).not.toHaveBeenCalled();

    const main = document.querySelector(".ds-main") as HTMLElement;
    const tab = document.querySelector(".tab-layout") as HTMLElement;
    // Early return: scroll positions unchanged (default 0)
    expect(main.scrollTop).toBe(0);
    expect(tab.scrollTop).toBe(0);
  });
});
