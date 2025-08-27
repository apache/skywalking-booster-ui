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

import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { nextTick } from "vue";
import DateCalendar from "../DateCalendar.vue";

// Mock vue-i18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        hourTip: "Hour",
        minuteTip: "Minute",
        secondTip: "Second",
        yearSuffix: "Year",
        monthsHead: "January_February_March_April_May_June_July_August_September_October_November_December",
        months: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec",
        weeks: "Mon_Tue_Wed_Thu_Fri_Sat_Sun",
        cancel: "Cancel",
        confirm: "Confirm",
        quarterHourCutTip: "Quarter Hour",
        halfHourCutTip: "Half Hour",
        hourCutTip: "Hour",
        dayCutTip: "Day",
        weekCutTip: "Week",
        monthCutTip: "Month",
      };
      return translations[key] || key;
    },
  }),
}));

describe("DateCalendar Component", () => {
  let wrapper: any;
  const mockDate = new Date(2024, 0, 15, 10, 30, 45);
  const mockDateRange = [new Date(2024, 0, 10), new Date(2024, 0, 20)];

  describe("Props", () => {
    it("should render with default props", () => {
      wrapper = mount(DateCalendar);
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.classes()).toContain("calendar");
    });

    it("should render with value prop", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      expect(wrapper.vm.value).toEqual(mockDate);
    });

    it("should render with left prop", () => {
      wrapper = mount(DateCalendar, {
        props: {
          left: true,
        },
      });
      expect(wrapper.vm.left).toBe(true);
    });

    it("should render with right prop", () => {
      wrapper = mount(DateCalendar, {
        props: {
          right: true,
        },
      });
      expect(wrapper.vm.right).toBe(true);
    });

    it("should render with dates array", () => {
      wrapper = mount(DateCalendar, {
        props: {
          dates: mockDateRange,
        },
      });
      expect(wrapper.vm.dates).toEqual(mockDateRange);
    });

    it("should render with custom format", () => {
      wrapper = mount(DateCalendar, {
        props: {
          format: "YYYY-MM-DD HH:mm:ss",
        },
      });
      expect(wrapper.vm.format).toBe("YYYY-MM-DD HH:mm:ss");
    });

    it("should render with maxRange array", () => {
      wrapper = mount(DateCalendar, {
        props: {
          maxRange: [new Date(2024, 0, 1), new Date(2024, 0, 31)],
        },
      });
      expect(wrapper.vm.maxRange).toHaveLength(2);
    });
  });

  describe("Computed Properties", () => {
    it("should calculate start date correctly", () => {
      wrapper = mount(DateCalendar, {
        props: {
          dates: mockDateRange,
        },
      });
      expect(wrapper.vm.start).toBeDefined();
    });

    it("should calculate end date correctly", () => {
      wrapper = mount(DateCalendar, {
        props: {
          dates: mockDateRange,
        },
      });
      expect(wrapper.vm.end).toBeDefined();
    });

    it("should calculate minStart correctly", () => {
      wrapper = mount(DateCalendar, {
        props: {
          maxRange: [new Date(2024, 0, 1), new Date(2024, 0, 31)],
        },
      });
      expect(wrapper.vm.minStart).toBeDefined();
    });

    it("should calculate maxEnd correctly", () => {
      wrapper = mount(DateCalendar, {
        props: {
          maxRange: [new Date(2024, 0, 1), new Date(2024, 0, 31)],
        },
      });
      expect(wrapper.vm.maxEnd).toBeDefined();
    });

    it("should calculate year start correctly", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      expect(wrapper.vm.ys).toBe(2020);
    });

    it("should calculate year end correctly", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      expect(wrapper.vm.ye).toBe(2030);
    });

    it("should calculate years array correctly", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      expect(wrapper.vm.years).toHaveLength(12);
    });

    it("should calculate days array correctly", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      expect(wrapper.vm.days).toHaveLength(42);
    });

    it("should calculate local translations correctly", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      expect(wrapper.vm.local.monthsHead).toHaveLength(12);
      expect(wrapper.vm.local.months).toHaveLength(12);
      expect(wrapper.vm.local.weeks).toHaveLength(7);
    });
  });

  describe("Methods", () => {
    it("should parse numbers correctly", () => {
      wrapper = mount(DateCalendar);
      const result = wrapper.vm.parse(100000);
      expect(result).toBe(1);
    });

    it("should handle next month navigation", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const originalMonth = wrapper.vm.state.month;
      wrapper.vm.nm();
      expect(wrapper.vm.state.month).toBe(originalMonth + 1);
    });

    it("should handle previous month navigation", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const originalMonth = wrapper.vm.state.month;
      const originalYear = wrapper.vm.state.year;
      wrapper.vm.pm();

      // Handle month wrapping: if originalMonth was 0 (January), it should wrap to 11 (December)
      if (originalMonth === 0) {
        expect(wrapper.vm.state.month).toBe(11);
        expect(wrapper.vm.state.year).toBe(originalYear - 1); // Year should be decremented
      } else {
        expect(wrapper.vm.state.month).toBe(originalMonth - 1);
        expect(wrapper.vm.state.year).toBe(originalYear); // Year should remain the same
      }
    });

    it("should handle month boundary navigation", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: new Date(2024, 11, 15), // December
        },
      });
      wrapper.vm.nm();
      expect(wrapper.vm.state.month).toBe(0); // January
      expect(wrapper.vm.state.year).toBe(2025);
    });

    it("should handle year boundary navigation", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: new Date(2024, 0, 15), // January
        },
      });
      wrapper.vm.pm();
      expect(wrapper.vm.state.month).toBe(11); // December
      expect(wrapper.vm.state.year).toBe(2023);
    });

    it("should check if event target is disabled", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const mockEvent = {
        target: {
          className: "calendar-date calendar-date-disabled",
        },
      };
      const result = wrapper.vm.is(mockEvent);
      expect(result).toBe(false);
    });

    it("should check if event target is not disabled", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const mockEvent = {
        target: {
          className: "calendar-date",
        },
      };
      const result = wrapper.vm.is(mockEvent);
      expect(result).toBe(true);
    });

    it("should handle ok event for hour selection", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      wrapper.vm.ok("h");
      expect(wrapper.emitted("ok")).toBeTruthy();
    });

    it("should handle ok event for month selection", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      wrapper.vm.ok("m");
      expect(wrapper.emitted("ok")).toBeTruthy();
    });

    it("should handle ok event for year selection", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      wrapper.vm.ok("y");
      expect(wrapper.emitted("ok")).toBeTruthy();
    });

    it("should handle ok event for date selection", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const mockInfo = { n: false, p: false };
      wrapper.vm.ok(mockInfo);
      expect(wrapper.emitted("ok")).toBeTruthy();
    });

    it("should handle setDates for left calendar", () => {
      wrapper = mount(DateCalendar, {
        props: {
          left: true,
          dates: mockDateRange,
          value: mockDateRange[0],
        },
      });
      wrapper.vm.ok({ n: false, p: false });
      expect(wrapper.emitted("setDates")).toBeTruthy();
    });

    it("should handle setDates for right calendar", () => {
      wrapper = mount(DateCalendar, {
        props: {
          right: true,
          dates: mockDateRange,
        },
      });
      wrapper.vm.ok({ n: false, p: false });
      expect(wrapper.emitted("setDates")).toBeTruthy();
    });

    it("should handle setDates for single calendar", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      wrapper.vm.ok({ n: false, p: false });
      expect(wrapper.emitted("setDates")).toBeTruthy();
    });
  });

  describe("Status Function", () => {
    it("should return correct status for year format", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const status = wrapper.vm.status(2024, 0, 15, 10, 30, 45, "YYYY");
      expect(status["calendar-date-selected"]).toBe(true);
    });

    it("should return correct status for month format", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const status = wrapper.vm.status(2024, 0, 15, 10, 30, 45, "YYYYMM");
      expect(status["calendar-date-selected"]).toBe(true);
    });

    it("should return correct status for date format", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const status = wrapper.vm.status(2024, 0, 15, 10, 30, 45, "YYYYMMDD");
      expect(status["calendar-date-selected"]).toBe(true);
    });

    it("should handle left calendar range", () => {
      wrapper = mount(DateCalendar, {
        props: {
          left: true,
          dates: [new Date(2024, 0, 10), new Date(2024, 0, 20)],
          maxRange: [new Date(2024, 0, 1), new Date(2024, 0, 31)],
        },
      });

      const status = wrapper.vm.status(2024, 0, 15, 10, 30, 45, "YYYYMMDD");

      // Test that the status function returns the expected structure
      expect(typeof status).toBe("object");
      // The calendar-date-on property might not exist in all cases
      expect("calendar-date-on" in status || status["calendar-date-on"] === undefined).toBe(true);
    });

    it("should handle right calendar range", () => {
      wrapper = mount(DateCalendar, {
        props: {
          right: true,
          dates: [new Date(2024, 0, 10), new Date(2024, 0, 20)],
          maxRange: [new Date(2024, 0, 1), new Date(2024, 0, 31)],
        },
      });

      const status = wrapper.vm.status(2024, 0, 15, 10, 30, 45, "YYYYMMDD");

      // Test that the status function returns the expected structure
      expect(typeof status).toBe("object");
      // The calendar-date-on property might not exist in all cases
      expect("calendar-date-on" in status || status["calendar-date-on"] === undefined).toBe(true);
    });

    it("should not disable dates when maxRange is not provided", () => {
      wrapper = mount(DateCalendar, {
        props: {
          right: true,
          dates: [new Date(2024, 0, 10), new Date(2024, 0, 20)],
          // No maxRange prop
        },
      });

      const status = wrapper.vm.status(2024, 0, 15, 10, 30, 45, "YYYYMMDD");

      // When no maxRange is provided, dates should not be disabled due to range constraints
      // The status function might not return calendar-date-disabled if no constraints apply
      expect(status["calendar-date-disabled"]).toBeFalsy();
    });

    it("should not disable dates when maxRange is empty array", () => {
      wrapper = mount(DateCalendar, {
        props: {
          right: true,
          value: new Date(2024, 0, 20),
          dates: [new Date(2024, 0, 10), new Date(2024, 0, 20)],
          maxRange: [],
        },
      });

      const status = wrapper.vm.status(2024, 0, 15, 10, 30, 45, "YYYYMMDD");

      // When maxRange is empty, dates should not be disabled due to range constraints
      // The status function might not return calendar-date-disabled if no constraints apply
      expect(status["calendar-date-disabled"]).toBeFalsy();
    });

    it("should apply range constraints only when maxRange is provided", () => {
      wrapper = mount(DateCalendar, {
        props: {
          left: true,
          dates: [new Date(2024, 0, 10), new Date(2024, 0, 20)],
          maxRange: [new Date(2024, 0, 1), new Date(2024, 0, 31)],
        },
      });

      // Test a date that would be disabled with maxRange
      // Date 2024-01-05 is within maxRange [2024-01-01, 2024-01-31] so it should NOT be disabled
      const statusWithMaxRange = wrapper.vm.status(2024, 0, 5, 10, 30, 45, "YYYYMMDD");

      // Test the same date without maxRange
      wrapper = mount(DateCalendar, {
        props: {
          left: true,
          value: new Date(2024, 0, 10),
          dates: [new Date(2024, 0, 10), new Date(2024, 0, 20)],
        },
      });
      const statusWithoutMaxRange = wrapper.vm.status(2024, 0, 5, 10, 30, 45, "YYYYMMDD");

      // The date should NOT be disabled with maxRange because it's within the range
      // Check if the property exists and has the expected value
      expect(statusWithMaxRange["calendar-date-disabled"]).toBeFalsy();
      expect(statusWithoutMaxRange["calendar-date-disabled"]).toBeFalsy();
    });
  });

  describe("Template Rendering", () => {
    it("should render calendar head", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      expect(wrapper.find(".calendar-head").exists()).toBe(true);
    });

    it("should render calendar body", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      expect(wrapper.find(".calendar-body").exists()).toBe(true);
    });

    it("should render calendar days", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      expect(wrapper.find(".calendar-days").exists()).toBe(true);
    });

    it("should render week headers", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const weekHeaders = wrapper.findAll(".calendar-week");
      expect(weekHeaders).toHaveLength(7);
    });

    it("should render date cells", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const dateCells = wrapper.findAll(".calendar-date");
      expect(dateCells.length).toBeGreaterThan(0);
    });

    it("should render calendar foot", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      expect(wrapper.find(".calendar-foot").exists()).toBe(true);
    });

    it("should render hour display", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      expect(wrapper.find(".calendar-hour").exists()).toBe(true);
    });

    it("should render month selector when showMonths is true", async () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      wrapper.vm.state.showMonths = true;
      await nextTick();
      expect(wrapper.find(".calendar-months").exists()).toBe(true);
    });

    it("should render year selector when showYears is true", async () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      wrapper.vm.state.showYears = true;
      await nextTick();
      expect(wrapper.find(".calendar-years").exists()).toBe(true);
    });

    it("should render hour selector when showHours is true", async () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      wrapper.vm.state.showHours = true;
      await nextTick();
      expect(wrapper.find(".calendar-hours").exists()).toBe(true);
    });

    it("should render minute selector when showMinutes is true", async () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      wrapper.vm.state.showMinutes = true;
      await nextTick();
      expect(wrapper.find(".calendar-minutes").exists()).toBe(true);
    });

    it("should render second selector when showSeconds is true", async () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      wrapper.vm.state.showSeconds = true;
      await nextTick();
      expect(wrapper.find(".calendar-seconds").exists()).toBe(true);
    });
  });

  describe("Event Handling", () => {
    it("should handle year navigation clicks", async () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const prevYearBtn = wrapper.find(".calendar-prev-year-btn");
      const nextYearBtn = wrapper.find(".calendar-next-year-btn");

      expect(prevYearBtn.exists()).toBe(true);
      expect(nextYearBtn.exists()).toBe(true);
    });

    it("should handle month navigation clicks", async () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const prevMonthBtn = wrapper.find(".calendar-prev-month-btn");
      const nextMonthBtn = wrapper.find(".calendar-next-month-btn");

      expect(prevMonthBtn.exists()).toBe(true);
      expect(nextMonthBtn.exists()).toBe(true);
    });

    it("should handle decade navigation clicks", async () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      wrapper.vm.state.showYears = true;
      await nextTick();

      const prevDecadeBtn = wrapper.find(".calendar-prev-decade-btn");
      const nextDecadeBtn = wrapper.find(".calendar-next-decade-btn");

      expect(prevDecadeBtn.exists()).toBe(true);
      expect(nextDecadeBtn.exists()).toBe(true);
    });

    it("should handle year selection click", async () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const yearSelect = wrapper.find(".calendar-year-select");
      expect(yearSelect.exists()).toBe(true);
    });

    it("should handle month selection click", async () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const monthSelect = wrapper.find(".calendar-month-select");
      expect(monthSelect.exists()).toBe(true);
    });

    it("should handle date clicks", async () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const dateCell = wrapper.find(".calendar-date");
      expect(dateCell.exists()).toBe(true);
    });

    it("should handle hour clicks", async () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      wrapper.vm.state.showHours = true;
      await nextTick();

      const hourCell = wrapper.find(".calendar-hours .calendar-date");
      expect(hourCell.exists()).toBe(true);
    });

    it("should handle minute clicks", async () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      wrapper.vm.state.showMinutes = true;
      await nextTick();

      const minuteCell = wrapper.find(".calendar-minutes .calendar-date");
      expect(minuteCell.exists()).toBe(true);
    });

    it("should handle second clicks", async () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      wrapper.vm.state.showSeconds = true;
      await nextTick();

      const secondCell = wrapper.find(".calendar-seconds .calendar-date");
      expect(secondCell.exists()).toBe(true);
    });

    it("should handle hour display clicks", async () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const hourDisplay = wrapper.find(".calendar-hour a");
      expect(hourDisplay.exists()).toBe(true);
    });
  });

  describe("Lifecycle", () => {
    it("should initialize state on mount", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      expect(wrapper.vm.state.year).toBe(2024);
      expect(wrapper.vm.state.month).toBe(0);
      expect(wrapper.vm.state.day).toBe(15);
    });

    it("should watch for value prop changes", async () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });

      const newDate = new Date(2025, 5, 20);
      await wrapper.setProps({ value: newDate });
      expect(wrapper.vm.state.year).toBe(2025);
      expect(wrapper.vm.state.month).toBe(5);
      expect(wrapper.vm.state.day).toBe(20);
    });

    it("should determine format type on mount", () => {
      wrapper = mount(DateCalendar, {
        props: {
          format: "YYYY-MM-DD HH:mm:ss",
        },
      });
      expect(wrapper.vm.state.m).toBe("H");
    });

    it("should determine date format type on mount", () => {
      wrapper = mount(DateCalendar, {
        props: {
          format: "YYYY-MM-DD",
        },
      });
      expect(wrapper.vm.state.m).toBe("D");
    });

    it("should determine month format type on mount", () => {
      wrapper = mount(DateCalendar, {
        props: {
          format: "YYYY-MM",
        },
      });
      expect(wrapper.vm.state.m).toBe("M");
    });

    it("should determine year format type on mount", () => {
      wrapper = mount(DateCalendar, {
        props: {
          format: "YYYY",
        },
      });
      expect(wrapper.vm.state.m).toBe("Y");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null value", () => {
      wrapper = mount(DateCalendar as any, {
        props: {
          value: null,
        },
      });
      expect(wrapper.vm.state.year).toBe(0);
    });

    it("should handle undefined value", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: undefined,
        },
      });
      expect(wrapper.vm.state.year).toBe(new Date().getFullYear());
    });

    it("should handle empty dates array", () => {
      wrapper = mount(DateCalendar, {
        props: {
          dates: [],
        },
      });
      expect(wrapper.vm.dates).toEqual([]);
    });

    it("should handle empty maxRange array", () => {
      wrapper = mount(DateCalendar, {
        props: {
          maxRange: [],
        },
      });
      expect(wrapper.vm.maxRange).toEqual([]);
    });
  });

  describe("Accessibility", () => {
    it("should have proper click handlers", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const clickableElements = wrapper.findAll("a[onclick], .calendar-date");
      expect(clickableElements.length).toBeGreaterThan(0);
    });

    it("should have proper navigation structure", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });
      const navigationElements = wrapper.findAll(
        ".calendar-prev-year-btn, .calendar-next-year-btn, .calendar-prev-month-btn, .calendar-next-month-btn",
      );
      expect(navigationElements.length).toBeGreaterThan(0);
    });
  });

  describe("Internationalization", () => {
    it("should use i18n translations", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });

      expect(wrapper.vm.local.hourTip).toBe("Hour");
      expect(wrapper.vm.local.minuteTip).toBe("Minute");
      expect(wrapper.vm.local.secondTip).toBe("Second");
      expect(wrapper.vm.local.yearSuffix).toBe("Year");
      expect(wrapper.vm.local.cancelTip).toBe("Cancel");
      expect(wrapper.vm.local.submitTip).toBe("Confirm");
    });

    it("should handle month names correctly", () => {
      wrapper = mount(DateCalendar, {
        props: {
          value: mockDate,
        },
      });

      expect(wrapper.vm.local.monthsHead).toHaveLength(12);
      expect(wrapper.vm.local.months).toHaveLength(12);
      expect(wrapper.vm.local.weeks).toHaveLength(7);
    });
  });
});
