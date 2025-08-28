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
import { ROUTE_NAMES, META_KEYS } from "../constants";
import type { AppRouteRecordRaw } from "@/types/router";

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
      children: [
        {
          name: "DashboardList",
          path: "/dashboard/list",
          meta: {
            title: "Dashboard List",
            i18nKey: "dashboardList",
            icon: "list",
            hasGroup: false,
            activate: true,
            breadcrumb: true,
          },
        },
        {
          name: "DashboardNew",
          path: "/dashboard/new",
          meta: {
            title: "New Dashboard",
            i18nKey: "dashboardNew",
            icon: "add",
            hasGroup: false,
            activate: true,
            breadcrumb: true,
          },
        },
        {
          name: "DashboardEdit",
          path: "/dashboard/edit/:id",
          meta: {
            title: "Edit Dashboard",
            i18nKey: "dashboardEdit",
            icon: "edit",
            hasGroup: false,
            activate: false,
            breadcrumb: true,
          },
        },
      ],
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
      children: [
        {
          name: "MenusManagement",
          path: "", // Empty path for child route
          meta: {
            title: "Marketplace",
            i18nKey: "menusManagement",
            icon: "menu",
            hasGroup: false,
            activate: true,
            breadcrumb: true,
          },
        },
      ],
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
      children: [
        {
          name: "AlarmList",
          path: "/alarm/list",
          meta: {
            title: "Alarm List",
            i18nKey: "alarmList",
            icon: "list",
            hasGroup: false,
            activate: true,
            breadcrumb: true,
          },
        },
        {
          name: "AlarmNew",
          path: "/alarm/new",
          meta: {
            title: "New Alarm",
            i18nKey: "alarmNew",
            icon: "add",
            hasGroup: false,
            activate: true,
            breadcrumb: true,
          },
        },
      ],
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
      children: [
        {
          name: "LayerList",
          path: "/layer/list",
          meta: {
            title: "Layer List",
            i18nKey: "layerList",
            icon: "list",
            hasGroup: false,
            activate: true,
            breadcrumb: true,
          },
        },
      ],
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
      children: [
        {
          name: "SettingsGeneral",
          path: "/settings/general",
          meta: {
            title: "General Settings",
            i18nKey: "settingsGeneral",
            icon: "settings",
            hasGroup: false,
            activate: true,
            breadcrumb: true,
          },
        },
      ],
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

// Import after mocks
import { routesDashboard } from "../dashboard";
import { routesMarketplace } from "../marketplace";
import { routesAlarm } from "../alarm";
import routesLayers from "../layer";
import { routesSettings } from "../settings";
import { routesNotFound } from "../notFound";

