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
import useLegendProcess from "../useLegendProcessor";
import { useAppStoreWithOut } from "@/store/modules/app";
import { Themes } from "@/constants/data";
import { DarkChartColors, LightChartColors } from "../data";
import type { LegendOptions } from "@/types/dashboard";

// Mock the store
vi.mock("@/store/modules/app", () => ({
  useAppStoreWithOut: vi.fn(),
}));

describe("useLegendProcess hook", () => {
  const mockAppStore = {
    theme: Themes.Light,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStoreWithOut as any).mockReturnValue(mockAppStore);
  });

  describe("isRight property", () => {
    it("should return false when legend is undefined", () => {
      const { isRight } = useLegendProcess();
      expect(isRight).toBe(false);
    });

    it("should return false when legend.toTheRight is false", () => {
      const legend: LegendOptions = {
        show: true,
        total: false,
        min: false,
        max: false,
        mean: false,
        asTable: false,
        toTheRight: false,
        width: 100,
        asSelector: false,
      };
      const { isRight } = useLegendProcess(legend);
      expect(isRight).toBe(false);
    });

    it("should return true when legend.toTheRight is true", () => {
      const legend: LegendOptions = {
        show: true,
        total: false,
        min: false,
        max: false,
        mean: false,
        asTable: false,
        toTheRight: true,
        width: 100,
        asSelector: false,
      };
      const { isRight } = useLegendProcess(legend);
      expect(isRight).toBe(true);
    });
  });

  describe("showEchartsLegend function", () => {
    it("should return false when legend.show is false", () => {
      const legend: LegendOptions = {
        show: false,
        total: false,
        min: false,
        max: false,
        mean: false,
        asTable: false,
        toTheRight: false,
        width: 100,
        asSelector: false,
      };
      const { showEchartsLegend } = useLegendProcess(legend);
      expect(showEchartsLegend(["key1", "key2"])).toBe(false);
    });

    it("should return false when legend.asTable is true and legend.show is true", () => {
      const legend: LegendOptions = {
        show: true,
        total: false,
        min: false,
        max: false,
        mean: false,
        asTable: true,
        toTheRight: false,
        width: 100,
        asSelector: false,
      };
      const { showEchartsLegend } = useLegendProcess(legend);
      expect(showEchartsLegend(["key1", "key2"])).toBe(false);
    });

    it("should return true when legend.show is true and asTable is false", () => {
      const legend: LegendOptions = {
        show: true,
        total: false,
        min: false,
        max: false,
        mean: false,
        asTable: false,
        toTheRight: false,
        width: 100,
        asSelector: false,
      };
      const { showEchartsLegend } = useLegendProcess(legend);
      expect(showEchartsLegend(["key1", "key2"])).toBe(true);
    });

    it("should return false when keys length is 1", () => {
      const { showEchartsLegend } = useLegendProcess();
      expect(showEchartsLegend(["singleKey"])).toBe(false);
    });

    it("should return false when legend.asTable is true", () => {
      const legend: LegendOptions = {
        show: true,
        total: false,
        min: false,
        max: false,
        mean: false,
        asTable: true,
        toTheRight: false,
        width: 100,
        asSelector: false,
      };
      const { showEchartsLegend } = useLegendProcess(legend);
      expect(showEchartsLegend(["key1", "key2"])).toBe(false);
    });

    it("should return false when legend.asSelector is true", () => {
      const legend: LegendOptions = {
        show: undefined as any,
        total: false,
        min: false,
        max: false,
        mean: false,
        asTable: false,
        toTheRight: false,
        width: 100,
        asSelector: true,
      };
      const { showEchartsLegend } = useLegendProcess(legend);
      expect(showEchartsLegend(["key1", "key2"])).toBe(false);
    });

    it("should return true when no legend options and multiple keys", () => {
      const { showEchartsLegend } = useLegendProcess();
      expect(showEchartsLegend(["key1", "key2", "key3"])).toBe(true);
    });
  });

  describe("aggregations function", () => {
    const mockData = {
      service1: [10, 20, 30, 40, 50],
      service2: [5, 15, 25, 35, 45],
    };
    const mockIntervalTime = ["2023-01-01", "2023-01-02", "2023-01-03", "2023-01-04", "2023-01-05"];

    it("should return empty source and headers when data is empty", () => {
      const { aggregations } = useLegendProcess();
      const result = aggregations({}, mockIntervalTime);
      expect(result.source).toEqual([]);
      expect(result.headers).toEqual([]);
    });

    it("should return empty source and headers when data is null", () => {
      const { aggregations } = useLegendProcess();
      const result = aggregations(null as any, mockIntervalTime);
      expect(result.source).toEqual([]);
      expect(result.headers).toEqual([]);
    });

    it("should filter out non-array data", () => {
      const invalidData: { [key: string]: number[] } = {
        service1: [10, 20, 30],
        service2: "not an array" as any,
        service3: [],
      };
      const { aggregations } = useLegendProcess();
      const result = aggregations(invalidData, mockIntervalTime);
      expect(result.source).toHaveLength(1);
      expect(result.source[0].name).toBe("service1");
    });

    it("should filter out empty arrays", () => {
      const dataWithEmptyArrays = {
        service1: [10, 20, 30],
        service2: [],
        service3: [5, 15, 25],
      };
      const { aggregations } = useLegendProcess();
      const result = aggregations(dataWithEmptyArrays, mockIntervalTime);
      expect(result.source).toHaveLength(2);
      expect(result.source.map((item: any) => item.name)).toEqual(["service1", "service3"]);
    });

    it("should create topN with sorted values", () => {
      const { aggregations } = useLegendProcess();
      const result: any = aggregations(mockData, mockIntervalTime);

      expect(result.source).toHaveLength(2);
      expect(result.source[0].name).toBe("service1");
      expect(result.source[0].topN).toHaveLength(5);
      expect(result.source[0].topN[0].value).toBe(50); // Highest value first
      expect(result.source[0].topN[4].value).toBe(10); // Lowest value last
    });

    it("should limit topN to 10 items", () => {
      const largeData = {
        service1: Array.from({ length: 15 }, (_, i) => i + 1),
      };
      const largeIntervalTime = Array.from({ length: 15 }, (_, i) => `2023-01-${String(i + 1).padStart(2, "0")}`);

      const { aggregations } = useLegendProcess();
      const result = aggregations(largeData, largeIntervalTime);

      expect(result.source[0].topN).toHaveLength(10);
    });

    it("should include min when legend.min is true", () => {
      const legend: LegendOptions = {
        show: true,
        total: false,
        min: true,
        max: false,
        mean: false,
        asTable: false,
        toTheRight: false,
        width: 100,
        asSelector: false,
      };
      const { aggregations } = useLegendProcess(legend);
      const result = aggregations(mockData, mockIntervalTime);

      expect(result.source[0].min).toBe("10.00");
      expect(result.headers).toContainEqual({ value: "min", label: "Min" });
    });

    it("should include max when legend.max is true", () => {
      const legend: LegendOptions = {
        show: true,
        total: false,
        min: false,
        max: true,
        mean: false,
        asTable: false,
        toTheRight: false,
        width: 100,
        asSelector: false,
      };
      const { aggregations } = useLegendProcess(legend);
      const result = aggregations(mockData, mockIntervalTime);

      expect(result.source[0].max).toBe("50.00");
      expect(result.headers).toContainEqual({ value: "max", label: "Max" });
    });

    it("should include mean when legend.mean is true", () => {
      const legend: LegendOptions = {
        show: true,
        total: false,
        min: false,
        max: false,
        mean: true,
        asTable: false,
        toTheRight: false,
        width: 100,
        asSelector: false,
      };
      const { aggregations } = useLegendProcess(legend);
      const result = aggregations(mockData, mockIntervalTime);

      // Mean of [10, 20, 30, 40, 50] = 30
      expect(result.source[0].mean).toBe("30.0000");
      expect(result.headers).toContainEqual({ value: "mean", label: "Mean" });
    });

    it("should include total when legend.total is true", () => {
      const legend: LegendOptions = {
        show: true,
        total: true,
        min: false,
        max: false,
        mean: false,
        asTable: false,
        toTheRight: false,
        width: 100,
        asSelector: false,
      };
      const { aggregations } = useLegendProcess(legend);
      const result = aggregations(mockData, mockIntervalTime);

      // Total of [10, 20, 30, 40, 50] = 150
      expect(result.source[0].total).toBe("150.00");
      expect(result.headers).toContainEqual({ value: "total", label: "Total" });
    });

    it("should include all statistics when all legend options are true", () => {
      const legend: LegendOptions = {
        show: true,
        total: true,
        min: true,
        max: true,
        mean: true,
        asTable: false,
        toTheRight: false,
        width: 100,
        asSelector: false,
      };
      const { aggregations } = useLegendProcess(legend);
      const result = aggregations(mockData, mockIntervalTime);

      expect(result.source[0].min).toBe("10.00");
      expect(result.source[0].max).toBe("50.00");
      expect(result.source[0].mean).toBe("30.0000");
      expect(result.source[0].total).toBe("150.00");
      expect(result.headers).toHaveLength(4);
    });

    it("should only add headers once for the first item", () => {
      const legend: LegendOptions = {
        show: true,
        total: true,
        min: true,
        max: true,
        mean: true,
        asTable: false,
        toTheRight: false,
        width: 100,
        asSelector: false,
      };
      const { aggregations } = useLegendProcess(legend);
      const result = aggregations(mockData, mockIntervalTime);

      // Should have 4 headers (min, max, mean, total) even with 2 data items
      expect(result.headers).toHaveLength(4);
    });
  });

  describe("chartColors function", () => {
    it("should return light chart colors when theme is light", () => {
      (useAppStoreWithOut as any).mockReturnValue({ theme: Themes.Light });
      const { chartColors } = useLegendProcess();
      expect(chartColors()).toBe(LightChartColors);
    });

    it("should return dark chart colors when theme is dark", () => {
      (useAppStoreWithOut as any).mockReturnValue({ theme: Themes.Dark });
      const { chartColors } = useLegendProcess();
      expect(chartColors()).toBe(DarkChartColors);
    });

    it("should call useAppStoreWithOut", () => {
      const { chartColors } = useLegendProcess();
      chartColors();
      expect(useAppStoreWithOut).toHaveBeenCalled();
    });
  });

  describe("integration tests", () => {
    it("should work with complete legend configuration", () => {
      const legend: LegendOptions = {
        show: true,
        total: true,
        min: true,
        max: true,
        mean: true,
        asTable: false,
        toTheRight: true,
        width: 200,
        asSelector: false,
      };

      const { isRight, showEchartsLegend, aggregations, chartColors } = useLegendProcess(legend);

      // Test isRight
      expect(isRight).toBe(true);

      // Test showEchartsLegend
      expect(showEchartsLegend(["key1", "key2"])).toBe(true);

      // Test aggregations
      const data = { service1: [10, 20, 30] };
      const intervalTime = ["2023-01-01", "2023-01-02", "2023-01-03"];
      const aggResult = aggregations(data, intervalTime);
      expect(aggResult.source).toHaveLength(1);
      expect(aggResult.headers).toHaveLength(4);

      // Test chartColors
      expect(chartColors()).toBe(LightChartColors);
    });

    it("should work without legend configuration", () => {
      const { isRight, showEchartsLegend, aggregations, chartColors } = useLegendProcess();

      // Test isRight
      expect(isRight).toBe(false);

      // Test showEchartsLegend
      expect(showEchartsLegend(["key1", "key2"])).toBe(true);
      expect(showEchartsLegend(["singleKey"])).toBe(false);

      // Test aggregations
      const data = { service1: [10, 20, 30] };
      const intervalTime = ["2023-01-01", "2023-01-02", "2023-01-03"];
      const aggResult = aggregations(data, intervalTime);
      expect(aggResult.source).toHaveLength(1);
      expect(aggResult.headers).toHaveLength(0); // No legend options, so no headers

      // Test chartColors
      expect(chartColors()).toBe(LightChartColors);
    });
  });
});
