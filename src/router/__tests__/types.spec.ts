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
import type { RouteMeta, AppRouteRecordRaw, RouteConfig, NavigationGuard } from "../types";

describe("Router Types", () => {
  describe("RouteMeta Interface", () => {
    it("should allow all optional properties", () => {
      const minimalMeta: RouteMeta = {};
      expect(minimalMeta).toBeDefined();

      const fullMeta: RouteMeta = {
        title: "Test Route",
        i18nKey: "test.route",
        icon: "test-icon",
        hasGroup: true,
        activate: false,
        descKey: "test.description",
        layer: "test-layer",
        notShow: false,
        requiresAuth: true,
        breadcrumb: true,
      };

      expect(fullMeta.title).toBe("Test Route");
      expect(fullMeta.i18nKey).toBe("test.route");
      expect(fullMeta.icon).toBe("test-icon");
      expect(fullMeta.hasGroup).toBe(true);
      expect(fullMeta.activate).toBe(false);
      expect(fullMeta.descKey).toBe("test.description");
      expect(fullMeta.layer).toBe("test-layer");
      expect(fullMeta.notShow).toBe(false);
      expect(fullMeta.requiresAuth).toBe(true);
      expect(fullMeta.breadcrumb).toBe(true);
    });

    it("should allow partial properties", () => {
      const partialMeta: RouteMeta = {
        title: "Partial Route",
        icon: "partial-icon",
      };

      expect(partialMeta.title).toBe("Partial Route");
      expect(partialMeta.icon).toBe("partial-icon");
      expect(partialMeta.i18nKey).toBeUndefined();
      expect(partialMeta.hasGroup).toBeUndefined();
    });

    it("should handle string properties correctly", () => {
      const stringMeta: RouteMeta = {
        title: "String Title",
        i18nKey: "string.key",
        icon: "string-icon",
        descKey: "string.description",
        layer: "string-layer",
      };

      expect(typeof stringMeta.title).toBe("string");
      expect(typeof stringMeta.i18nKey).toBe("string");
      expect(typeof stringMeta.icon).toBe("string");
      expect(typeof stringMeta.descKey).toBe("string");
      expect(typeof stringMeta.layer).toBe("string");
    });

    it("should handle boolean properties correctly", () => {
      const booleanMeta: RouteMeta = {
        hasGroup: true,
        activate: false,
        notShow: true,
        requiresAuth: false,
        breadcrumb: true,
      };

      expect(typeof booleanMeta.hasGroup).toBe("boolean");
      expect(typeof booleanMeta.activate).toBe("boolean");
      expect(typeof booleanMeta.notShow).toBe("boolean");
      expect(typeof booleanMeta.requiresAuth).toBe("boolean");
      expect(typeof booleanMeta.breadcrumb).toBe("boolean");
    });
  });

  describe("AppRouteRecordRaw Interface", () => {
    it("should extend RouteRecordRaw with custom meta", () => {
      const route: AppRouteRecordRaw = {
        path: "/test",
        name: "TestRoute",
        component: {},
        meta: {
          title: "Test Route",
          i18nKey: "test.route",
        },
      };

      expect(route.path).toBe("/test");
      expect(route.name).toBe("TestRoute");
      expect(route.component).toBeDefined();
      expect(route.meta.title).toBe("Test Route");
      expect(route.meta.i18nKey).toBe("test.route");
    });

    it("should support nested children", () => {
      const parentRoute: AppRouteRecordRaw = {
        path: "/parent",
        name: "ParentRoute",
        component: {},
        meta: {
          title: "Parent Route",
          hasGroup: true,
        },
        children: [
          {
            path: "/parent/child",
            name: "ChildRoute",
            component: {},
            meta: {
              title: "Child Route",
              breadcrumb: true,
            },
          },
        ],
      };

      expect(parentRoute.children).toBeDefined();
      expect(parentRoute.children).toHaveLength(1);
      expect(parentRoute.children![0].name).toBe("ChildRoute");
      expect(parentRoute.children![0].meta.title).toBe("Child Route");
    });

    it("should support deeply nested children", () => {
      const deepRoute: AppRouteRecordRaw = {
        path: "/level1",
        name: "Level1Route",
        component: {},
        meta: { title: "Level 1" },
        children: [
          {
            path: "/level1/level2",
            name: "Level2Route",
            component: {},
            meta: { title: "Level 2" },
            children: [
              {
                path: "/level1/level2/level3",
                name: "Level3Route",
                component: {},
                meta: { title: "Level 3" },
              },
            ],
          },
        ],
      };

      expect(deepRoute.children![0].children).toBeDefined();
      expect(deepRoute.children![0].children![0].name).toBe("Level3Route");
    });

    it("should support redirect property", () => {
      const redirectRoute: AppRouteRecordRaw = {
        path: "/redirect",
        name: "RedirectRoute",
        redirect: "/target",
        component: {},
        meta: {
          title: "Redirect Route",
          notShow: true,
        },
      };

      expect(redirectRoute.redirect).toBe("/target");
    });

    it("should support alias property", () => {
      const aliasRoute: AppRouteRecordRaw = {
        path: "/alias",
        name: "AliasRoute",
        component: {},
        alias: "/alternative",
        meta: {
          title: "Alias Route",
        },
      };

      expect(aliasRoute.alias).toBe("/alternative");
    });

    it("should support beforeEnter guard", () => {
      const guardRoute: AppRouteRecordRaw = {
        path: "/guarded",
        name: "GuardedRoute",
        component: {},
        beforeEnter: (to, from, next) => {
          next();
        },
        meta: {
          title: "Guarded Route",
          requiresAuth: true,
        },
      };

      expect(typeof guardRoute.beforeEnter).toBe("function");
    });
  });

  describe("RouteConfig Interface", () => {
    it("should define route configuration structure", () => {
      const routeConfig: RouteConfig = {
        path: "/config",
        name: "ConfigRoute",
        component: {},
        meta: {
          title: "Config Route",
          icon: "config-icon",
        },
      };

      expect(routeConfig.path).toBe("/config");
      expect(routeConfig.name).toBe("ConfigRoute");
      expect(routeConfig.component).toBeDefined();
      expect(routeConfig.meta.title).toBe("Config Route");
    });

    it("should support nested route configuration", () => {
      const nestedConfig: RouteConfig = {
        path: "/nested",
        name: "NestedRoute",
        component: {},
        meta: {
          title: "Nested Route",
          hasGroup: true,
        },
        children: [
          {
            path: "/nested/child",
            name: "NestedChild",
            component: {},
            meta: {
              title: "Nested Child",
            },
          },
        ],
      };

      expect(nestedConfig.children).toBeDefined();
      expect(nestedConfig.children![0].name).toBe("NestedChild");
    });
  });

  describe("NavigationGuard Interface", () => {
    it("should define navigation guard structure", () => {
      const guard: NavigationGuard = {
        to: { path: "/to", name: "ToRoute" },
        from: { path: "/from", name: "FromRoute" },
        next: () => {},
      };

      expect(guard.to.path).toBe("/to");
      expect(guard.from.path).toBe("/from");
      expect(typeof guard.next).toBe("function");
    });

    it("should support different route object structures", () => {
      const guard: NavigationGuard = {
        to: { path: "/to", params: { id: "123" }, query: { tab: "info" } },
        from: { path: "/from", hash: "#section" },
        next: () => {},
      };

      expect(guard.to.params?.id).toBe("123");
      expect(guard.to.query?.tab).toBe("info");
      expect(guard.from.hash).toBe("#section");
    });
  });

  describe("Type Compatibility", () => {
    it("should be compatible with Vue Router types", () => {
      // This test ensures our types extend Vue Router types correctly
      const route: AppRouteRecordRaw = {
        path: "/compatible",
        name: "CompatibleRoute",
        component: {},
        meta: {
          title: "Compatible Route",
        },
      };

      // Should have all required Vue Router properties
      expect(route).toHaveProperty("path");
      expect(route).toHaveProperty("name");
      expect(route).toHaveProperty("component");
      expect(route).toHaveProperty("meta");

      // Should have our custom meta structure
      expect(route.meta).toHaveProperty("title");
    });

    it("should support route meta inheritance", () => {
      const baseMeta: RouteMeta = {
        title: "Base Title",
        icon: "base-icon",
      };

      const extendedMeta: RouteMeta = {
        ...baseMeta,
        hasGroup: true,
        activate: false,
      };

      expect(extendedMeta.title).toBe("Base Title");
      expect(extendedMeta.icon).toBe("base-icon");
      expect(extendedMeta.hasGroup).toBe(true);
      expect(extendedMeta.activate).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty meta objects", () => {
      const emptyMetaRoute: AppRouteRecordRaw = {
        path: "/empty",
        name: "EmptyRoute",
        component: {},
        meta: {},
      };

      expect(emptyMetaRoute.meta).toEqual({});
    });

    it("should handle null/undefined values in meta", () => {
      const nullMetaRoute: AppRouteRecordRaw = {
        path: "/null",
        name: "NullRoute",
        component: {},
        meta: {
          title: "Null Route",
          i18nKey: undefined,
          icon: null as any,
        },
      };

      expect(nullMetaRoute.meta.title).toBe("Null Route");
      expect(nullMetaRoute.meta.i18nKey).toBeUndefined();
    });

    it("should handle complex nested structures", () => {
      const complexRoute: AppRouteRecordRaw = {
        path: "/complex",
        name: "ComplexRoute",
        component: {},
        meta: {
          title: "Complex Route",
          hasGroup: true,
        },
        children: [
          {
            path: "/complex/child1",
            name: "ComplexChild1",
            component: {},
            meta: { title: "Child 1" },
            children: [
              {
                path: "/complex/child1/grandchild",
                name: "Grandchild",
                component: {},
                meta: { title: "Grandchild" },
              },
            ],
          },
          {
            path: "/complex/child2",
            name: "ComplexChild2",
            component: {},
            meta: { title: "Child 2" },
          },
        ],
      };

      expect(complexRoute.children![0].children).toHaveLength(1);
      expect(complexRoute.children![1].children).toBeUndefined();
    });
  });
});