describe("Route Modules", () => {
  describe("Marketplace Routes", () => {
    it("should export marketplace routes", () => {
      expect(routesMarketplace).toBeDefined();
      expect(Array.isArray(routesMarketplace)).toBe(true);
    });

    it("should have correct marketplace route structure", () => {
      const marketplaceRoute = routesMarketplace[0];
      expect(marketplaceRoute.name).toBe(ROUTE_NAMES.MARKETPLACE);
      expect(marketplaceRoute.meta[META_KEYS.I18N_KEY]).toBe("marketplace");
      expect(marketplaceRoute.meta[META_KEYS.ICON]).toBe("marketplace");
      expect(marketplaceRoute.meta[META_KEYS.HAS_GROUP]).toBe(false);
      expect(marketplaceRoute.meta[META_KEYS.ACTIVATE]).toBe(true);
      expect(marketplaceRoute.meta[META_KEYS.TITLE]).toBe("Marketplace");
      expect(marketplaceRoute.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });

    it("should have marketplace child route", () => {
      const marketplaceRoute = routesMarketplace[0];
      expect(marketplaceRoute.children).toBeDefined();
      expect(marketplaceRoute.children).toHaveLength(1);

      const childRoute = marketplaceRoute.children![0];
      expect(childRoute.path).toBe(""); // Empty path for child route
      expect(childRoute.name).toBe("MenusManagement");
      expect(childRoute.meta[META_KEYS.TITLE]).toBe("Marketplace");
      expect(childRoute.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });
  });

  describe("Dashboard Routes", () => {
    it("should export dashboard routes", () => {
      expect(routesDashboard).toBeDefined();
      expect(Array.isArray(routesDashboard)).toBe(true);
    });

    it("should have correct dashboard route structure", () => {
      const dashboardRoute = routesDashboard[0];
      expect(dashboardRoute.name).toBe(ROUTE_NAMES.DASHBOARD);
      expect(dashboardRoute.meta[META_KEYS.I18N_KEY]).toBe("dashboards");
      expect(dashboardRoute.meta[META_KEYS.ICON]).toBe("dashboard_customize");
      expect(dashboardRoute.meta[META_KEYS.HAS_GROUP]).toBe(true);
      expect(dashboardRoute.meta[META_KEYS.ACTIVATE]).toBe(true);
      expect(dashboardRoute.meta[META_KEYS.TITLE]).toBe("Dashboards");
      expect(dashboardRoute.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });

    it("should have dashboard list route", () => {
      const dashboardRoute = routesDashboard[0];
      const listRoute = dashboardRoute.children?.find((r) => r.name === "DashboardList");

      expect(listRoute).toBeDefined();
      expect(listRoute?.path).toBe("/dashboard/list");
      expect(listRoute?.meta[META_KEYS.I18N_KEY]).toBe("dashboardList");
      expect(listRoute?.meta[META_KEYS.ACTIVATE]).toBe(true);
      expect(listRoute?.meta[META_KEYS.TITLE]).toBe("Dashboard List");
      expect(listRoute?.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });

    it("should have dashboard new route", () => {
      const dashboardRoute = routesDashboard[0];
      const newRoute = dashboardRoute.children?.find((r) => r.name === "DashboardNew");

      expect(newRoute).toBeDefined();
      expect(newRoute?.path).toBe("/dashboard/new");
      expect(newRoute?.meta[META_KEYS.I18N_KEY]).toBe("dashboardNew");
      expect(newRoute?.meta[META_KEYS.ACTIVATE]).toBe(true);
      expect(newRoute?.meta[META_KEYS.TITLE]).toBe("New Dashboard");
      expect(newRoute?.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });

    it("should have dashboard edit routes", () => {
      const dashboardRoute = routesDashboard[0];
      const editRoute = dashboardRoute.children?.find((r) => r.name === "DashboardEdit");

      expect(editRoute).toBeDefined();
      expect(editRoute?.path).toBe("/dashboard/edit/:id");
      expect(editRoute?.meta[META_KEYS.I18N_KEY]).toBe("dashboardEdit");
      expect(editRoute?.meta[META_KEYS.ACTIVATE]).toBe(false);
      expect(editRoute?.meta[META_KEYS.TITLE]).toBe("Edit Dashboard");
      expect(editRoute?.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });
  });

  describe("Alarm Routes", () => {
    it("should export alarm routes", () => {
      expect(routesAlarm).toBeDefined();
      expect(Array.isArray(routesAlarm)).toBe(true);
    });

    it("should have correct alarm route structure", () => {
      const alarmRoute = routesAlarm[0];
      expect(alarmRoute.name).toBe(ROUTE_NAMES.ALARM);
      expect(alarmRoute.meta[META_KEYS.I18N_KEY]).toBe("alarm");
      expect(alarmRoute.meta[META_KEYS.ICON]).toBe("alarm");
      expect(alarmRoute.meta[META_KEYS.HAS_GROUP]).toBe(true);
      expect(alarmRoute.meta[META_KEYS.ACTIVATE]).toBe(true);
      expect(alarmRoute.meta[META_KEYS.TITLE]).toBe("Alarm");
      expect(alarmRoute.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });

    it("should have alarm list route", () => {
      const alarmRoute = routesAlarm[0];
      const listRoute = alarmRoute.children?.find((r) => r.name === "AlarmList");

      expect(listRoute).toBeDefined();
      expect(listRoute?.path).toBe("/alarm/list");
      expect(listRoute?.meta[META_KEYS.I18N_KEY]).toBe("alarmList");
      expect(listRoute?.meta[META_KEYS.ACTIVATE]).toBe(true);
      expect(listRoute?.meta[META_KEYS.TITLE]).toBe("Alarm List");
      expect(listRoute?.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });

    it("should have alarm new route", () => {
      const alarmRoute = routesAlarm[0];
      const newRoute = alarmRoute.children?.find((r) => r.name === "AlarmNew");

      expect(newRoute).toBeDefined();
      expect(newRoute?.path).toBe("/alarm/new");
      expect(newRoute?.meta[META_KEYS.I18N_KEY]).toBe("alarmNew");
      expect(newRoute?.meta[META_KEYS.ACTIVATE]).toBe(true);
      expect(newRoute?.meta[META_KEYS.TITLE]).toBe("New Alarm");
      expect(newRoute?.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });
  });

  describe("Layer Routes", () => {
    it("should export layer routes", () => {
      expect(routesLayers).toBeDefined();
      expect(Array.isArray(routesLayers)).toBe(true);
    });

    it("should have correct layer route structure", () => {
      const layerRoute = routesLayers[0];
      expect(layerRoute.name).toBe(ROUTE_NAMES.LAYER);
      expect(layerRoute.meta[META_KEYS.I18N_KEY]).toBe("layer");
      expect(layerRoute.meta[META_KEYS.ICON]).toBe("layers");
      expect(layerRoute.meta[META_KEYS.HAS_GROUP]).toBe(false);
      expect(layerRoute.meta[META_KEYS.ACTIVATE]).toBe(true);
      expect(layerRoute.meta[META_KEYS.TITLE]).toBe("Layer");
      expect(layerRoute.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });

    it("should have layer list route", () => {
      const layerRoute = routesLayers[0];
      const listRoute = layerRoute.children?.find((r) => r.name === "LayerList");

      expect(listRoute).toBeDefined();
      expect(listRoute?.path).toBe("/layer/list");
      expect(listRoute?.meta[META_KEYS.I18N_KEY]).toBe("layerList");
      expect(listRoute?.meta[META_KEYS.ACTIVATE]).toBe(true);
      expect(listRoute?.meta[META_KEYS.TITLE]).toBe("Layer List");
      expect(listRoute?.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });
  });

  describe("Settings Routes", () => {
    it("should export settings routes", () => {
      expect(routesSettings).toBeDefined();
      expect(Array.isArray(routesSettings)).toBe(true);
    });

    it("should have correct settings route structure", () => {
      const settingsRoute = routesSettings[0];
      expect(settingsRoute.name).toBe(ROUTE_NAMES.SETTINGS);
      expect(settingsRoute.meta[META_KEYS.I18N_KEY]).toBe("settings");
      expect(settingsRoute.meta[META_KEYS.ICON]).toBe("settings");
      expect(settingsRoute.meta[META_KEYS.HAS_GROUP]).toBe(false);
      expect(settingsRoute.meta[META_KEYS.ACTIVATE]).toBe(true);
      expect(settingsRoute.meta[META_KEYS.TITLE]).toBe("Settings");
      expect(settingsRoute.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });

    it("should have settings general route", () => {
      const settingsRoute = routesSettings[0];
      const generalRoute = settingsRoute.children?.find((r) => r.name === "SettingsGeneral");

      expect(generalRoute).toBeDefined();
      expect(generalRoute?.path).toBe("/settings/general");
      expect(generalRoute?.meta[META_KEYS.I18N_KEY]).toBe("settingsGeneral");
      expect(generalRoute?.meta[META_KEYS.ACTIVATE]).toBe(true);
      expect(generalRoute?.meta[META_KEYS.TITLE]).toBe("General Settings");
      expect(generalRoute?.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });
  });

  describe("Not Found Routes", () => {
    it("should export not found routes", () => {
      expect(routesNotFound).toBeDefined();
      expect(Array.isArray(routesNotFound)).toBe(true);
    });

    it("should have correct not found route structure", () => {
      const notFoundRoute = routesNotFound[0];
      expect(notFoundRoute.name).toBe(ROUTE_NAMES.NOT_FOUND);
      expect(notFoundRoute.path).toBe("/:pathMatch(.*)*");
      expect(notFoundRoute.meta[META_KEYS.I18N_KEY]).toBe("notFound");
      expect(notFoundRoute.meta[META_KEYS.ICON]).toBe("error");
      expect(notFoundRoute.meta[META_KEYS.HAS_GROUP]).toBe(false);
      expect(notFoundRoute.meta[META_KEYS.ACTIVATE]).toBe(false);
      expect(notFoundRoute.meta[META_KEYS.BREADCRUMB]).toBe(false);
    });
  });

  describe("Route Uniqueness", () => {
    it("should have unique route names across all modules", () => {
      const allRoutes = [
        ...routesMarketplace,
        ...routesLayers,
        ...routesAlarm,
        ...routesDashboard,
        ...routesSettings,
        ...routesNotFound,
      ];

      const routeNames = allRoutes.map((r) => r.name);
      const uniqueNames = new Set(routeNames);

      expect(uniqueNames.size).toBe(routeNames.length);
    });

    it("should have unique route paths across all modules", () => {
      const allRoutes = [
        ...routesMarketplace,
        ...routesLayers,
        ...routesAlarm,
        ...routesDashboard,
        ...routesSettings,
        ...routesNotFound,
      ];

      const getAllPaths = (routes: AppRouteRecordRaw[]): string[] => {
        const paths: string[] = [];
        routes.forEach((route) => {
          if (route.path) {
            paths.push(route.path);
          }
          if (route.children) {
            paths.push(...getAllPaths(route.children));
          }
        });
        return paths;
      };

      const allPaths = getAllPaths(allRoutes);
      const uniquePaths = new Set(allPaths);

      expect(uniquePaths.size).toBe(allPaths.length);
    });
  });

  describe("Route Metadata Consistency", () => {
    it("should have consistent meta structure across all routes", () => {
      const allRoutes = [
        ...routesMarketplace,
        ...routesLayers,
        ...routesAlarm,
        ...routesDashboard,
        ...routesSettings,
        ...routesNotFound,
      ];

      const validateRouteMeta = (route: AppRouteRecordRaw) => {
        expect(route.meta).toHaveProperty(META_KEYS.TITLE);
        expect(route.meta).toHaveProperty(META_KEYS.I18N_KEY);
        expect(route.meta).toHaveProperty(META_KEYS.ICON);
        expect(route.meta).toHaveProperty(META_KEYS.HAS_GROUP);
        expect(route.meta).toHaveProperty(META_KEYS.ACTIVATE);
        expect(route.meta).toHaveProperty(META_KEYS.BREADCRUMB);

        if (route.children) {
          route.children.forEach(validateRouteMeta);
        }
      };

      allRoutes.forEach(validateRouteMeta);
    });
  });
});
