/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRootGuard, createAuthGuard, createValidationGuard, createErrorGuard, applyGuards } from "../guards";
import { getDefaultRoute } from "../utils";
import { ROUTE_PATHS } from "../constants";

// Mock utils
vi.mock("../utils", () => ({
  getDefaultRoute: vi.fn(),
}));

describe("Router Guards", () => {
  const mockNext = vi.fn();
  const mockRoutes = [
    { path: "/marketplace", name: "Marketplace" },
    { path: "/dashboard", name: "Dashboard" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (getDefaultRoute as any).mockReturnValue("/marketplace");
  });

  describe("createRootGuard", () => {
    it("should redirect root path to default route", () => {
      const rootGuard = createRootGuard(mockRoutes);
      const to = { path: ROUTE_PATHS.ROOT };
      const from = { path: "/some-path" };

      rootGuard(to, from, mockNext);

      expect(getDefaultRoute).toHaveBeenCalledWith(mockRoutes);
      expect(mockNext).toHaveBeenCalledWith({ path: "/marketplace" });
    });

    it("should allow non-root paths to pass through", () => {
      const rootGuard = createRootGuard(mockRoutes);
      const to = { path: "/dashboard" };
      const from = { path: "/some-path" };

      rootGuard(to, from, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should handle different default routes", () => {
      (getDefaultRoute as any).mockReturnValue("/dashboard");
      const rootGuard = createRootGuard(mockRoutes);
      const to = { path: ROUTE_PATHS.ROOT };
      const from = { path: "/some-path" };

      rootGuard(to, from, mockNext);

      expect(mockNext).toHaveBeenCalledWith({ path: "/dashboard" });
    });
  });

  describe("createAuthGuard", () => {
    it("should allow all routes to pass through (placeholder implementation)", () => {
      const authGuard = createAuthGuard();
      const to = { path: "/protected", meta: { requiresAuth: true } };
      const from = { path: "/some-path" };

      authGuard(to, from, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should handle routes without auth requirements", () => {
      const authGuard = createAuthGuard();
      const to = { path: "/public", meta: {} };
      const from = { path: "/some-path" };

      authGuard(to, from, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should handle routes with requiresAuth: false", () => {
      const authGuard = createAuthGuard();
      const to = { path: "/public", meta: { requiresAuth: false } };
      const from = { path: "/some-path" };

      authGuard(to, from, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe("createValidationGuard", () => {
    it("should allow routes without parameters to pass through", () => {
      const validationGuard = createValidationGuard();
      const to = { path: "/simple", params: {} };
      const from = { path: "/some-path" };

      validationGuard(to, from, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should allow routes with valid parameters to pass through", () => {
      const validationGuard = createValidationGuard();
      const to = { path: "/valid", params: { id: "123", name: "test" } };
      const from = { path: "/some-path" };

      validationGuard(to, from, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should redirect to NotFound for routes with invalid parameters", () => {
      const validationGuard = createValidationGuard();
      const to = { path: "/invalid", params: { id: "", name: null } };
      const from = { path: "/some-path" };

      validationGuard(to, from, mockNext);

      expect(mockNext).toHaveBeenCalledWith({ name: "NotFound" });
    });

    it("should redirect to NotFound for routes with undefined parameters", () => {
      const validationGuard = createValidationGuard();
      const to = { path: "/invalid", params: { id: undefined } };
      const from = { path: "/some-path" };

      validationGuard(to, from, mockNext);

      expect(mockNext).toHaveBeenCalledWith({ name: "NotFound" });
    });

    it("should handle mixed valid and invalid parameters", () => {
      const validationGuard = createValidationGuard();
      const to = { path: "/mixed", params: { id: "123", name: "" } };
      const from = { path: "/some-path" };

      validationGuard(to, from, mockNext);

      expect(mockNext).toHaveBeenCalledWith({ name: "NotFound" });
    });
  });

  describe("createErrorGuard", () => {
    it("should handle NavigationDuplicated errors silently", () => {
      const errorGuard = createErrorGuard();
      const error = { name: "NavigationDuplicated" };

      expect(() => errorGuard(error)).not.toThrow();
    });

    it("should re-throw non-NavigationDuplicated errors", () => {
      const errorGuard = createErrorGuard();
      const error = { name: "OtherError", message: "Something went wrong" };

      expect(() => errorGuard(error)).toThrow();
    });

    it("should log router errors", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const errorGuard = createErrorGuard();
      const error = { name: "TestError", message: "Test error" };

      try {
        errorGuard(error);
      } catch {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith("Router error:", error);
      consoleSpy.mockRestore();
    });
  });

  describe("applyGuards", () => {
    it("should apply all navigation guards to router", () => {
      const mockRouter = {
        beforeEach: vi.fn(),
        onError: vi.fn(),
      };

      applyGuards(mockRouter, mockRoutes);

      expect(mockRouter.beforeEach).toHaveBeenCalledTimes(3);
      expect(mockRouter.onError).toHaveBeenCalledTimes(1);
    });

    it("should apply guards in correct order", () => {
      const mockRouter = {
        beforeEach: vi.fn(),
        onError: vi.fn(),
      };

      applyGuards(mockRouter, mockRoutes);

      // Verify the order: rootGuard, authGuard, validationGuard
      const calls = mockRouter.beforeEach.mock.calls;
      expect(calls).toHaveLength(3);
    });

    it("should apply error guard", () => {
      const mockRouter = {
        beforeEach: vi.fn(),
        onError: vi.fn(),
      };

      applyGuards(mockRouter, mockRoutes);

      expect(mockRouter.onError).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("Guard Integration", () => {
    it("should work together without conflicts", () => {
      const mockRouter = {
        beforeEach: vi.fn(),
        onError: vi.fn(),
      };

      // Apply all guards
      applyGuards(mockRouter, mockRoutes);

      // Test root guard
      const rootGuard = mockRouter.beforeEach.mock.calls[0][0];
      const to = { path: ROUTE_PATHS.ROOT };
      const from = { path: "/some-path" };

      rootGuard(to, from, mockNext);
      expect(mockNext).toHaveBeenCalledWith({ path: "/marketplace" });

      // Test validation guard
      const validationGuard = mockRouter.beforeEach.mock.calls[2][0];
      const validTo = { path: "/valid", params: { id: "123" } };

      validationGuard(validTo, from, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
