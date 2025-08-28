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
import { RouteFactory, RouteHelpers } from "../factory";
import { META_KEYS } from "../constants";
import type { AppRouteRecordRaw, RouteMeta } from "../types";

describe("Route Factory", () => {
  const mockComponent = { template: "<div>Test</div>" };

  describe("RouteFactory.createRoute", () => {
    it("should create a basic route with minimal parameters", () => {
      const route = RouteFactory.createRoute("/test", "TestRoute", mockComponent);

      expect(route.path).toBe("/test");
      expect(route.name).toBe("TestRoute");
      expect(route.component).toBe(mockComponent);
      expect(route.meta[META_KEYS.TITLE]).toBe("TestRoute");
      expect(route.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });

    it("should create a route with custom meta", () => {
      const customMeta: Partial<RouteMeta> = {
        icon: "test-icon",
        hasGroup: true,
        activate: false,
      };

      const route = RouteFactory.createRoute("/custom", "CustomRoute", mockComponent, customMeta);

      expect(route.meta[META_KEYS.TITLE]).toBe("CustomRoute");
      expect(route.meta[META_KEYS.BREADCRUMB]).toBe(true);
      expect(route.meta.icon).toBe("test-icon");
      expect(route.meta.hasGroup).toBe(true);
      expect(route.meta.activate).toBe(false);
    });

    it("should override default meta with custom meta", () => {
      const customMeta: Partial<RouteMeta> = {
        title: "Custom Title",
        breadcrumb: false,
      };

      const route = RouteFactory.createRoute("/override", "OverrideRoute", mockComponent, customMeta);

      expect(route.meta[META_KEYS.TITLE]).toBe("Custom Title");
      expect(route.meta[META_KEYS.BREADCRUMB]).toBe(false);
    });

    it("should handle empty meta object", () => {
      const route = RouteFactory.createRoute("/empty", "EmptyRoute", mockComponent, {});

      expect(route.meta[META_KEYS.TITLE]).toBe("EmptyRoute");
      expect(route.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });
  });

  describe("RouteFactory.createLayoutRoute", () => {
    it("should create a layout route with children", () => {
      const children: AppRouteRecordRaw[] = [
        {
          path: "/layout/child1",
          name: "Child1",
          component: mockComponent,
          meta: { title: "Child 1" },
        },
        {
          path: "/layout/child2",
          name: "Child2",
          component: mockComponent,
          meta: { title: "Child 2" },
        },
      ];

      const layoutRoute = RouteFactory.createLayoutRoute("LayoutRoute", mockComponent, children);

      expect(layoutRoute.path).toBe("");
      expect(layoutRoute.name).toBe("LayoutRoute");
      expect(layoutRoute.component).toBe(mockComponent);
      expect(layoutRoute.children).toBe(children);
      expect(layoutRoute.meta[META_KEYS.TITLE]).toBe("LayoutRoute");
      expect(layoutRoute.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });

    it("should create a layout route with custom meta", () => {
      const customMeta: Partial<RouteMeta> = {
        icon: "layout-icon",
        hasGroup: true,
      };

      const layoutRoute = RouteFactory.createLayoutRoute("CustomLayout", mockComponent, [], customMeta);

      expect(layoutRoute.meta.icon).toBe("layout-icon");
      expect(layoutRoute.meta.hasGroup).toBe(true);
      expect(layoutRoute.meta[META_KEYS.TITLE]).toBe("CustomLayout");
    });

    it("should handle empty children array", () => {
      const layoutRoute = RouteFactory.createLayoutRoute("EmptyLayout", mockComponent, []);

      expect(layoutRoute.children).toEqual([]);
    });
  });

  describe("RouteFactory.createRedirectRoute", () => {
    it("should create a redirect route", () => {
      const redirectRoute = RouteFactory.createRedirectRoute("RedirectRoute", "/target", mockComponent);

      expect(redirectRoute.path).toBe("");
      expect(redirectRoute.name).toBe("RedirectRoute");
      expect(redirectRoute.redirect).toBe("/target");
      expect(redirectRoute.component).toBe(mockComponent);
      expect(redirectRoute.meta[META_KEYS.NOT_SHOW]).toBe(true);
    });

    it("should create a redirect route with children", () => {
      const children: AppRouteRecordRaw[] = [
        {
          path: "/redirect/child",
          name: "RedirectChild",
          component: mockComponent,
          meta: { title: "Redirect Child" },
        },
      ];

      const redirectRoute = RouteFactory.createRedirectRoute(
        "RedirectWithChildren",
        "/target",
        mockComponent,
        children,
      );

      expect(redirectRoute.children).toBe(children);
    });

    it("should create a redirect route with custom meta", () => {
      const customMeta: Partial<RouteMeta> = {
        title: "Custom Redirect",
        icon: "redirect-icon",
      };

      const redirectRoute = RouteFactory.createRedirectRoute(
        "CustomRedirect",
        "/target",
        mockComponent,
        [],
        customMeta,
      );

      expect(redirectRoute.meta[META_KEYS.NOT_SHOW]).toBe(true);
      expect(redirectRoute.meta.title).toBe("Custom Redirect");
      expect(redirectRoute.meta.icon).toBe("redirect-icon");
    });
  });

  describe("RouteFactory.createLazyRoute", () => {
    it("should create a lazy-loaded route", () => {
      const importFn = () => import("../utils");
      const lazyRoute = RouteFactory.createLazyRoute("/lazy", "LazyRoute", importFn);

      expect(lazyRoute.path).toBe("/lazy");
      expect(lazyRoute.name).toBe("LazyRoute");
      expect(lazyRoute.component).toBe(importFn);
      expect(lazyRoute.meta[META_KEYS.TITLE]).toBe("LazyRoute");
    });

    it("should create a lazy route with custom meta", () => {
      const importFn = () => import("../utils");
      const customMeta: Partial<RouteMeta> = {
        icon: "lazy-icon",
        activate: true,
      };

      const lazyRoute = RouteFactory.createLazyRoute("/lazy", "LazyRoute", importFn, customMeta);

      expect(lazyRoute.meta.icon).toBe("lazy-icon");
      expect(lazyRoute.meta.activate).toBe(true);
    });
  });

  describe("RouteFactory.createTabRoute", () => {
    it("should create a tab route with active tab index", () => {
      const tabRoute = RouteFactory.createTabRoute("dashboard", "DashboardTab", mockComponent);

      expect(tabRoute.path).toBe("/dashboard/tab/:activeTabIndex");
      expect(tabRoute.name).toBe("DashboardTabActiveTabIndex");
      expect(tabRoute.component).toBe(mockComponent);
      expect(tabRoute.meta[META_KEYS.NOT_SHOW]).toBe(true);
      expect(tabRoute.meta[META_KEYS.BREADCRUMB]).toBe(false);
    });

    it("should create a tab route with custom meta", () => {
      const customMeta: Partial<RouteMeta> = {
        title: "Custom Tab",
        icon: "tab-icon",
      };

      const tabRoute = RouteFactory.createTabRoute("custom", "CustomTab", mockComponent, customMeta);

      expect(tabRoute.meta[META_KEYS.NOT_SHOW]).toBe(true);
      expect(tabRoute.meta[META_KEYS.BREADCRUMB]).toBe(false);
      expect(tabRoute.meta.title).toBe("Custom Tab");
      expect(tabRoute.meta.icon).toBe("tab-icon");
    });
  });

  describe("RouteFactory.createParamRoute", () => {
    it("should create a parameterized route", () => {
      const paramRoute = RouteFactory.createParamRoute("/user/:id", "UserRoute", mockComponent);

      expect(paramRoute.path).toBe("/user/:id");
      expect(paramRoute.name).toBe("UserRoute");
      expect(paramRoute.component).toBe(mockComponent);
      expect(paramRoute.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });

    it("should create a parameterized route with custom meta", () => {
      const customMeta: Partial<RouteMeta> = {
        title: "User Profile",
        icon: "user-icon",
        requiresAuth: true,
      };

      const paramRoute = RouteFactory.createParamRoute("/user/:id", "UserRoute", mockComponent, customMeta);

      expect(paramRoute.meta[META_KEYS.BREADCRUMB]).toBe(true);
      expect(paramRoute.meta.title).toBe("User Profile");
      expect(paramRoute.meta.icon).toBe("user-icon");
      expect(paramRoute.meta.requiresAuth).toBe(true);
    });
  });

  describe("RouteHelpers.createDashboardRoutes", () => {
    it("should create dashboard-related routes", () => {
      const dashboardRoutes = RouteHelpers.createDashboardRoutes("metrics", mockComponent);

      expect(dashboardRoutes).toHaveLength(2);
      expect(dashboardRoutes[0].path).toBe("/metrics");
      expect(dashboardRoutes[0].name).toBe("Dashboardmetrics");
      expect(dashboardRoutes[0].meta[META_KEYS.TITLE]).toBe("metrics Dashboard");

      expect(dashboardRoutes[1].path).toBe("/metrics/tab/:activeTabIndex");
      expect(dashboardRoutes[1].name).toBe("DashboardmetricsActiveTabIndex");
      expect(dashboardRoutes[1].meta[META_KEYS.TITLE]).toBe("metrics Dashboard");
    });

    it("should handle different dashboard types", () => {
      const performanceRoutes = RouteHelpers.createDashboardRoutes("performance", mockComponent);

      expect(performanceRoutes[0].name).toBe("Dashboardperformance");
      expect(performanceRoutes[0].meta[META_KEYS.TITLE]).toBe("performance Dashboard");
    });
  });

  describe("RouteHelpers.createServiceRelationRoutes", () => {
    it("should create service relation routes", () => {
      const serviceRelationRoutes = RouteHelpers.createServiceRelationRoutes(mockComponent);

      expect(serviceRelationRoutes).toHaveLength(2);
      expect(serviceRelationRoutes[0].path).toBe("/dashboard/related/:layerId/:entity/:serviceId/:destServiceId/:name");
      expect(serviceRelationRoutes[0].name).toBe("DashboardViewServiceRelation");
      expect(serviceRelationRoutes[0].meta[META_KEYS.TITLE]).toBe("Service Relations");

      expect(serviceRelationRoutes[1].path).toBe(
        "/dashboard/related/:layerId/:entity/:serviceId/:destServiceId/:name/tab/:activeTabIndex",
      );
      expect(serviceRelationRoutes[1].name).toBe("DashboardViewServiceRelationActiveTabIndex");
      expect(serviceRelationRoutes[1].meta[META_KEYS.TITLE]).toBe("Service Relations");
    });
  });

  describe("Factory Integration", () => {
    it("should create complex route structures", () => {
      const childRoute = RouteFactory.createRoute("/child", "ChildRoute", mockComponent, {
        icon: "child-icon",
      });

      const layoutRoute = RouteFactory.createLayoutRoute("ParentRoute", mockComponent, [childRoute], {
        icon: "parent-icon",
        hasGroup: true,
      });

      expect(layoutRoute.children).toHaveLength(1);
      expect(layoutRoute.children![0].name).toBe("ChildRoute");
      expect(layoutRoute.children![0].meta.icon).toBe("child-icon");
      expect(layoutRoute.meta.icon).toBe("parent-icon");
      expect(layoutRoute.meta.hasGroup).toBe(true);
    });

    it("should maintain meta inheritance", () => {
      const baseMeta: Partial<RouteMeta> = {
        icon: "base-icon",
        hasGroup: true,
      };

      const route = RouteFactory.createRoute("/inherited", "InheritedRoute", mockComponent, baseMeta);

      expect(route.meta.icon).toBe("base-icon");
      expect(route.meta.hasGroup).toBe(true);
      expect(route.meta[META_KEYS.TITLE]).toBe("InheritedRoute");
      expect(route.meta[META_KEYS.BREADCRUMB]).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle null/undefined components gracefully", () => {
      const route = RouteFactory.createRoute("/null", "NullRoute", null as any);

      expect(route.component).toBeNull();
      expect(route.meta[META_KEYS.TITLE]).toBe("NullRoute");
    });

    it("should handle empty string names", () => {
      const route = RouteFactory.createRoute("/empty", "", mockComponent);

      expect(route.name).toBe("");
      expect(route.meta[META_KEYS.TITLE]).toBe("");
    });

    it("should handle special characters in paths", () => {
      const route = RouteFactory.createRoute("/special/route-with-dashes", "SpecialRoute", mockComponent);

      expect(route.path).toBe("/special/route-with-dashes");
      expect(route.name).toBe("SpecialRoute");
    });

    it("should handle deeply nested meta objects", () => {
      const deepMeta: Partial<RouteMeta> = {
        title: "Deep Route",
        icon: "deep-icon",
        hasGroup: true,
        activate: false,
        notShow: true,
        requiresAuth: true,
        breadcrumb: false,
      };

      const route = RouteFactory.createRoute("/deep", "DeepRoute", mockComponent, deepMeta);

      expect(route.meta.title).toBe("Deep Route");
      expect(route.meta.icon).toBe("deep-icon");
      expect(route.meta.hasGroup).toBe(true);
      expect(route.meta.activate).toBe(false);
      expect(route.meta.notShow).toBe(true);
      expect(route.meta.requiresAuth).toBe(true);
      expect(route.meta.breadcrumb).toBe(false);
    });
  });
});
