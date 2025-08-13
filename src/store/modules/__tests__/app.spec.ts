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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { appStore } from "../app";
import { TimeType, Themes } from "@/constants/data";

// Mock the utility functions
vi.mock("@/utils/localtime", () => ({
  default: vi.fn((utc: boolean, date: Date) => date),
}));

vi.mock("@/utils/dateFormat", () => ({
  default: vi.fn((date: Date, step: string, monthDayDiff?: boolean) => {
    if (step === "MINUTE" && monthDayDiff) {
      return "2023-01-01 12:00";
    }
    return "2023-01-01 12:00";
  }),
  dateFormatTime: vi.fn((date: Date, step: string) => {
    if (step === "MINUTE") {
      return "12:00\n01-01";
    }
    return "2023-01-01";
  }),
}));

// Mock graphql
vi.mock("@/graphql", () => ({
  default: {
    query: vi.fn(() => ({
      params: vi.fn(() => Promise.resolve({ data: { getMenuItems: [] } })),
    })),
  },
}));

describe("App Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  describe("State", () => {
    it("should initialize with default state", () => {
      const store = appStore();

      expect(store.utc).toBe("");
      expect(store.utcHour).toBe(0);
      expect(store.utcMin).toBe(0);
      expect(store.timer).toBeNull();
      expect(store.autoRefresh).toBe(false);
      expect(store.version).toBe("");
      expect(store.isMobile).toBe(false);
      expect(store.reloadTimer).toBeNull();
      expect(store.allMenus).toEqual([]);
      expect(store.theme).toBe(Themes.Dark);
      expect(store.coldStageMode).toBe(false);
      expect(store.maxRange).toEqual([]);
      expect(store.metricsTTL).toEqual(null);
      expect(store.recordsTTL).toEqual(null);
    });

    it("should have correct duration row initialization", () => {
      const store = appStore();

      expect(store.durationRow.start).toBeInstanceOf(Date);
      expect(store.durationRow.end).toBeInstanceOf(Date);
      expect(store.durationRow.step).toBe(TimeType.MINUTE_TIME);
    });
  });

  describe("Getters", () => {
    it("should return correct duration", () => {
      const store = appStore();

      const duration = store.duration;

      expect(duration.start).toBeInstanceOf(Date);
      expect(duration.end).toBeInstanceOf(Date);
      expect(duration.step).toBe(TimeType.MINUTE_TIME);
    });

    it("should return correct duration time", () => {
      const store = appStore();

      const durationTime = store.durationTime;

      expect(durationTime.start).toBe("2023-01-01 12:00");
      expect(durationTime.end).toBe("2023-01-01 12:00");
      expect(durationTime.step).toBe(TimeType.MINUTE_TIME);
    });

    it("should calculate interval unix correctly for MINUTE", () => {
      const store = appStore();

      const intervals = store.intervalUnix;

      expect(Array.isArray(intervals)).toBe(true);
      expect(intervals.length).toBeGreaterThan(0);
    });

    it("should calculate interval unix correctly for HOUR", () => {
      const store = appStore();
      store.durationRow.step = "HOUR";

      const intervals = store.intervalUnix;

      expect(Array.isArray(intervals)).toBe(true);
      expect(intervals.length).toBeGreaterThan(0);
    });

    it("should calculate interval unix correctly for DAY", () => {
      const store = appStore();
      store.durationRow.step = "DAY";

      const intervals = store.intervalUnix;

      expect(Array.isArray(intervals)).toBe(true);
      expect(intervals.length).toBeGreaterThan(0);
    });

    it("should return correct interval time", () => {
      const store = appStore();

      const intervalTime = store.intervalTime;

      expect(Array.isArray(intervalTime)).toBe(true);
      expect(intervalTime.length).toBeGreaterThan(0);
    });
  });

  describe("Actions", () => {
    it("should set duration correctly", () => {
      const store = appStore();
      const newDuration = {
        start: new Date("2023-01-01"),
        end: new Date("2023-01-02"),
        step: "HOUR",
      };

      store.setDuration(newDuration);

      expect(store.durationRow).toEqual(newDuration);
    });

    it("should update duration row correctly", () => {
      const store = appStore();
      const newDuration = {
        start: new Date("2023-02-01"),
        end: new Date("2023-02-02"),
        step: "DAY",
      };

      store.updateDurationRow(newDuration);

      expect(store.durationRow).toEqual(newDuration);
    });

    it("should set max range correctly", () => {
      const store = appStore();
      const maxRange = [new Date("2023-01-01"), new Date("2023-01-02")];

      store.setMaxRange(maxRange);

      expect(store.maxRange).toEqual(maxRange);
    });

    it("should set theme correctly", () => {
      const store = appStore();

      store.setTheme(Themes.Light);

      expect(store.theme).toBe(Themes.Light);
    });

    it("should set UTC correctly", () => {
      const store = appStore();

      store.setUTC(5, 30);

      expect(store.utcHour).toBe(5);
      expect(store.utcMin).toBe(30);
      expect(store.utc).toBe("5:30");
    });

    it("should update UTC correctly", () => {
      const store = appStore();

      store.updateUTC("3:45");

      expect(store.utc).toBe("3:45");
    });

    it("should set mobile mode correctly", () => {
      const store = appStore();

      store.setIsMobile(true);

      expect(store.isMobile).toBe(true);
    });

    it("should set auto refresh correctly", () => {
      const store = appStore();

      store.setAutoRefresh(true);

      expect(store.autoRefresh).toBe(true);
    });

    it("should set cold stage mode correctly", () => {
      const store = appStore();

      store.setColdStageMode(true);

      expect(store.coldStageMode).toBe(true);
    });

    it("should set reload timer correctly", () => {
      const store = appStore();
      const mockTimer = setInterval(() => {
        // Mock callback for timer
      }, 1000);

      store.setReloadTimer(mockTimer);

      expect(store.reloadTimer).toStrictEqual(mockTimer);
    });
  });

  describe("Async Actions", () => {
    it("should get activate menus", async () => {
      const store = appStore();

      await store.getActivateMenus();

      expect(store.allMenus).toEqual([]);
    });

    it("should query OAP time info", async () => {
      const store = appStore();

      await store.queryOAPTimeInfo();

      // Should set default UTC if there are errors
      expect(store.utc).toBeDefined();
    });

    it("should fetch version", async () => {
      const store = appStore();

      await store.fetchVersion();

      expect(store.version).toBeDefined();
    });

    it("should query menu items", async () => {
      const store = appStore();

      const result = await store.queryMenuItems();

      expect(result).toBeDefined();
    });

    it("should query metrics TTL", async () => {
      const store = appStore();

      await store.queryMetricsTTL();

      expect(store.metricsTTL).toBeDefined();
    });

    it("should query records TTL", async () => {
      const store = appStore();

      await store.queryRecordsTTL();

      expect(store.recordsTTL).toBeDefined();
    });
  });
});
