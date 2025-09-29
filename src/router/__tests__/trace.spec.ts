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
import { ROUTE_NAMES, ROUTE_PATHS, META_KEYS } from "../constants";

// Mock Vue SFC imports used by the route module
vi.mock("@/layout/Index.vue", () => ({ default: {} }));
vi.mock("@/views/dashboard/Trace.vue", () => ({ default: {} }));

// Import after mocks
import { routesTrace } from "../trace";

describe("Trace Routes", () => {
  it("should export trace routes array", () => {
    expect(routesTrace).toBeDefined();
    expect(Array.isArray(routesTrace)).toBe(true);
    expect(routesTrace).toHaveLength(1);
  });

  it("should have correct root trace route structure", () => {
    const rootRoute = routesTrace[0];

    expect(rootRoute.name).toBe(ROUTE_NAMES.TRACE);
    expect(rootRoute.path).toBe("");
    expect(rootRoute.meta?.[META_KEYS.NOT_SHOW]).toBe(false);

    expect(rootRoute.children).toBeDefined();
    expect(rootRoute.children).toHaveLength(1);
  });

  it("should have child view trace route with correct path and meta", () => {
    const rootRoute = routesTrace[0];
    const childRoute = rootRoute.children?.[0];

    expect(childRoute).toBeDefined();
    expect(childRoute?.name).toBe("ViewTrace");
    expect(childRoute?.path).toBe(ROUTE_PATHS.TRACE);
    expect(childRoute?.meta?.[META_KEYS.NOT_SHOW]).toBe(false);
  });
});
