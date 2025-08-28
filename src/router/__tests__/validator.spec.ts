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

import { describe, it, expect, beforeEach } from "vitest";
import { RouteValidator, RouteAnalyzer } from "../validator";
import type { AppRouteRecordRaw } from "../types";

describe("Route Validator", () => {
  const mockComponent = { template: "<div>Test</div>" };

  const validRoutes: AppRouteRecordRaw[] = [
    {
      path: "/valid1",
      name: "ValidRoute1",
      component: mockComponent,
      meta: { title: "Valid Route 1" },
    },
    {
      path: "/valid2",
      name: "ValidRoute2",
      component: mockComponent,
      meta: { title: "Valid Route 2" },
    },
  ];

  const invalidRoutes: AppRouteRecordRaw[] = [
    {
      path: "/invalid1",
      name: "", // Invalid: empty name
      component: mockComponent,
      meta: { title: "Invalid Route 1" },
    },
    {
      path: "/invalid2",
      name: "InvalidRoute2",
      component: null, // Invalid: null component
      meta: { title: "Invalid Route 2" },
    },
    {
      path: "", // Invalid: empty path
      name: "InvalidRoute3",
      component: mockComponent,
      meta: { title: "Invalid Route 3" },
    },
  ];

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

  describe("RouteValidator", () => {
    let validator: RouteValidator;

    beforeEach(() => {
      validator = new RouteValidator();
    });

    describe("validateRoutes", () => {
      it("should validate valid routes without errors", () => {
        const errors = validator.validateRoutes(validRoutes);
        expect(errors).toHaveLength(0);
      });

      it("should detect validation errors in invalid routes", () => {
        const errors = validator.validateRoutes(invalidRoutes);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((e) => e.type === "error")).toBe(true);
      });

      it("should validate nested routes", () => {
        const errors = validator.validateRoutes(nestedRoutes);
        expect(errors).toHaveLength(0);
      });

      it("should handle empty routes array", () => {
        const errors = validator.validateRoutes([]);
        expect(errors).toHaveLength(0);
      });

      it("should reset errors between validations", () => {
        // First validation
        const errors1 = validator.validateRoutes(invalidRoutes);
        expect(errors1.length).toBeGreaterThan(0);

        // Second validation
        const errors2 = validator.validateRoutes(validRoutes);
        expect(errors2).toHaveLength(0);
      });
    });

    describe("validateRoute", () => {
      it("should validate individual valid route", () => {
        const route = validRoutes[0];
        validator.validateRoutes([route]);
        const errors = validator.validateRoutes([route]);
        expect(errors).toHaveLength(0);
      });

      it("should detect missing name", () => {
        const route: AppRouteRecordRaw = {
          path: "/missing-name",
          name: "",
          component: mockComponent,
          meta: { title: "Missing Name" },
        };

        const errors = validator.validateRoutes([route]);
        const nameError = errors.find((e) => e.error.includes("name is required"));
        expect(nameError).toBeDefined();
        expect(nameError?.type).toBe("error");
      });

      it("should detect missing component", () => {
        const route: AppRouteRecordRaw = {
          path: "/missing-component",
          name: "MissingComponent",
          component: null as any,
          meta: { title: "Missing Component" },
        };

        const errors = validator.validateRoutes([route]);
        const componentError = errors.find((e) => e.error.includes("component is required"));
        expect(componentError).toBeDefined();
        expect(componentError?.type).toBe("error");
      });

      it("should detect missing path", () => {
        const route: AppRouteRecordRaw = {
          path: "",
          name: "MissingPath",
          component: mockComponent,
          meta: {
            title: "Missing Path",
          },
        };

        const errors = validator.validateRoutes([route]);
        const pathError = errors.find((e) => e.error.includes("cannot be empty unless it has children"));
        expect(pathError).toBeDefined();
        expect(pathError?.type).toBe("error");
      });

      it("should validate nested children", () => {
        const routeWithInvalidChild: AppRouteRecordRaw = {
          path: "/parent",
          name: "ParentRoute",
          component: mockComponent,
          meta: { title: "Parent Route" },
          children: [
            {
              path: "/parent/child",
              name: "", // Invalid child
              component: mockComponent,
              meta: { title: "Invalid Child" },
            },
          ],
        };

        const errors = validator.validateRoutes([routeWithInvalidChild]);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((e) => e.error.includes("name is required"))).toBe(true);
      });

      it("should allow empty paths for layout routes with children", () => {
        const layoutRoute: AppRouteRecordRaw = {
          path: "",
          name: "LayoutRoute",
          component: mockComponent,
          meta: { title: "Layout Route" },
          children: [
            {
              path: "/child",
              name: "ChildRoute",
              component: mockComponent,
              meta: { title: "Child Route" },
            },
          ],
        };

        const errors = validator.validateRoutes([layoutRoute]);
        expect(errors).toHaveLength(0);
      });
    });

    describe("validateUniqueness", () => {
      it("should detect duplicate route names", () => {
        const duplicateNameRoutes: AppRouteRecordRaw[] = [
          {
            path: "/route1",
            name: "DuplicateName",
            component: mockComponent,
            meta: { title: "Route 1" },
          },
          {
            path: "/route2",
            name: "DuplicateName", // Duplicate name
            component: mockComponent,
            meta: { title: "Route 2" },
          },
        ];

        const errors = validator.validateRoutes(duplicateNameRoutes);
        const duplicateNameError = errors.find((e) => e.error.includes("Duplicate route name"));
        expect(duplicateNameError).toBeDefined();
        expect(duplicateNameError?.type).toBe("error");
      });

      it("should detect duplicate route paths", () => {
        const duplicatePathRoutes: AppRouteRecordRaw[] = [
          {
            path: "/duplicate",
            name: "Route1",
            component: mockComponent,
            meta: { title: "Route 1" },
          },
          {
            path: "/duplicate", // Duplicate path
            name: "Route2",
            component: mockComponent,
            meta: { title: "Route 2" },
          },
        ];

        const errors = validator.validateRoutes(duplicatePathRoutes);
        const duplicatePathError = errors.find((e) => e.error.includes("Duplicate route path"));
        expect(duplicatePathError).toBeDefined();
        expect(duplicatePathError?.type).toBe("error");
      });

      it("should handle empty paths for layout routes", () => {
        const layoutRoutes: AppRouteRecordRaw[] = [
          {
            path: "",
            name: "Layout1",
            component: mockComponent,
            meta: { title: "Layout 1" },
          },
          {
            path: "",
            name: "Layout2",
            component: mockComponent,
            meta: { title: "Layout 2" },
          },
        ];

        const errors = validator.validateRoutes(layoutRoutes);
        // Empty paths should not cause duplicate path errors
        const duplicatePathError = errors.find((e) => e.error.includes("Duplicate route path"));
        expect(duplicatePathError).toBeUndefined();
      });
    });

    describe("isValid", () => {
      it("should return true for valid routes", () => {
        const isValid = validator.isValid(validRoutes);
        expect(isValid).toBe(true);
      });

      it("should return false for invalid routes", () => {
        const isValid = validator.isValid(invalidRoutes);
        expect(isValid).toBe(false);
      });

      it("should return true for empty routes array", () => {
        const isValid = validator.isValid([]);
        expect(isValid).toBe(true);
      });
    });

    describe("getValidationSummary", () => {
      it("should provide correct validation summary for valid routes", () => {
        const summary = validator.getValidationSummary(validRoutes);
        expect(summary.total).toBe(2);
        expect(summary.errors).toBe(0);
        expect(summary.warnings).toBe(0);
        expect(summary.isValid).toBe(true);
      });

      it("should provide correct validation summary for invalid routes", () => {
        const summary = validator.getValidationSummary(invalidRoutes);
        expect(summary.total).toBe(3);
        expect(summary.errors).toBeGreaterThan(0);
        expect(summary.warnings).toBe(0);
        expect(summary.isValid).toBe(false);
      });

      it("should provide correct validation summary for mixed routes", () => {
        const mixedRoutes = [...validRoutes, ...invalidRoutes];
        const summary = validator.getValidationSummary(mixedRoutes);
        expect(summary.total).toBe(5);
        expect(summary.errors).toBeGreaterThan(0);
        expect(summary.isValid).toBe(false);
      });
    });

    describe("Error Details", () => {
      it("should include correct error information", () => {
        const route: AppRouteRecordRaw = {
          path: "/error-test",
          name: "", // Invalid
          component: mockComponent,
          meta: { title: "Error Test" },
        };

        const errors = validator.validateRoutes([route]);
        expect(errors).toHaveLength(1);

        const error = errors[0];
        expect(error.routeName).toBe("unnamed");
        expect(error.path).toBe("/error-test");
        expect(error.error).toContain("name is required");
        expect(error.type).toBe("error");
      });

      it("should handle routes with no name gracefully", () => {
        const route: AppRouteRecordRaw = {
          path: "/no-name",
          name: undefined as any,
          component: mockComponent,
          meta: { title: "No Name" },
        };

        const errors = validator.validateRoutes([route]);
        expect(errors).toHaveLength(1);
        expect(errors[0].routeName).toBe("unnamed");
      });
    });
  });

  describe("RouteAnalyzer", () => {
    describe("analyzeRoutes", () => {
      it("should analyze simple routes correctly", () => {
        const analysis = RouteAnalyzer.analyzeRoutes(validRoutes);
        expect(analysis.totalRoutes).toBe(2);
        expect(analysis.nestedRoutes).toBe(0);
        expect(analysis.lazyRoutes).toBe(0);
        expect(analysis.redirectRoutes).toBe(0);
        expect(analysis.depth).toBe(0);
      });

      it("should analyze nested routes correctly", () => {
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
            component: () => import("../utils"),
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

      it("should analyze deeply nested routes", () => {
        const deepRoutes: AppRouteRecordRaw[] = [
          {
            path: "/level1",
            name: "Level1",
            component: mockComponent,
            meta: { title: "Level 1" },
            children: [
              {
                path: "/level1/level2",
                name: "Level2",
                component: mockComponent,
                meta: { title: "Level 2" },
                children: [
                  {
                    path: "/level1/level2/level3",
                    name: "Level3",
                    component: mockComponent,
                    meta: { title: "Level 3" },
                  },
                ],
              },
            ],
          },
        ];

        const analysis = RouteAnalyzer.analyzeRoutes(deepRoutes);
        expect(analysis.totalRoutes).toBe(3);
        expect(analysis.nestedRoutes).toBe(2);
        expect(analysis.depth).toBe(2);
      });

      it("should handle empty routes array", () => {
        const analysis = RouteAnalyzer.analyzeRoutes([]);
        expect(analysis.totalRoutes).toBe(0);
        expect(analysis.nestedRoutes).toBe(0);
        expect(analysis.lazyRoutes).toBe(0);
        expect(analysis.redirectRoutes).toBe(0);
        expect(analysis.depth).toBe(0);
      });
    });

    describe("findRoutesByMeta", () => {
      it("should find routes by meta key and value", () => {
        const routesWithMeta: AppRouteRecordRaw[] = [
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

        const icon1Routes = RouteAnalyzer.findRoutesByMeta(routesWithMeta, "icon", "icon1");
        expect(icon1Routes).toHaveLength(2);
        expect(icon1Routes[0].name).toBe("Route1");
        expect(icon1Routes[1].name).toBe("Route2");

        const icon2Routes = RouteAnalyzer.findRoutesByMeta(routesWithMeta, "icon", "icon2");
        expect(icon2Routes).toHaveLength(1);
        expect(icon2Routes[0].name).toBe("Route3");
      });

      it("should find nested routes by meta", () => {
        const routesWithNestedMeta: AppRouteRecordRaw[] = [
          {
            path: "/parent",
            name: "Parent",
            component: mockComponent,
            meta: { title: "Parent", icon: "parent-icon" },
            children: [
              {
                path: "/parent/child",
                name: "Child",
                component: mockComponent,
                meta: { title: "Child", icon: "child-icon" },
              },
            ],
          },
        ];

        const childIconRoutes = RouteAnalyzer.findRoutesByMeta(routesWithNestedMeta, "icon", "child-icon");
        expect(childIconRoutes).toHaveLength(1);
        expect(childIconRoutes[0].name).toBe("Child");

        const parentIconRoutes = RouteAnalyzer.findRoutesByMeta(routesWithNestedMeta, "icon", "parent-icon");
        expect(parentIconRoutes).toHaveLength(1);
        expect(parentIconRoutes[0].name).toBe("Parent");
      });

      it("should return empty array for non-existent meta values", () => {
        const routes = RouteAnalyzer.findRoutesByMeta(validRoutes, "icon", "non-existent");
        expect(routes).toHaveLength(0);
      });

      it("should handle routes without meta", () => {
        const routesWithoutMeta: AppRouteRecordRaw[] = [
          {
            path: "/no-meta",
            name: "NoMeta",
            component: mockComponent,
            meta: {},
          },
        ];

        const routes = RouteAnalyzer.findRoutesByMeta(routesWithoutMeta, "icon", "test");
        expect(routes).toHaveLength(0);
      });
    });
  });

  describe("Integration Tests", () => {
    it("should validate and analyze routes together", () => {
      const validator = new RouteValidator();
      const isValid = validator.isValid(validRoutes);
      expect(isValid).toBe(true);

      const analysis = RouteAnalyzer.analyzeRoutes(validRoutes);
      expect(analysis.totalRoutes).toBe(2);
      // Note: RouteAnalyzer doesn't have isValid property, so we check separately
      expect(validator.isValid(validRoutes)).toBe(true);
    });

    it("should handle complex route structures", () => {
      const complexRoutes: AppRouteRecordRaw[] = [
        {
          path: "/complex",
          name: "ComplexRoute",
          component: mockComponent,
          meta: { title: "Complex Route", hasGroup: true },
          children: [
            {
              path: "/complex/child",
              name: "ComplexChild",
              component: mockComponent,
              meta: { title: "Complex Child", icon: "child-icon" },
            },
          ],
        },
      ];

      // Validate
      const validator = new RouteValidator();
      const isValid = validator.isValid(complexRoutes);
      expect(isValid).toBe(true);

      // Analyze
      const analysis = RouteAnalyzer.analyzeRoutes(complexRoutes);
      expect(analysis.totalRoutes).toBe(2);
      expect(analysis.nestedRoutes).toBe(1);
      expect(analysis.depth).toBe(1);

      // Find by meta
      const hasGroupRoutes = RouteAnalyzer.findRoutesByMeta(complexRoutes, "hasGroup", true);
      expect(hasGroupRoutes).toHaveLength(1);
      expect(hasGroupRoutes[0].name).toBe("ComplexRoute");

      const iconRoutes = RouteAnalyzer.findRoutesByMeta(complexRoutes, "icon", "child-icon");
      expect(iconRoutes).toHaveLength(1);
      expect(iconRoutes[0].name).toBe("ComplexChild");
    });
  });
});
