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
import dateFormatStep, { dateFormatTime, dateFormat } from "../dateFormat";

describe("dateFormat utility functions", () => {
  describe("dateFormatStep", () => {
    // Use a fixed timezone to avoid timezone issues in tests
    const testDate = new Date("2023-12-25T15:30:45.123");

    it("should format MONTH step correctly", () => {
      expect(dateFormatStep(testDate, "MONTH")).toBe("2023-12-25");
      expect(dateFormatStep(testDate, "MONTH", true)).toBe("2023-12");
    });

    it("should format DAY step correctly", () => {
      expect(dateFormatStep(testDate, "DAY")).toBe("2023-12-25");
    });

    it("should format HOUR step correctly", () => {
      expect(dateFormatStep(testDate, "HOUR")).toBe("2023-12-25 15");
    });

    it("should format MINUTE step correctly", () => {
      expect(dateFormatStep(testDate, "MINUTE")).toBe("2023-12-25 1530");
    });

    it("should format SECOND step correctly", () => {
      expect(dateFormatStep(testDate, "SECOND")).toBe("2023-12-25 153045");
    });

    it("should handle single digit values correctly", () => {
      const singleDigitDate = new Date("2023-01-05T09:05:03.123");
      expect(dateFormatStep(singleDigitDate, "MONTH")).toBe("2023-01-05");
      expect(dateFormatStep(singleDigitDate, "HOUR")).toBe("2023-01-05 09");
      expect(dateFormatStep(singleDigitDate, "MINUTE")).toBe("2023-01-05 0905");
      expect(dateFormatStep(singleDigitDate, "SECOND")).toBe("2023-01-05 090503");
    });

    it("should return empty string for unknown step", () => {
      expect(dateFormatStep(testDate, "UNKNOWN")).toBe("");
    });
  });

  describe("dateFormatTime", () => {
    const testDate = new Date("2023-12-25T15:30:45.123");

    it("should format MONTH step correctly", () => {
      expect(dateFormatTime(testDate, "MONTH")).toBe("2023-12");
    });

    it("should format DAY step correctly", () => {
      expect(dateFormatTime(testDate, "DAY")).toBe("12-25");
    });

    it("should format HOUR step correctly", () => {
      expect(dateFormatTime(testDate, "HOUR")).toBe("12-25 15");
    });

    it("should format MINUTE step correctly", () => {
      expect(dateFormatTime(testDate, "MINUTE")).toBe("15:30\n12-25");
    });

    it("should handle single digit values correctly", () => {
      const singleDigitDate = new Date("2023-01-05T09:05:03.123");
      expect(dateFormatTime(singleDigitDate, "MONTH")).toBe("2023-01");
      expect(dateFormatTime(singleDigitDate, "DAY")).toBe("01-05");
      expect(dateFormatTime(singleDigitDate, "HOUR")).toBe("01-05 09");
      expect(dateFormatTime(singleDigitDate, "MINUTE")).toBe("09:05\n01-05");
    });

    it("should return empty string for unknown step", () => {
      expect(dateFormatTime(testDate, "UNKNOWN")).toBe("");
    });
  });

  describe("dateFormat", () => {
    it("should format timestamp with default pattern", () => {
      const timestamp = 1703521845123;
      // Use a regex pattern to match the expected format regardless of timezone
      expect(dateFormat(timestamp)).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it("should format timestamp with custom pattern", () => {
      const timestamp = 1703521845123;
      expect(dateFormat(timestamp, "YYYY/MM/DD")).toBe("2023/12/26");
      expect(dateFormat(timestamp, "MM-DD-YYYY")).toBe("12-26-2023");
      // Use a regex pattern for time-based formats that might vary by timezone
      expect(dateFormat(timestamp, "HH:mm")).toMatch(/^\d{2}:\d{2}$/);
    });

    it("should handle different timestamp formats", () => {
      const timestamp1 = Date.now();
      const timestamp2 = new Date("2023-01-01").getTime();

      expect(dateFormat(timestamp1)).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      // Use a regex pattern for time-based formats that might vary by timezone
      expect(dateFormat(timestamp2)).toMatch(/^2023-01-01 \d{2}:\d{2}:\d{2}$/);
    });
  });
});
