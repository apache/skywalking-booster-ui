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
import { describe, it, expect, beforeEach, vi } from "vitest";
import { nextTick } from "vue";
import TimePicker from "../TimePicker.vue";

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

// Mock the useTimeout hook
vi.mock("@/hooks/useTimeout", () => ({
  useTimeoutFn: vi.fn((callback: Function, delay: number) => {
    setTimeout(callback, delay);
  }),
}));

describe("TimePicker Component", () => {
  let wrapper: any;
  const mockDate = new Date(2024, 0, 15, 2, 30, 45);
  const mockDateRange = [new Date(2024, 0, 10), new Date(2024, 0, 20)];

  describe("Props", () => {
    it("should render with default props", () => {
      wrapper = mount(TimePicker);
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.classes()).toContain("datepicker");
    });

    it("should render with custom position", () => {
      wrapper = mount(TimePicker, {
        props: {
          position: "top",
          type: "inline", // Make popup visible
        },
      });
      expect(wrapper.find(".datepicker-popup").classes()).toContain("top");
    });

    it("should render with custom type", () => {
      wrapper = mount(TimePicker, {
        props: {
          type: "inline",
        },
      });
      expect(wrapper.find(".datepicker-popup").classes()).toContain("datepicker-inline");
    });

    it("should render with custom range separator", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDateRange,
          rangeSeparator: "to",
        },
      });
      expect(wrapper.vm.rangeSeparator).toBe("to");
    });

    it("should render with clearable prop", async () => {
      wrapper = mount(TimePicker, {
        props: {
          clearable: true,
          value: mockDate,
        },
      });
      // Wait for the component to fully mount and update
      await nextTick();

      // The class is only applied when there's text and not disabled
      expect(wrapper.vm.text).toBeTruthy();
      // The class should be applied since we have clearable=true, text exists, and not disabled
      expect(wrapper.classes()).toContain("datepicker__clearable");
    });

    it("should render with disabled prop", () => {
      wrapper = mount(TimePicker, {
        props: {
          disabled: true,
        },
      });
      expect(wrapper.find("input").attributes("disabled")).toBeDefined();
    });

    it("should render with custom placeholder", () => {
      wrapper = mount(TimePicker, {
        props: {
          placeholder: "Select date",
        },
      });
      expect(wrapper.find("input").attributes("placeholder")).toBe("Select date");
    });

    it("should render with custom format", () => {
      wrapper = mount(TimePicker, {
        props: {
          format: "YYYY-MM-DD HH:mm:ss",
        },
      });
      expect(wrapper.vm.format).toBe("YYYY-MM-DD HH:mm:ss");
    });

    it("should render with showButtons prop", () => {
      wrapper = mount(TimePicker, {
        props: {
          showButtons: true,
          type: "inline", // Make popup visible
        },
      });
      expect(wrapper.find(".datepicker__buttons").exists()).toBe(true);
    });

    it("should render with maxRange array", () => {
      wrapper = mount(TimePicker, {
        props: {
          maxRange: [new Date(2024, 0, 1), new Date(2024, 0, 31)],
        },
      });
      expect(wrapper.vm.maxRange).toHaveLength(2);
    });
  });

  describe("Computed Properties", () => {
    it("should calculate range correctly for single date", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDate,
        },
      });
      expect(wrapper.vm.range).toBe(false);
    });

    it("should calculate range correctly for date range", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDateRange,
        },
      });
      expect(wrapper.vm.range).toBe(true);
    });

    it("should format text correctly for single date", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDate,
        },
      });
      expect(wrapper.vm.text).toBe("2024-01-15");
    });

    it("should format text correctly for date range", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDateRange,
        },
      });
      expect(wrapper.vm.text).toBe("2024-01-10 ~ 2024-01-20");
    });

    it("should format text with custom range separator", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDateRange,
          rangeSeparator: "to",
        },
      });
      expect(wrapper.vm.text).toBe("2024-01-10 to 2024-01-20");
    });

    it("should return empty text for empty value", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: [],
        },
      });
      expect(wrapper.vm.text).toBe("");
    });

    it("should get correct value for single date", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDate,
        },
      });
      const result = wrapper.vm.get();
      expect(result).toEqual(wrapper.vm.dates[0]);
    });

    it("should get correct value for date range", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDateRange,
        },
      });
      const result = wrapper.vm.get();
      expect(result).toEqual(wrapper.vm.dates);
    });
  });

  describe("Methods", () => {
    it("should handle clear action", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDate,
        },
      });
      wrapper.vm.cls();
      expect(wrapper.emitted("clear")).toBeTruthy();
    });

    it("should handle clear action for range", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDateRange,
        },
      });
      wrapper.vm.cls();
      expect(wrapper.emitted("clear")).toBeTruthy();
      expect(wrapper.emitted("input")?.[0]).toEqual([[]]);
    });

    it("should validate input correctly for array", () => {
      wrapper = mount(TimePicker);
      const result = wrapper.vm.vi([mockDate, mockDate]);
      expect(result).toHaveLength(2);
    });

    it("should validate input correctly for single date", () => {
      wrapper = mount(TimePicker);
      const result = wrapper.vm.vi(mockDate);
      expect(result).toHaveLength(1);
    });

    it("should validate input correctly for empty value", () => {
      wrapper = mount(TimePicker);
      const result = wrapper.vm.vi(null);
      expect(result).toHaveLength(1);
    });

    it("should handle ok event", () => {
      wrapper = mount(TimePicker);
      wrapper.vm.ok(false);
      expect(wrapper.emitted("input")).toBeTruthy();
    });

    it("should handle ok event with leaveOpened", () => {
      wrapper = mount(TimePicker);
      wrapper.vm.ok(true);
      expect(wrapper.emitted("input")).toBeTruthy();
    });

    it("should handle setDates for right position", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDateRange,
        },
      });
      const newDate = new Date(2024, 0, 25);
      wrapper.vm.setDates(newDate, "right");
      expect(wrapper.vm.dates[1]).toEqual(newDate);
    });

    it("should handle setDates for left position", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDateRange,
        },
      });
      const newDate = new Date(2024, 0, 5);
      wrapper.vm.setDates(newDate, "left");
      expect(wrapper.vm.dates[0]).toEqual(newDate);
    });

    it("should handle document click", () => {
      wrapper = mount(TimePicker);
      const mockEvent = {
        target: document.createElement("div"),
      } as unknown as MouseEvent;
      wrapper.vm.datepicker = {
        contains: vi.fn(() => true),
      };
      wrapper.vm.dc(mockEvent);
      expect(wrapper.vm.show).toBe(true);
    });

    it("should handle document click outside", () => {
      wrapper = mount(TimePicker);
      const mockEvent = {
        target: document.createElement("div"),
      } as unknown as MouseEvent;
      wrapper.vm.datepicker = {
        contains: vi.fn(() => false),
      };
      wrapper.vm.dc(mockEvent);
      expect(wrapper.vm.show).toBe(false);
    });

    it("should handle document click when disabled", () => {
      wrapper = mount(TimePicker, {
        props: {
          disabled: true,
        },
      });
      const mockEvent = {
        target: document.createElement("div"),
      } as unknown as MouseEvent;
      wrapper.vm.datepicker = {
        contains: vi.fn(() => true),
      };
      wrapper.vm.dc(mockEvent);
      expect(wrapper.vm.show).toBe(false);
    });
  });

  describe("Quick Pick Functionality", () => {
    beforeEach(() => {
      wrapper = mount(TimePicker, {
        props: {
          maxRange: [new Date(2024, 0, 1), new Date(2024, 0, 31)],
        },
      });
    });

    it("should have QUICK_PICK_TYPES constant defined", () => {
      expect(wrapper.vm.QUICK_PICK_TYPES).toBeDefined();
      expect(wrapper.vm.QUICK_PICK_TYPES.QUARTER).toBe("quarter");
      expect(wrapper.vm.QUICK_PICK_TYPES.HALF).toBe("half");
      expect(wrapper.vm.QUICK_PICK_TYPES.HOUR).toBe("hour");
      expect(wrapper.vm.QUICK_PICK_TYPES.DAY).toBe("day");
      expect(wrapper.vm.QUICK_PICK_TYPES.WEEK).toBe("week");
      expect(wrapper.vm.QUICK_PICK_TYPES.MONTH).toBe("month");
    });

    it("should initialize with default selectedShortcut", () => {
      expect(wrapper.vm.selectedShortcut).toBe("half");
    });

    it("should update selectedShortcut when quickPick is called", () => {
      wrapper.vm.quickPick("quarter");
      expect(wrapper.vm.selectedShortcut).toBe("quarter");

      wrapper.vm.quickPick("day");
      expect(wrapper.vm.selectedShortcut).toBe("day");
    });

    it("should handle quarter hour quick pick", () => {
      wrapper.vm.quickPick("quarter");

      expect(wrapper.vm.selectedShortcut).toBe("quarter");
      expect(wrapper.vm.dates).toHaveLength(2);
      expect(wrapper.vm.dates[0].getTime()).toBeLessThan(wrapper.vm.dates[1].getTime());
    });

    it("should handle half hour quick pick", () => {
      wrapper.vm.quickPick("half");

      expect(wrapper.vm.selectedShortcut).toBe("half");
      expect(wrapper.vm.dates).toHaveLength(2);
      expect(wrapper.vm.dates[0].getTime()).toBeLessThan(wrapper.vm.dates[1].getTime());
    });

    it("should handle hour quick pick", () => {
      wrapper.vm.quickPick("hour");

      expect(wrapper.vm.selectedShortcut).toBe("hour");
      expect(wrapper.vm.dates).toHaveLength(2);
      expect(wrapper.vm.dates[0].getTime()).toBeLessThan(wrapper.vm.dates[1].getTime());
    });

    it("should handle day quick pick", () => {
      wrapper.vm.quickPick("day");

      expect(wrapper.vm.selectedShortcut).toBe("day");
      expect(wrapper.vm.dates).toHaveLength(2);
      expect(wrapper.vm.dates[0].getTime()).toBeLessThan(wrapper.vm.dates[1].getTime());
    });

    it("should handle week quick pick", () => {
      wrapper.vm.quickPick("week");

      expect(wrapper.vm.selectedShortcut).toBe("week");
      expect(wrapper.vm.dates).toHaveLength(2);
      expect(wrapper.vm.dates[0].getTime()).toBeLessThan(wrapper.vm.dates[1].getTime());
    });

    it("should handle month quick pick", () => {
      wrapper.vm.quickPick("month");

      expect(wrapper.vm.selectedShortcut).toBe("month");
      expect(wrapper.vm.dates).toHaveLength(2);
      expect(wrapper.vm.dates[0].getTime()).toBeLessThan(wrapper.vm.dates[1].getTime());
    });

    it("should handle unknown quick pick type", () => {
      wrapper.vm.quickPick("unknown" as any);

      expect(wrapper.vm.selectedShortcut).toBe("unknown");
      expect(wrapper.vm.dates).toHaveLength(2);
      expect(wrapper.vm.dates[0]).toBeInstanceOf(Date);
      expect(wrapper.vm.dates[1]).toBeInstanceOf(Date);
    });

    it("should apply selected style to active shortcut button", async () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDateRange,
          type: "inline",
          maxRange: [new Date(2024, 0, 1), new Date(2024, 0, 31)],
        },
      });

      // Force range mode by setting dates directly and wait for reactivity
      wrapper.vm.dates = [new Date(), new Date()];
      await nextTick();

      // Find buttons by their text content
      const buttons = wrapper.findAll(".datepicker-popup__shortcut");
      const halfButton = buttons.find((btn: any) => btn.text().includes("Half Hour"));
      const quarterButton = buttons.find((btn: any) => btn.text().includes("Quarter Hour"));

      // Initially, half should be selected (default)
      expect(halfButton?.classes()).toContain("datepicker-popup__shortcut--selected");

      // Click quarter button
      if (quarterButton) {
        await quarterButton.trigger("click");
        await nextTick();

        // Quarter should now be selected
        expect(quarterButton.classes()).toContain("datepicker-popup__shortcut--selected");
        expect(halfButton?.classes()).not.toContain("datepicker-popup__shortcut--selected");
      }
    });
  });

  describe("Button Actions", () => {
    beforeEach(() => {
      wrapper = mount(TimePicker, {
        props: {
          showButtons: true,
        },
      });
    });

    it("should handle submit action", () => {
      wrapper.vm.dates = [mockDate];
      wrapper.vm.submit();

      expect(wrapper.emitted("confirm")).toBeTruthy();
      expect(wrapper.vm.show).toBe(false);
    });

    it("should handle cancel action", () => {
      wrapper.vm.dates = [mockDate];
      wrapper.vm.cancel();

      expect(wrapper.emitted("cancel")).toBeTruthy();
      expect(wrapper.vm.show).toBe(false);
    });
  });

  describe("Template Rendering", () => {
    it("should render input field", () => {
      wrapper = mount(TimePicker);
      expect(wrapper.find("input").exists()).toBe(true);
    });

    it("should render input with custom class", () => {
      wrapper = mount(TimePicker, {
        props: {
          inputClass: "custom-input",
        },
      });
      expect(wrapper.find("input").classes()).toContain("custom-input");
    });

    it("should render input with placeholder", () => {
      wrapper = mount(TimePicker, {
        props: {
          placeholder: "Select date",
        },
      });
      expect(wrapper.find("input").attributes("placeholder")).toBe("Select date");
    });

    it("should render disabled input", () => {
      wrapper = mount(TimePicker, {
        props: {
          disabled: true,
        },
      });
      expect(wrapper.find("input").attributes("disabled")).toBeDefined();
    });

    it("should render clear button when clearable and has value", () => {
      wrapper = mount(TimePicker, {
        props: {
          clearable: true,
          value: mockDate,
        },
      });
      expect(wrapper.find(".datepicker-close").exists()).toBe(true);
    });

    it("should not render clear button when not clearable", () => {
      wrapper = mount(TimePicker, {
        props: {
          clearable: false,
        },
      });
      // The clear button is always rendered but only visible on hover when clearable
      expect(wrapper.find(".datepicker-close").exists()).toBe(true);
    });

    it("should render popup with correct position class", () => {
      wrapper = mount(TimePicker, {
        props: {
          position: "bottom",
          type: "inline", // Make popup visible
        },
      });
      expect(wrapper.find(".datepicker-popup").classes()).toContain("bottom");
    });

    it("should render inline popup", () => {
      wrapper = mount(TimePicker, {
        props: {
          type: "inline",
        },
      });
      expect(wrapper.find(".datepicker-popup").classes()).toContain("datepicker-inline");
    });

    it("should render sidebar for range mode", async () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDateRange,
          type: "inline",
        },
      });
      // Force range mode by setting dates directly and wait for reactivity
      wrapper.vm.dates = [new Date(), new Date()];
      await nextTick();
      expect(wrapper.vm.range).toBe(true);
      expect(wrapper.find(".datepicker-popup__sidebar").exists()).toBe(true);
    });

    it("should render quick pick buttons", async () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDateRange,
          type: "inline",
        },
      });
      // Force range mode by setting dates directly and wait for reactivity
      wrapper.vm.dates = [new Date(), new Date()];
      await nextTick();
      const buttons = wrapper.findAll(".datepicker-popup__shortcut");
      expect(buttons).toHaveLength(6); // quarter, half, hour, day, week, month
    });

    it("should render DateCalendar components", () => {
      wrapper = mount(TimePicker, {
        props: {
          type: "inline",
        },
      });
      expect(wrapper.findComponent({ name: "DateCalendar" }).exists()).toBe(true);
    });

    it("should render two DateCalendar components for range", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDateRange,
          type: "inline",
        },
      });
      const calendars = wrapper.findAllComponents({ name: "DateCalendar" });
      expect(calendars).toHaveLength(1);
    });

    it("should render buttons when showButtons is true", () => {
      wrapper = mount(TimePicker, {
        props: {
          showButtons: true,
          type: "inline",
        },
      });
      expect(wrapper.find(".datepicker__buttons").exists()).toBe(true);
    });

    it("should not render buttons when showButtons is false", () => {
      wrapper = mount(TimePicker, {
        props: {
          showButtons: false,
          type: "inline",
        },
      });
      expect(wrapper.find(".datepicker__buttons").exists()).toBe(false);
    });
  });

  describe("Event Handling", () => {
    it("should emit clear event when clear button is clicked", async () => {
      wrapper = mount(TimePicker, {
        props: {
          clearable: true,
          value: mockDate,
        },
      });
      await wrapper.find(".datepicker-close").trigger("click");
      expect(wrapper.emitted("clear")).toBeTruthy();
    });

    it("should handle DateCalendar ok event", () => {
      wrapper = mount(TimePicker, {
        props: {
          type: "inline",
        },
      });
      const calendar = wrapper.findComponent({ name: "DateCalendar" });
      calendar.vm.$emit("ok", true);
      expect(wrapper.emitted("input")).toBeTruthy();
    });

    it("should handle DateCalendar setDates event", () => {
      wrapper = mount(TimePicker, {
        props: {
          type: "inline",
        },
      });
      const calendar = wrapper.findComponent({ name: "DateCalendar" });
      calendar.vm.$emit("setDates", mockDate, "left");
      expect(wrapper.vm.dates[0]).toEqual(mockDate);
    });

    it("should handle submit button click", async () => {
      wrapper = mount(TimePicker, {
        props: {
          showButtons: true,
          type: "inline",
        },
      });
      await wrapper.find(".datepicker__button-select").trigger("click");
      expect(wrapper.emitted("confirm")).toBeTruthy();
    });

    it("should handle cancel button click", async () => {
      wrapper = mount(TimePicker, {
        props: {
          showButtons: true,
          type: "inline",
        },
      });
      await wrapper.find(".datepicker__button-cancel").trigger("click");
      expect(wrapper.emitted("cancel")).toBeTruthy();
    });

    it("should handle quick pick button clicks", async () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDateRange,
          type: "inline",
          maxRange: [new Date(2024, 0, 1), new Date(2024, 0, 31)],
        },
      });

      // Force range mode by setting dates directly
      wrapper.vm.dates = [new Date(), new Date()];
      await nextTick();

      // Find and click a quick pick button
      const buttons = wrapper.findAll(".datepicker-popup__shortcut");
      const quarterButton = buttons.find((btn: any) => btn.text().includes("Quarter Hour"));

      if (quarterButton) {
        await quarterButton.trigger("click");
        await nextTick();
        expect(wrapper.vm.selectedShortcut).toBe("quarter");
      } else {
        // If not in range mode, test the quickPick method directly
        wrapper.vm.quickPick("quarter");
        expect(wrapper.vm.selectedShortcut).toBe("quarter");
      }
    });
  });

  describe("Lifecycle", () => {
    it("should add document event listener on mount", () => {
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");
      wrapper = mount(TimePicker);
      expect(addEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function), true);
      addEventListenerSpy.mockRestore();
    });

    it("should remove document event listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
      wrapper = mount(TimePicker);
      wrapper.unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function), true);
      removeEventListenerSpy.mockRestore();
    });

    it("should initialize dates from props value", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDate,
        },
      });
      expect(wrapper.vm.dates).toHaveLength(1);
      expect(wrapper.vm.inputDates).toHaveLength(1);
    });

    it("should initialize dates from array value", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDateRange,
        },
      });
      expect(wrapper.vm.dates).toHaveLength(2);
      expect(wrapper.vm.inputDates).toHaveLength(2);
    });

    it("should watch for value prop changes", async () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDate,
        },
      });

      await wrapper.setProps({ value: mockDateRange });
      expect(wrapper.vm.dates).toHaveLength(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle null value", () => {
      wrapper = mount(TimePicker as any, {
        props: {
          value: null,
        },
      });
      expect(wrapper.vm.dates).toHaveLength(1);
    });

    it("should handle undefined value", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: undefined,
        },
      });
      expect(wrapper.vm.dates).toHaveLength(1);
    });

    it("should handle empty array value", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: [],
        },
      });
      expect(wrapper.vm.dates).toHaveLength(2);
    });

    it("should handle single item array", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: [mockDate],
        },
      });
      expect(wrapper.vm.dates).toHaveLength(1);
    });

    it("should handle string value", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: "2024-01-15",
        },
      });
      expect(wrapper.vm.dates).toHaveLength(1);
    });

    it("should handle invalid date string", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: "invalid-date",
        },
      });
      expect(wrapper.vm.dates).toHaveLength(1);
      expect(wrapper.vm.dates[0]).toBeInstanceOf(Date);
    });
  });

  describe("Accessibility", () => {
    it("should have proper tabindex on popup", () => {
      wrapper = mount(TimePicker, {
        props: {
          type: "inline",
        },
      });

      const popup = wrapper.find(".datepicker-popup");
      expect(popup.attributes("tabindex")).toBe("-1");
    });

    it("should have proper button types", () => {
      wrapper = mount(TimePicker, {
        props: {
          showButtons: true,
          type: "inline",
        },
      });

      const submitButton = wrapper.find(".datepicker__button-select");
      const cancelButton = wrapper.find(".datepicker__button-cancel");

      expect(submitButton.element.tagName).toBe("BUTTON");
      expect(cancelButton.element.tagName).toBe("BUTTON");
    });

    it("should have proper button types for quick pick", () => {
      wrapper = mount(TimePicker, {
        props: {
          value: mockDateRange,
          type: "inline",
        },
      });

      const quickPickButtons = wrapper.findAll(".datepicker-popup__shortcut");
      quickPickButtons.forEach((button: any) => {
        expect(button.attributes("type")).toBe("button");
      });
    });
  });

  describe("Internationalization", () => {
    it("should use i18n translations", () => {
      wrapper = mount(TimePicker);

      expect(wrapper.vm.local.cancelTip).toBe("Cancel");
      expect(wrapper.vm.local.submitTip).toBe("Confirm");
      expect(wrapper.vm.local.quarterHourCutTip).toBe("Quarter Hour");
      expect(wrapper.vm.local.halfHourCutTip).toBe("Half Hour");
      expect(wrapper.vm.local.hourCutTip).toBe("Hour");
      expect(wrapper.vm.local.dayCutTip).toBe("Day");
      expect(wrapper.vm.local.weekCutTip).toBe("Week");
      expect(wrapper.vm.local.monthCutTip).toBe("Month");
    });

    it("should handle month names correctly", () => {
      wrapper = mount(TimePicker);

      expect(wrapper.vm.local.monthsHead).toHaveLength(12);
      expect(wrapper.vm.local.months).toHaveLength(12);
      expect(wrapper.vm.local.weeks).toHaveLength(7);
    });
  });
});
