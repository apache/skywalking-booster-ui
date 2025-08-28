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

import { describe, it, expect, vi } from "vitest";
import { META_KEYS } from "../constants";

// Mock route modules to avoid Vue component import issues
vi.mock("../dashboard", () => ({
  routesDashboard: [
    {
      name: "Dashboard",
      path: "/dashboard",
      meta: {
        title: "Dashboards",
        i18nKey: "dashboards",
        icon: "dashboard_customize",
        hasGroup: true,
        activate: true,
        breadcrumb: true,
      },
    },
  ],
}));

vi.mock("../marketplace", () => ({
  routesMarketplace: [
    {
      name: "Marketplace",
      path: "/marketplace",
      meta: {
        title: "Marketplace",
        i18nKey: "marketplace",
        icon: "marketplace",
        hasGroup: false,
        activate: true,
        breadcrumb: true,
      },
    },
  ],
}));

vi.mock("../alarm", () => ({
  routesAlarm: [
    {
      name: "Alarm",
      path: "/alarm",
      meta: {
        title: "Alarm",
        i18nKey: "alarm",
        icon: "alarm",
        hasGroup: true,
        activate: true,
        breadcrumb: true,
      },
    },
  ],
}));

vi.mock("../layer", () => ({
  default: [
    {
      name: "Layer",
      path: "/layer",
      meta: {
        title: "Layer",
        i18nKey: "layer",
        icon: "layers",
        hasGroup: false,
        activate: true,
        breadcrumb: true,
      },
    },
  ],
}));

vi.mock("../settings", () => ({
  routesSettings: [
    {
      name: "Settings",
      path: "/settings",
      meta: {
        title: "Settings",
        i18nKey: "settings",
        icon: "settings",
        hasGroup: false,
        activate: true,
        breadcrumb: true,
      },
    },
  ],
}));

vi.mock("../notFound", () => ({
  routesNotFound: [
    {
      name: "NotFound",
      path: "/:pathMatch(.*)*",
      meta: {
        title: "Not Found",
        i18nKey: "notFound",
        icon: "error",
        hasGroup: false,
        activate: false,
        breadcrumb: false,
      },
    },
  ],
}));

// Mock guards
vi.mock("../guards", () => ({
  applyGuards: vi.fn(),
}));

// Mock environment
vi.mock("import.meta.env", () => ({
  BASE_URL: "/",
}));

// Import after mocks
import { routes } from "../index";

describe("Router Index - Route Structure", () => {
  describe("Route Configuration", () => {
    it("should combine all route modules correctly", () => {
      expect(routes).toEqual([
        expect.objectContaining({ name: "Marketplace" }),
        expect.objectContaining({ name: "Layer" }),
        expect.objectContaining({ name: "Alarm" }),
        expect.objectContaining({ name: "Dashboard" }),
        expect.objectContaining({ name: "Settings" }),
        expect.objectContaining({ name: "NotFound" }),
      ]);
    });

    it("should include marketplace routes", () => {
      expect(routes).toContainEqual(
        expect.objectContaining({
          name: "Marketplace",
        }),
      );
    });

    it("should include dashboard routes", () => {
      expect(routes).toContainEqual(
        expect.objectContaining({
          name: "Dashboard",
        }),
      );
    });

    it("should include alarm routes", () => {
      expect(routes).toContainEqual(
        expect.objectContaining({
          name: "Alarm",
        }),
      );
    });

    it("should include settings routes", () => {
      expect(routes).toContainEqual(
        expect.objectContaining({
          name: "Settings",
        }),
      );
    });

    it("should include not found routes", () => {
      expect(routes).toContainEqual(
        expect.objectContaining({
          name: "NotFound",
        }),
      );
    });
  });

  describe("Route Export", () => {
    it("should export routes array", () => {
      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
    });
  });

  describe("Route Structure Validation", () => {
    it("should have valid route structure", () => {
      routes.forEach((route) => {
        expect(route).toHaveProperty("name");
        expect(route).toHaveProperty("meta");
        expect(route.meta).toHaveProperty("title");
      });
    });

    it("should have proper meta structure", () => {
      routes.forEach((route) => {
        expect(route.meta).toHaveProperty("i18nKey");
        expect(route.meta).toHaveProperty("icon");
        expect(route.meta).toHaveProperty("hasGroup");
        expect(route.meta).toHaveProperty("activate");
        expect(route.meta).toHaveProperty("breadcrumb");
      });
    });
  });

  describe("Route Metadata Validation", () => {
    it("should have correct marketplace metadata", () => {
      const marketplaceRoute = routes.find((r) => r.name === "Marketplace");
      expect(marketplaceRoute).toBeDefined();
      expect(marketplaceRoute?.meta[META_KEYS.TITLE]).toBe("Marketplace");
      expect(marketplaceRoute?.meta[META_KEYS.I18N_KEY]).toBe("marketplace");
      expect(marketplaceRoute?.meta[META_KEYS.ICON]).toBe("marketplace");
      expect(marketplaceRoute?.meta[META_KEYS.HAS_GROUP]).toBe(false);
      expect(marketplaceRoute?.meta[META_KEYS.ACTIVATE]).toBe(true);
      expect(marketplaceRoute?.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });

    it("should have correct dashboard metadata", () => {
      const dashboardRoute = routes.find((r) => r.name === "Dashboard");
      expect(dashboardRoute).toBeDefined();
      expect(dashboardRoute?.meta[META_KEYS.TITLE]).toBe("Dashboards");
      expect(dashboardRoute?.meta[META_KEYS.I18N_KEY]).toBe("dashboards");
      expect(dashboardRoute?.meta[META_KEYS.ICON]).toBe("dashboard_customize");
      expect(dashboardRoute?.meta[META_KEYS.HAS_GROUP]).toBe(true);
      expect(dashboardRoute?.meta[META_KEYS.ACTIVATE]).toBe(true);
      expect(dashboardRoute?.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });

    it("should have correct alarm metadata", () => {
      const alarmRoute = routes.find((r) => r.name === "Alarm");
      expect(alarmRoute).toBeDefined();
      expect(alarmRoute?.meta[META_KEYS.TITLE]).toBe("Alarm");
      expect(alarmRoute?.meta[META_KEYS.I18N_KEY]).toBe("alarm");
      expect(alarmRoute?.meta[META_KEYS.ICON]).toBe("alarm");
      expect(alarmRoute?.meta[META_KEYS.HAS_GROUP]).toBe(true);
      expect(alarmRoute?.meta[META_KEYS.ACTIVATE]).toBe(true);
      expect(alarmRoute?.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });

    it("should have correct not found metadata", () => {
      const notFoundRoute = routes.find((r) => r.name === "NotFound");
      expect(notFoundRoute).toBeDefined();
      expect(notFoundRoute?.meta[META_KEYS.TITLE]).toBe("Not Found");
      expect(notFoundRoute?.meta[META_KEYS.I18N_KEY]).toBe("notFound");
      expect(notFoundRoute?.meta[META_KEYS.ICON]).toBe("error");
      expect(notFoundRoute?.meta[META_KEYS.HAS_GROUP]).toBe(false);
      expect(notFoundRoute?.meta[META_KEYS.ACTIVATE]).toBe(false);
      expect(notFoundRoute?.meta[META_KEYS.BREADCRUMB]).toBe(false);
    });
  });
});
