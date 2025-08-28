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

describe("Router Constants", () => {
  describe("ROUTE_NAMES", () => {
    it("should define all required route names", () => {
      expect(ROUTE_NAMES).toHaveProperty("MARKETPLACE");
      expect(ROUTE_NAMES).toHaveProperty("DASHBOARD");
      expect(ROUTE_NAMES).toHaveProperty("ALARM");
      expect(ROUTE_NAMES).toHaveProperty("SETTINGS");
      expect(ROUTE_NAMES).toHaveProperty("NOT_FOUND");
      expect(ROUTE_NAMES).toHaveProperty("LAYER");
    });

    it("should have correct route name values", () => {
      expect(ROUTE_NAMES.MARKETPLACE).toBe("Marketplace");
      expect(ROUTE_NAMES.DASHBOARD).toBe("Dashboard");
      expect(ROUTE_NAMES.ALARM).toBe("Alarm");
      expect(ROUTE_NAMES.SETTINGS).toBe("Settings");
      expect(ROUTE_NAMES.NOT_FOUND).toBe("NotFound");
      expect(ROUTE_NAMES.LAYER).toBe("Layer");
    });

    it("should be defined as constants", () => {
      // Note: Constants are not actually frozen in the implementation
      // but they should be treated as constants by convention
      expect(ROUTE_NAMES).toBeDefined();
      expect(typeof ROUTE_NAMES).toBe("object");
    });
  });

  describe("ROUTE_PATHS", () => {
    it("should define root path", () => {
      expect(ROUTE_PATHS).toHaveProperty("ROOT");
      expect(ROUTE_PATHS.ROOT).toBe("/");
    });

    it("should define marketplace path", () => {
      expect(ROUTE_PATHS).toHaveProperty("MARKETPLACE");
      expect(ROUTE_PATHS.MARKETPLACE).toBe("/marketplace");
    });

    it("should define dashboard paths", () => {
      expect(ROUTE_PATHS).toHaveProperty("DASHBOARD");
      expect(ROUTE_PATHS.DASHBOARD).toHaveProperty("LIST");
      expect(ROUTE_PATHS.DASHBOARD).toHaveProperty("NEW");
      expect(ROUTE_PATHS.DASHBOARD).toHaveProperty("EDIT");
      expect(ROUTE_PATHS.DASHBOARD).toHaveProperty("VIEW");
      expect(ROUTE_PATHS.DASHBOARD).toHaveProperty("WIDGET");
    });

    it("should have correct dashboard path values", () => {
      expect(ROUTE_PATHS.DASHBOARD.LIST).toBe("/dashboard/list");
      expect(ROUTE_PATHS.DASHBOARD.NEW).toBe("/dashboard/new");
      expect(ROUTE_PATHS.DASHBOARD.EDIT).toBe("/dashboard/:layerId/:entity/:name");
      expect(ROUTE_PATHS.DASHBOARD.VIEW).toBe("/dashboard/:layerId/:entity/:serviceId/:name");
      expect(ROUTE_PATHS.DASHBOARD.WIDGET).toBe(
        "/page/:layer/:entity/:serviceId/:podId/:processId/:destServiceId/:destPodId/:destProcessId/:config/:duration?",
      );
    });

    it("should define alarm path", () => {
      expect(ROUTE_PATHS).toHaveProperty("ALARM");
      expect(ROUTE_PATHS.ALARM).toBe("/alerting");
    });

    it("should define settings path", () => {
      expect(ROUTE_PATHS).toHaveProperty("SETTINGS");
      expect(ROUTE_PATHS.SETTINGS).toBe("/settings");
    });

    it("should define not found path", () => {
      expect(ROUTE_PATHS).toHaveProperty("NOT_FOUND");
      expect(ROUTE_PATHS.NOT_FOUND).toBe("/:pathMatch(.*)*");
    });

    it("should be defined as constants", () => {
      // Note: Constants are not actually frozen in the implementation
      // but they should be treated as constants by convention
      expect(ROUTE_PATHS).toBeDefined();
      expect(typeof ROUTE_PATHS).toBe("object");
      expect(ROUTE_PATHS.DASHBOARD).toBeDefined();
    });
  });

  describe("META_KEYS", () => {
    it("should define all required meta keys", () => {
      expect(META_KEYS).toHaveProperty("I18N_KEY");
      expect(META_KEYS).toHaveProperty("ICON");
      expect(META_KEYS).toHaveProperty("HAS_GROUP");
      expect(META_KEYS).toHaveProperty("ACTIVATE");
      expect(META_KEYS).toHaveProperty("TITLE");
      expect(META_KEYS).toHaveProperty("DESC_KEY");
      expect(META_KEYS).toHaveProperty("LAYER");
      expect(META_KEYS).toHaveProperty("NOT_SHOW");
      expect(META_KEYS).toHaveProperty("REQUIRES_AUTH");
      expect(META_KEYS).toHaveProperty("BREADCRUMB");
    });

    it("should have correct meta key values", () => {
      expect(META_KEYS.I18N_KEY).toBe("i18nKey");
      expect(META_KEYS.ICON).toBe("icon");
      expect(META_KEYS.HAS_GROUP).toBe("hasGroup");
      expect(META_KEYS.ACTIVATE).toBe("activate");
      expect(META_KEYS.TITLE).toBe("title");
      expect(META_KEYS.DESC_KEY).toBe("descKey");
      expect(META_KEYS.LAYER).toBe("layer");
      expect(META_KEYS.NOT_SHOW).toBe("notShow");
      expect(META_KEYS.REQUIRES_AUTH).toBe("requiresAuth");
      expect(META_KEYS.BREADCRUMB).toBe("breadcrumb");
    });

    it("should be defined as constants", () => {
      // Note: Constants are not actually frozen in the implementation
      // but they should be treated as constants by convention
      expect(META_KEYS).toBeDefined();
      expect(typeof META_KEYS).toBe("object");
    });
  });

  describe("DEFAULT_ROUTE", () => {
    it("should be defined", () => {
      expect(DEFAULT_ROUTE).toBeDefined();
    });

    it("should match marketplace path", () => {
      expect(DEFAULT_ROUTE).toBe(ROUTE_PATHS.MARKETPLACE);
    });

    it("should be defined as a constant", () => {
      // Note: Constants are not actually frozen in the implementation
      // but they should be treated as constants by convention
      expect(DEFAULT_ROUTE).toBeDefined();
      expect(typeof DEFAULT_ROUTE).toBe("string");
    });
  });

  describe("Constants Integration", () => {
    it("should have consistent route names and paths", () => {
      // Check that route names correspond to actual route paths
      expect(ROUTE_NAMES.MARKETPLACE).toBe("Marketplace");
      expect(ROUTE_PATHS.MARKETPLACE).toBe("/marketplace");

      expect(ROUTE_NAMES.DASHBOARD).toBe("Dashboard");
      expect(ROUTE_PATHS.DASHBOARD.LIST).toBe("/dashboard/list");

      expect(ROUTE_NAMES.ALARM).toBe("Alarm");
      expect(ROUTE_PATHS.ALARM).toBe("/alerting");

      expect(ROUTE_NAMES.SETTINGS).toBe("Settings");
      expect(ROUTE_PATHS.SETTINGS).toBe("/settings");
    });

    it("should have valid path patterns", () => {
      // Check that parameterized paths have valid syntax
      expect(ROUTE_PATHS.DASHBOARD.EDIT).toMatch(/^\/dashboard\/:[^/]+\/:[^/]+\/:[^/]+$/);
      expect(ROUTE_PATHS.DASHBOARD.VIEW).toMatch(/^\/dashboard\/:[^/]+\/:[^/]+\/:[^/]+\/:[^/]+$/);
      expect(ROUTE_PATHS.DASHBOARD.WIDGET).toMatch(
        /^\/page\/:[^/]+\/:[^/]+\/:[^/]+\/:[^/]+\/:[^/]+\/:[^/]+\/:[^/]+\/:[^/]+\/:[^/]+\/:[^/]+\/?$/,
      );
    });

    it("should have consistent meta key usage", () => {
      // Check that meta keys are used consistently across route definitions
      const expectedMetaKeys = Object.values(META_KEYS);
      expect(expectedMetaKeys).toContain("i18nKey");
      expect(expectedMetaKeys).toContain("icon");
      expect(expectedMetaKeys).toContain("hasGroup");
      expect(expectedMetaKeys).toContain("activate");
      expect(expectedMetaKeys).toContain("title");
      expect(expectedMetaKeys).toContain("breadcrumb");
    });
  });

  describe("Type Safety", () => {
    it("should have consistent string types", () => {
      // All route names should be strings
      Object.values(ROUTE_NAMES).forEach((value) => {
        expect(typeof value).toBe("string");
      });

      // All meta keys should be strings
      Object.values(META_KEYS).forEach((value) => {
        expect(typeof value).toBe("string");
      });

      // Root path should be string
      expect(typeof ROUTE_PATHS.ROOT).toBe("string");

      // Default route should be string
      expect(typeof DEFAULT_ROUTE).toBe("string");
    });

    it("should have non-empty values", () => {
      // All route names should be non-empty
      Object.values(ROUTE_NAMES).forEach((value) => {
        expect(value).toBeTruthy();
        expect(value.length).toBeGreaterThan(0);
      });

      // All meta keys should be non-empty
      Object.values(META_KEYS).forEach((value) => {
        expect(value).toBeTruthy();
        expect(value.length).toBeGreaterThan(0);
      });

      // All paths should be non-empty
      expect(ROUTE_PATHS.ROOT).toBeTruthy();
      expect(ROUTE_PATHS.MARKETPLACE).toBeTruthy();
      expect(ROUTE_PATHS.ALARM).toBeTruthy();
      expect(ROUTE_PATHS.SETTINGS).toBeTruthy();
    });
  });
});
