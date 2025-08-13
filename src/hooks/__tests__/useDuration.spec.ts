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
import { useDuration } from "../useDuration";
import { useAppStoreWithOut } from "@/store/modules/app";

// Mock the store
vi.mock("@/store/modules/app", () => ({
  useAppStoreWithOut: vi.fn(),
  InitializationDurationRow: {
    start: new Date("2023-01-01 00:00:00"),
    end: new Date("2023-01-02 00:00:00"),
    step: "HOUR",
  },
}));

// Mock the utility functions
vi.mock("@/utils/localtime", () => ({
  default: vi.fn((utc: boolean, date: string) => new Date(date)),
}));

vi.mock("@/utils/dateFormat", () => ({
  default: vi.fn((date: Date, step: string, monthDayDiff?: boolean) => {
    if (step === "HOUR" && monthDayDiff) {
      return "2023-01-01";
    }
    return "2023-01-01 00";
  }),
}));

describe("useDuration hook", () => {
  const mockAppStore = {
    utc: false,
    $state: {},
    $patch: vi.fn(),
    $reset: vi.fn(),
    $subscribe: vi.fn(),
    $dispose: vi.fn(),
    $id: "app",
    $onAction: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppStoreWithOut).mockReturnValue(mockAppStore as any);
  });

  describe("setDurationRow", () => {
    it("should set duration row data", () => {
      const { setDurationRow, getDurationTime } = useDuration();

      const newDuration = {
        start: new Date("2023-02-01 00:00:00"),
        end: new Date("2023-02-02 00:00:00"),
        step: "DAY",
      };

      setDurationRow(newDuration);
      const result = getDurationTime();

      expect(result.step).toBe("DAY");
    });
  });

  describe("getDurationTime", () => {
    it("should return formatted duration time", () => {
      const { getDurationTime } = useDuration();

      const result = getDurationTime();

      expect(result).toEqual({
        start: "2023-01-01",
        end: "2023-01-01",
        step: "HOUR",
      });
    });

    it("should use app store UTC setting", () => {
      const { getDurationTime } = useDuration();

      getDurationTime();

      expect(useAppStoreWithOut).toHaveBeenCalled();
    });
  });

  describe("getMaxRange", () => {
    it("should return date range for negative days", () => {
      const { getMaxRange } = useDuration();

      const result = getMaxRange(-1);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Date);
      expect(result[1]).toBeInstanceOf(Date);
      // For negative days, it returns [30 minutes ago, now]
      expect(result[1].getTime() - result[0].getTime()).toBe(1800000); // 30 minutes in milliseconds
    });

    it("should return date range for positive days", () => {
      const { getMaxRange } = useDuration();

      const result = getMaxRange(1);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Date);
      expect(result[1]).toBeInstanceOf(Date);
      expect(result[1].getTime()).toBeGreaterThan(result[0].getTime());
    });

    it("should calculate correct time gap", () => {
      const { getMaxRange } = useDuration();

      const result = getMaxRange(2);

      // Should be approximately 3 days (2 + 1) * 24 * 60 * 60 * 1000 milliseconds
      const expectedGap = 3 * 24 * 60 * 60 * 1000;
      const actualGap = result[1].getTime() - result[0].getTime();

      // Allow for small timing differences
      expect(Math.abs(actualGap - expectedGap)).toBeLessThan(1000);
    });

    it("should return current time as end date", () => {
      const { getMaxRange } = useDuration();

      const before = new Date();
      const result = getMaxRange(1);
      const after = new Date();

      expect(result[1].getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result[1].getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("integration", () => {
    it("should work with different duration configurations", () => {
      const { setDurationRow, getDurationTime, getMaxRange } = useDuration();

      // Set custom duration
      const customDuration = {
        start: new Date("2023-03-01 12:00:00"),
        end: new Date("2023-03-02 12:00:00"),
        step: "MINUTE",
      };

      setDurationRow(customDuration);

      // Test getDurationTime
      const durationTime = getDurationTime();
      expect(durationTime.step).toBe("MINUTE");

      // Test getMaxRange
      const maxRange = getMaxRange(5);
      expect(maxRange).toHaveLength(2);
      expect(maxRange[0]).toBeInstanceOf(Date);
      expect(maxRange[1]).toBeInstanceOf(Date);
    });
  });
});
