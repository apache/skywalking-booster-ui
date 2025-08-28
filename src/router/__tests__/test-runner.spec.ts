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
import { ROUTE_NAMES, ROUTE_PATHS, META_KEYS, DEFAULT_ROUTE } from "../constants";
import { RouteValidator, RouteAnalyzer } from "../validator";
import { RouteFactory, RouteHelpers } from "../factory";
import type { AppRouteRecordRaw } from "../types";

describe("Router Test Runner", () => {
  const mockComponent = { template: "<div>Test</div>" };

  describe("Constants", () => {
    it("should have all required route names", () => {
      expect(ROUTE_NAMES.MARKETPLACE).toBe("Marketplace");
      expect(ROUTE_NAMES.DASHBOARD).toBe("Dashboard");
      expect(ROUTE_NAMES.ALARM).toBe("Alarm");
      expect(ROUTE_NAMES.SETTINGS).toBe("Settings");
      expect(ROUTE_NAMES.NOT_FOUND).toBe("NotFound");
      expect(ROUTE_NAMES.LAYER).toBe("Layer");
    });

    it("should have all required route paths", () => {
      expect(ROUTE_PATHS.ROOT).toBe("/");
      expect(ROUTE_PATHS.MARKETPLACE).toBe("/marketplace");
      expect(ROUTE_PATHS.ALARM).toBe("/alerting");
      expect(ROUTE_PATHS.SETTINGS).toBe("/settings");
      expect(ROUTE_PATHS.NOT_FOUND).toBe("/:pathMatch(.*)*");
    });

    it("should have all required meta keys", () => {
      expect(META_KEYS.I18N_KEY).toBe("i18nKey");
      expect(META_KEYS.ICON).toBe("icon");
      expect(META_KEYS.HAS_GROUP).toBe("hasGroup");
      expect(META_KEYS.ACTIVATE).toBe("activate");
      expect(META_KEYS.TITLE).toBe("title");
      expect(META_KEYS.BREADCRUMB).toBe("breadcrumb");
    });

    it("should have correct default route", () => {
      expect(DEFAULT_ROUTE).toBe(ROUTE_PATHS.MARKETPLACE);
    });
  });

  describe("Route Factory", () => {
    it("should create basic routes", () => {
      const route = RouteFactory.createRoute("/test", "TestRoute", mockComponent);
      expect(route.path).toBe("/test");
      expect(route.name).toBe("TestRoute");
      expect(route.component).toBe(mockComponent);
    });

    it("should create layout routes", () => {
      const children: AppRouteRecordRaw[] = [
        {
          path: "/child",
          name: "ChildRoute",
          component: mockComponent,
          meta: { title: "Child" },
        },
      ];

      const layoutRoute = RouteFactory.createLayoutRoute("LayoutRoute", mockComponent, children);
      expect(layoutRoute.path).toBe("");
      expect(layoutRoute.name).toBe("LayoutRoute");
      expect(layoutRoute.children).toBe(children);
    });

    it("should create redirect routes", () => {
      const redirectRoute = RouteFactory.createRedirectRoute("RedirectRoute", "/target", mockComponent);
      expect(redirectRoute.redirect).toBe("/target");
      expect(redirectRoute.meta.notShow).toBe(true);
    });

    it("should create tab routes", () => {
      const tabRoute = RouteFactory.createTabRoute("dashboard", "DashboardTab", mockComponent);
      expect(tabRoute.path).toBe("/dashboard/tab/:activeTabIndex");
      expect(tabRoute.name).toBe("DashboardTabActiveTabIndex");
    });

    it("should create parameterized routes", () => {
      const paramRoute = RouteFactory.createParamRoute("/user/:id", "UserRoute", mockComponent);
      expect(paramRoute.path).toBe("/user/:id");
      expect(paramRoute.name).toBe("UserRoute");
    });
  });

  describe("Route Helpers", () => {
    it("should create dashboard routes", () => {
      const dashboardRoutes = RouteHelpers.createDashboardRoutes("metrics", mockComponent);
      expect(dashboardRoutes).toHaveLength(2);
      expect(dashboardRoutes[0].path).toBe("/metrics");
      expect(dashboardRoutes[1].path).toBe("/metrics/tab/:activeTabIndex");
    });

    it("should create service relation routes", () => {
      const serviceRelationRoutes = RouteHelpers.createServiceRelationRoutes(mockComponent);
      expect(serviceRelationRoutes).toHaveLength(2);
      expect(serviceRelationRoutes[0].path).toContain("/dashboard/related/");
      expect(serviceRelationRoutes[1].path).toContain("/tab/:activeTabIndex");
    });
  });

  describe("Route Validator", () => {
    const validator = new RouteValidator();

    it("should validate valid routes", () => {
      const validRoutes: AppRouteRecordRaw[] = [
        {
          path: "/valid",
          name: "ValidRoute",
          component: mockComponent,
          meta: { title: "Valid Route" },
        },
      ];

      const errors = validator.validateRoutes(validRoutes);
      expect(errors).toHaveLength(0);
      expect(validator.isValid(validRoutes)).toBe(true);
    });

    it("should detect invalid routes", () => {
      const invalidRoutes: AppRouteRecordRaw[] = [
        {
          path: "/invalid",
          name: "", // Invalid: empty name
          component: mockComponent,
          meta: { title: "Invalid Route" },
        },
      ];

      const errors = validator.validateRoutes(invalidRoutes);
      expect(errors.length).toBeGreaterThan(0);
      expect(validator.isValid(invalidRoutes)).toBe(false);
    });

    it("should provide validation summary", () => {
      const mixedRoutes: AppRouteRecordRaw[] = [
        {
          path: "/valid",
          name: "ValidRoute",
          component: mockComponent,
          meta: { title: "Valid Route" },
        },
        {
          path: "/invalid",
          name: "", // Invalid: empty name
          component: mockComponent,
          meta: { title: "Invalid Route" },
        },
      ];

      const summary = validator.getValidationSummary(mixedRoutes);
      expect(summary.total).toBe(2);
      expect(summary.errors).toBeGreaterThan(0);
      expect(summary.isValid).toBe(false);
    });
  });

  describe("Route Analyzer", () => {
    it("should analyze simple routes", () => {
      const routes: AppRouteRecordRaw[] = [
        {
          path: "/route1",
          name: "Route1",
          component: mockComponent,
          meta: { title: "Route 1" },
        },
        {
          path: "/route2",
          name: "Route2",
          component: mockComponent,
          meta: { title: "Route 2" },
        },
      ];

      const analysis = RouteAnalyzer.analyzeRoutes(routes);
      expect(analysis.totalRoutes).toBe(2);
      expect(analysis.nestedRoutes).toBe(0);
      expect(analysis.lazyRoutes).toBe(0);
      expect(analysis.redirectRoutes).toBe(0);
      expect(analysis.depth).toBe(0);
    });

    it("should analyze nested routes", () => {
      const nestedRoutes: AppRouteRecordRaw[] = [
        {
          path: "/parent",
          name: "ParentRoute",
          component: mockComponent,
          meta: { title: "Parent Route" },
          children: [
            {
              path: "/parent/child",
              name: "ChildRoute",
              component: mockComponent,
              meta: { title: "Child Route" },
            },
          ],
        },
      ];

      const analysis = RouteAnalyzer.analyzeRoutes(nestedRoutes);
      expect(analysis.totalRoutes).toBe(2);
      expect(analysis.nestedRoutes).toBe(1);
      expect(analysis.depth).toBe(1);
    });

    it("should detect lazy routes", () => {
      const lazyRoutes: AppRouteRecordRaw[] = [
        {
          path: "/lazy",
          name: "LazyRoute",
          component: () => Promise.resolve(mockComponent),
          meta: { title: "Lazy Route" },
        },
      ];

      const analysis = RouteAnalyzer.analyzeRoutes(lazyRoutes);
      expect(analysis.lazyRoutes).toBe(1);
    });

    it("should detect redirect routes", () => {
      const redirectRoutes: AppRouteRecordRaw[] = [
        {
          path: "/redirect",
          name: "RedirectRoute",
          redirect: "/target",
          component: mockComponent,
          meta: { title: "Redirect Route" },
        },
      ];

      const analysis = RouteAnalyzer.analyzeRoutes(redirectRoutes);
      expect(analysis.redirectRoutes).toBe(1);
    });

    it("should find routes by meta", () => {
      const routes: AppRouteRecordRaw[] = [
        {
          path: "/route1",
          name: "Route1",
          component: mockComponent,
          meta: { title: "Route 1", icon: "icon1" },
        },
        {
          path: "/route2",
          name: "Route2",
          component: mockComponent,
          meta: { title: "Route 2", icon: "icon1" },
        },
        {
          path: "/route3",
          name: "Route3",
          component: mockComponent,
          meta: { title: "Route 3", icon: "icon2" },
        },
      ];

      const icon1Routes = RouteAnalyzer.findRoutesByMeta(routes, "icon", "icon1");
      expect(icon1Routes).toHaveLength(2);

      const icon2Routes = RouteAnalyzer.findRoutesByMeta(routes, "icon", "icon2");
      expect(icon2Routes).toHaveLength(1);
    });
  });

  describe("Integration", () => {
    it("should work together seamlessly", () => {
      // Create routes using factory
      const childRoute = RouteFactory.createRoute("/child", "ChildRoute", mockComponent, {
        icon: "child-icon",
      });

      const parentRoute = RouteFactory.createLayoutRoute("ParentRoute", mockComponent, [childRoute], {
        icon: "parent-icon",
        hasGroup: true,
      });

      // Validate routes
      const validator = new RouteValidator();
      const isValid = validator.isValid([parentRoute]);
      expect(isValid).toBe(true);

      // Analyze routes
      const analysis = RouteAnalyzer.analyzeRoutes([parentRoute]);
      expect(analysis.totalRoutes).toBe(2);
      expect(analysis.nestedRoutes).toBe(1);

      // Find routes by meta
      const hasGroupRoutes = RouteAnalyzer.findRoutesByMeta([parentRoute], "hasGroup", true);
      expect(hasGroupRoutes).toHaveLength(1);

      const iconRoutes = RouteAnalyzer.findRoutesByMeta([parentRoute], "icon", "child-icon");
      expect(iconRoutes).toHaveLength(1);
    });
  });
});
