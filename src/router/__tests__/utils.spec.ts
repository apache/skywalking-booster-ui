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
import {
  findActivatedRoute,
  getDefaultRoute,
  requiresAuth,
  generateBreadcrumb,
  validateRoute,
  flattenRoutes,
} from "../utils";
import { DEFAULT_ROUTE } from "../constants";
import type { AppRouteRecordRaw } from "../types";

describe("Router Utils", () => {
  const mockRoutes: AppRouteRecordRaw[] = [
    {
      path: "/marketplace",
      name: "Marketplace",
      component: {},
      meta: {
        title: "Marketplace",
        activate: false,
        breadcrumb: true,
      },
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: {},
      meta: {
        title: "Dashboard",
        activate: false,
        breadcrumb: true,
      },
      children: [
        {
          path: "/dashboard/list",
          name: "DashboardList",
          component: {},
          meta: {
            title: "Dashboard List",
            activate: true,
            breadcrumb: true,
          },
        },
        {
          path: "/dashboard/new",
          name: "DashboardNew",
          component: {},
          meta: {
            title: "Dashboard New",
            activate: false,
            breadcrumb: false,
          },
        },
      ],
    },
    {
      path: "/settings",
      name: "Settings",
      component: {},
      meta: {
        title: "Settings",
        activate: false,
        breadcrumb: true,
        requiresAuth: true,
      },
    },
  ];

  describe("findActivatedRoute", () => {
    it("should find first activated route from nested routes", () => {
      const result = findActivatedRoute(mockRoutes);
      expect(result).toBe("/dashboard/list");
    });

    it("should find activated route from children", () => {
      const result = findActivatedRoute(mockRoutes);
      expect(result).toBe("/dashboard/list");
    });

    it("should return null when no activated routes exist", () => {
      const routesWithoutActivate: AppRouteRecordRaw[] = [
        {
          path: "/test",
          name: "Test",
          component: {},
          meta: {
            title: "Test",
            activate: false,
            breadcrumb: true,
          },
        },
      ];

      const result = findActivatedRoute(routesWithoutActivate);
      expect(result).toBeNull();
    });

    it("should handle routes with no meta", () => {
      const routesWithoutMeta: AppRouteRecordRaw[] = [
        {
          path: "/test",
          name: "Test",
          component: {},
          meta: {},
        },
      ];

      const result = findActivatedRoute(routesWithoutMeta);
      expect(result).toBeNull();
    });
  });

  describe("getDefaultRoute", () => {
    it("should return activated route when available", () => {
      const result = getDefaultRoute(mockRoutes);
      expect(result).toBe("/dashboard/list");
    });

    it("should return DEFAULT_ROUTE when no activated routes exist", () => {
      const routesWithoutActivate: AppRouteRecordRaw[] = [
        {
          path: "/test",
          name: "Test",
          component: {},
          meta: {
            title: "Test",
            activate: false,
            breadcrumb: true,
          },
        },
      ];

      const result = getDefaultRoute(routesWithoutActivate);
      expect(result).toBe(DEFAULT_ROUTE);
    });

    it("should handle empty routes array", () => {
      const result = getDefaultRoute([]);
      expect(result).toBe(DEFAULT_ROUTE);
    });
  });

  describe("requiresAuth", () => {
    it("should return true for routes requiring authentication", () => {
      const authRoute = mockRoutes[2]; // Settings route
      const result = requiresAuth(authRoute);
      expect(result).toBe(true);
    });

    it("should return false for routes not requiring authentication", () => {
      const publicRoute = mockRoutes[0]; // Marketplace route
      const result = requiresAuth(publicRoute);
      expect(result).toBe(false);
    });

    it("should return false for routes without requiresAuth meta", () => {
      const routeWithoutAuth: AppRouteRecordRaw = {
        path: "/test",
        name: "Test",
        component: {},
        meta: {
          title: "Test",
          breadcrumb: true,
        },
      };

      const result = requiresAuth(routeWithoutAuth);
      expect(result).toBe(false);
    });

    it("should return false for routes with requiresAuth: false", () => {
      const routeWithFalseAuth: AppRouteRecordRaw = {
        path: "/test",
        name: "Test",
        component: {},
        meta: {
          title: "Test",
          requiresAuth: false,
          breadcrumb: true,
        },
      };

      const result = requiresAuth(routeWithFalseAuth);
      expect(result).toBe(false);
    });
  });

  describe("generateBreadcrumb", () => {
    it("should generate breadcrumb from route with title", () => {
      const route = mockRoutes[0]; // Marketplace route
      const result = generateBreadcrumb(route);
      expect(result).toEqual(["Marketplace"]);
    });

    it("should generate breadcrumb from route with children", () => {
      const route = mockRoutes[1]; // Dashboard route
      const result = generateBreadcrumb(route);
      expect(result).toEqual(["Dashboard", "Dashboard List"]);
    });

    it("should exclude children with breadcrumb: false", () => {
      const route = mockRoutes[1]; // Dashboard route
      const result = generateBreadcrumb(route);
      expect(result).not.toContain("Dashboard New");
    });

    it("should handle routes without title", () => {
      const routeWithoutTitle: AppRouteRecordRaw = {
        path: "/test",
        name: "Test",
        component: {},
        meta: {
          breadcrumb: true,
        },
      };

      const result = generateBreadcrumb(routeWithoutTitle);
      expect(result).toEqual([]);
    });

    it("should handle routes with no meta", () => {
      const routeWithoutMeta: AppRouteRecordRaw = {
        path: "/test",
        name: "Test",
        component: {},
        meta: {},
      };

      const result = generateBreadcrumb(routeWithoutMeta);
      expect(result).toEqual([]);
    });

    it("should handle empty children array", () => {
      const routeWithEmptyChildren: AppRouteRecordRaw = {
        path: "/test",
        name: "Test",
        component: {},
        meta: {
          title: "Test",
          breadcrumb: true,
        },
        children: [],
      };

      const result = generateBreadcrumb(routeWithEmptyChildren);
      expect(result).toEqual(["Test"]);
    });
  });

  describe("validateRoute", () => {
    it("should validate valid route", () => {
      const validRoute = mockRoutes[0];
      const result = validateRoute(validRoute);
      expect(result).toBe(true);
    });

    it("should validate route with children", () => {
      const routeWithChildren = mockRoutes[1];
      const result = validateRoute(routeWithChildren);
      expect(result).toBe(true);
    });

    it("should return false for route without name", () => {
      const invalidRoute: AppRouteRecordRaw = {
        path: "/test",
        name: "",
        component: {},
        meta: {
          title: "Test",
          breadcrumb: true,
        },
      };

      const result = validateRoute(invalidRoute);
      expect(result).toBe(false);
    });

    it("should return false for route without component", () => {
      const invalidRoute: AppRouteRecordRaw = {
        path: "/test",
        name: "Test",
        component: null as any,
        meta: {
          title: "Test",
          breadcrumb: true,
        },
      };

      const result = validateRoute(invalidRoute);
      expect(result).toBe(false);
    });

    it("should return false for route without path", () => {
      const invalidRoute: AppRouteRecordRaw = {
        path: "",
        name: "Test",
        component: {},
        meta: {
          title: "Test",
          breadcrumb: true,
        },
      };

      const result = validateRoute(invalidRoute);
      expect(result).toBe(false);
    });

    it("should return false for route with invalid children", () => {
      const routeWithInvalidChildren: AppRouteRecordRaw = {
        path: "/test",
        name: "Test",
        component: {},
        meta: {
          title: "Test",
          breadcrumb: true,
        },
        children: [
          {
            path: "/test/child",
            name: "", // Invalid: no name
            component: {},
            meta: {
              title: "Child",
              breadcrumb: true,
            },
          },
        ],
      };

      const result = validateRoute(routeWithInvalidChildren);
      expect(result).toBe(false);
    });
  });

  describe("flattenRoutes", () => {
    it("should flatten nested routes into single array", () => {
      const result = flattenRoutes(mockRoutes);
      expect(result).toHaveLength(5); // 3 parent + 2 children
    });

    it("should preserve route order", () => {
      const result = flattenRoutes(mockRoutes);
      expect(result[0].name).toBe("Marketplace");
      expect(result[1].name).toBe("Dashboard");
      expect(result[2].name).toBe("DashboardList");
      expect(result[3].name).toBe("DashboardNew");
      expect(result[4].name).toBe("Settings");
    });

    it("should handle routes without children", () => {
      const routesWithoutChildren = [mockRoutes[0], mockRoutes[2]];
      const result = flattenRoutes(routesWithoutChildren);
      expect(result).toHaveLength(2);
    });

    it("should handle empty routes array", () => {
      const result = flattenRoutes([]);
      expect(result).toEqual([]);
    });

    it("should handle deeply nested routes", () => {
      const deeplyNestedRoutes: AppRouteRecordRaw[] = [
        {
          path: "/level1",
          name: "Level1",
          component: {},
          meta: { title: "Level 1" },
          children: [
            {
              path: "/level1/level2",
              name: "Level2",
              component: {},
              meta: { title: "Level 2" },
              children: [
                {
                  path: "/level1/level2/level3",
                  name: "Level3",
                  component: {},
                  meta: { title: "Level 3" },
                },
              ],
            },
          ],
        },
      ];

      const result = flattenRoutes(deeplyNestedRoutes);
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe("Level1");
      expect(result[1].name).toBe("Level2");
      expect(result[2].name).toBe("Level3");
    });
  });

  describe("Edge Cases", () => {
    it("should handle routes with null/undefined values gracefully", () => {
      const routeWithNulls: AppRouteRecordRaw = {
        path: "/test",
        name: "Test",
        component: {},
        meta: {
          title: "Test",
          breadcrumb: true,
        },
        children: [
          {
            path: "/test/child",
            name: "Child",
            component: {},
            meta: {
              title: "Child",
              breadcrumb: true,
            },
          },
        ],
      };

      expect(() => validateRoute(routeWithNulls)).not.toThrow();
      expect(() => generateBreadcrumb(routeWithNulls)).not.toThrow();
      expect(() => flattenRoutes([routeWithNulls])).not.toThrow();
    });

    it("should handle circular references gracefully", () => {
      const route1: AppRouteRecordRaw = {
        path: "/route1",
        name: "Route1",
        component: {},
        meta: { title: "Route 1" },
        children: [],
      };

      const route2: AppRouteRecordRaw = {
        path: "/route2",
        name: "Route2",
        component: {},
        meta: { title: "Route 2" },
        children: [route1],
      };

      // Create circular reference
      route1.children = [route2];

      // Should not cause infinite loops
      expect(() => flattenRoutes([route1])).toThrow();
    });
  });
});
