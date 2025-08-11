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
import useAssociateProcessor from "../useAssociateProcessor";
import type { EventParams } from "@/types/app";
import type { AssociateProcessorProps, FilterOption } from "@/types/dashboard";

// Mock the store
let mockAppStore: any;
vi.mock("@/store/modules/app", () => ({
  useAppStoreWithOut: () => mockAppStore,
}));

// Mock utility functions
vi.mock("@/utils/dateFormat", () => ({
  default: vi.fn((date: Date, step: string, monthDayDiff?: boolean) => {
    if (step === "HOUR" && monthDayDiff) {
      return "2023-01-01 12";
    }
    return "2023-01-01 12:00:00";
  }),
}));

vi.mock("@/utils/localtime", () => ({
  default: vi.fn((utc: boolean, date: Date) => new Date(date)),
}));

// Mock structuredClone
const structuredCloneMock = vi.fn((obj: any) => JSON.parse(JSON.stringify(obj)));
Object.defineProperty(window, "structuredClone", {
  value: structuredCloneMock,
  writable: true,
});

// Helper function to create mock legend options
const createMockLegendOptions = () => ({
  show: false,
  total: false,
  min: false,
  max: false,
  mean: false,
  asTable: false,
  toTheRight: false,
  width: 0,
  asSelector: false,
});

describe("useAssociateProcessor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAppStore = {
      utc: false,
      intervalUnix: [1640995200000, 1640998800000, 1641002400000], // Sample timestamps
      durationRow: { step: "HOUR" },
    };
  });

  describe("eventAssociate", () => {
    it("returns undefined when no filters provided", () => {
      const mockProps: AssociateProcessorProps = {
        filters: { dataIndex: 0, sourceId: "test" },
        option: { series: [], type: "line", legend: createMockLegendOptions() },
        relatedTrace: {
          duration: { start: "0", end: "0", step: "HOUR" },
          refIdType: "",
          status: "",
          queryOrder: "",
          latency: false,
          enableRelate: false,
        },
      };
      const { eventAssociate } = useAssociateProcessor(mockProps);
      const result = eventAssociate();
      expect(result).toEqual({ series: [], type: "line", legend: createMockLegendOptions() });
    });

    it("returns option when no duration in filters", () => {
      const option: FilterOption = {
        series: [
          {
            name: "test",
            data: [[1, 2]] as (number | string)[][],
          },
        ],
        type: "line",
        legend: createMockLegendOptions(),
      };
      const mockProps: AssociateProcessorProps = {
        filters: { dataIndex: 0, sourceId: "test" },
        option,
        relatedTrace: {
          duration: { start: "0", end: "0", step: "HOUR" },
          refIdType: "",
          status: "",
          queryOrder: "",
          latency: false,
          enableRelate: false,
        },
      };
      const { eventAssociate } = useAssociateProcessor(mockProps);
      const result = eventAssociate();
      expect(result).toBe(option);
    });

    it("returns undefined when no series data", () => {
      const option: FilterOption = { series: [], type: "line", legend: createMockLegendOptions() };
      const mockProps: AssociateProcessorProps = {
        filters: {
          dataIndex: 0,
          sourceId: "test",
          duration: { startTime: 1000, endTime: 2000, step: "HOUR" },
        },
        option,
        relatedTrace: {
          duration: { start: "0", end: "0", step: "HOUR" },
          refIdType: "",
          status: "",
          queryOrder: "",
          latency: false,
          enableRelate: false,
        },
      };
      const { eventAssociate } = useAssociateProcessor(mockProps);
      const result = eventAssociate();
      expect(result).toBeUndefined();
    });

    it("returns undefined when endTime not in series data", () => {
      const option: FilterOption = {
        series: [
          {
            name: "test",
            data: [
              [1000, 1],
              [1500, 2],
            ] as (number | string)[][],
          },
        ],
        type: "line",
        legend: createMockLegendOptions(),
      };
      const mockProps: AssociateProcessorProps = {
        filters: {
          dataIndex: 0,
          sourceId: "test",
          duration: { startTime: 1000, endTime: 3000, step: "HOUR" },
        },
        option,
        relatedTrace: {
          duration: { start: "0", end: "0", step: "HOUR" },
          refIdType: "",
          status: "",
          queryOrder: "",
          latency: false,
          enableRelate: false,
        },
      };
      const { eventAssociate } = useAssociateProcessor(mockProps);
      const result = eventAssociate();
      expect(result).toBeUndefined();
    });

    it("adds markArea when endTime exists in series data", () => {
      const option: FilterOption = {
        series: [
          {
            name: "test",
            data: [
              [1000, 1],
              [2000, 2],
              [3000, 3],
            ] as (number | string)[][],
          },
        ],
        type: "line",
        legend: createMockLegendOptions(),
      };
      const mockProps: AssociateProcessorProps = {
        filters: {
          dataIndex: 0,
          sourceId: "test",
          duration: { startTime: 1000, endTime: 2000, step: "HOUR" },
        },
        option,
        relatedTrace: {
          duration: { start: "0", end: "0", step: "HOUR" },
          refIdType: "",
          status: "",
          queryOrder: "",
          latency: false,
          enableRelate: false,
        },
      };
      const { eventAssociate } = useAssociateProcessor(mockProps);
      const result = eventAssociate();

      expect(result).toBeDefined();
      expect(result?.series[0].markArea).toEqual({
        silent: true,
        itemStyle: { opacity: 0.3 },
        data: [[{ xAxis: 1000 }, { xAxis: 2000 }]],
      });
      expect(structuredCloneMock).toHaveBeenCalledWith(option.series);
    });

    it("preserves other series properties when adding markArea", () => {
      const option: FilterOption = {
        series: [
          {
            name: "Series1",
            data: [
              [1000, 1],
              [2000, 2],
            ] as (number | string)[][],
          },
          {
            name: "Series2",
            data: [
              [1000, 3],
              [2000, 4],
            ] as (number | string)[][],
          },
        ],
        type: "line",
        legend: createMockLegendOptions(),
      };
      const mockProps: AssociateProcessorProps = {
        filters: {
          dataIndex: 0,
          sourceId: "test",
          duration: { startTime: 1000, endTime: 2000, step: "HOUR" },
        },
        option,
        relatedTrace: {
          duration: { start: "0", end: "0", step: "HOUR" },
          refIdType: "",
          status: "",
          queryOrder: "",
          latency: false,
          enableRelate: false,
        },
      };
      const { eventAssociate } = useAssociateProcessor(mockProps);
      const result = eventAssociate();

      expect(result?.series).toHaveLength(2);
      expect(result?.series[0].name).toBe("Series1");
      expect(result?.series[0].markArea).toBeDefined();
      expect(result?.series[1].name).toBe("Series2");
      expect(result?.series[1].markArea).toBeUndefined();
    });
  });

  describe("traceFilters", () => {
    it("returns undefined when no currentParams provided", () => {
      const mockProps: AssociateProcessorProps = {
        filters: { dataIndex: 0, sourceId: "test" },
        option: { series: [], type: "line", legend: createMockLegendOptions() },
        relatedTrace: {
          duration: { start: "0", end: "0", step: "HOUR" },
          refIdType: "",
          status: "",
          queryOrder: "",
          latency: false,
          enableRelate: false,
        },
      };
      const { traceFilters } = useAssociateProcessor(mockProps);
      const result = traceFilters(null);
      expect(result).toBeUndefined();
    });

    it("returns object with undefined duration when no start time in intervalUnix", () => {
      mockAppStore.intervalUnix = [];
      const mockProps: AssociateProcessorProps = {
        filters: { dataIndex: 0, sourceId: "test" },
        option: { series: [], type: "line", legend: createMockLegendOptions() },
        relatedTrace: {
          duration: { start: "0", end: "0", step: "HOUR" },
          refIdType: "",
          status: "",
          queryOrder: "",
          latency: false,
          enableRelate: false,
        },
      };
      const { traceFilters } = useAssociateProcessor(mockProps);
      const currentParams: EventParams = {
        componentType: "chart",
        seriesType: "line",
        seriesIndex: 0,
        seriesName: "test",
        name: "test",
        data: [1000, 1],
        dataType: "number",
        value: 1,
        color: "#000",
        event: {},
        dataIndex: 0,
      };
      const result = traceFilters(currentParams);
      expect(result).toBeDefined();
      expect(result?.duration).toBeUndefined();
      expect(result?.metricValue).toEqual([]);
    });

    it("returns trace filters with duration when start time exists", () => {
      const mockProps: AssociateProcessorProps = {
        filters: { dataIndex: 0, sourceId: "test" },
        option: { series: [], type: "line", legend: createMockLegendOptions() },
        relatedTrace: {
          duration: { start: "0", end: "0", step: "HOUR" },
          refIdType: "",
          status: "",
          queryOrder: "",
          latency: false,
          enableRelate: false,
        },
      };
      const { traceFilters } = useAssociateProcessor(mockProps);
      const currentParams: EventParams = {
        componentType: "chart",
        seriesType: "line",
        seriesIndex: 0,
        seriesName: "test",
        name: "test",
        data: [1000, 1],
        dataType: "number",
        value: 1,
        color: "#000",
        event: {},
        dataIndex: 0,
      };
      const result = traceFilters(currentParams);

      expect(result).toBeDefined();
      expect(result?.duration).toEqual({
        start: "2023-01-01 12",
        end: "2023-01-01 12",
        step: "HOUR",
      });
      expect(result?.queryOrder).toBe("");
      expect(result?.status).toBe("");
    });

    it("includes relatedTrace properties when provided", () => {
      const mockProps: AssociateProcessorProps = {
        filters: { dataIndex: 0, sourceId: "test" },
        option: { series: [], type: "line", legend: createMockLegendOptions() },
        relatedTrace: {
          duration: { start: "0", end: "0", step: "HOUR" },
          refIdType: "",
          status: "SUCCESS",
          queryOrder: "BY_START_TIME",
          latency: true,
          enableRelate: true,
        },
      };
      const { traceFilters } = useAssociateProcessor(mockProps);
      const currentParams: EventParams = {
        componentType: "chart",
        seriesType: "line",
        seriesIndex: 0,
        seriesName: "test",
        name: "test",
        data: [1000, 1],
        dataType: "number",
        value: 1,
        color: "#000",
        event: {},
        dataIndex: 0,
      };
      const result = traceFilters(currentParams);

      expect(result?.status).toBe("SUCCESS");
      expect(result?.queryOrder).toBe("BY_START_TIME");
    });

    it("generates latency list when latency is enabled", () => {
      const option: FilterOption = {
        series: [
          {
            name: "Service1",
            data: [[1000, 100] as (number | string)[], [2000, 200] as (number | string)[]],
          },
          {
            name: "Service2",
            data: [[1000, 150] as (number | string)[], [2000, 250] as (number | string)[]],
          },
        ],
        type: "line",
        legend: createMockLegendOptions(),
      };
      const mockProps: AssociateProcessorProps = {
        filters: { dataIndex: 0, sourceId: "test" },
        option,
        relatedTrace: {
          duration: { start: "0", end: "0", step: "HOUR" },
          refIdType: "",
          status: "",
          queryOrder: "",
          latency: true,
          enableRelate: false,
        },
      };
      const { traceFilters } = useAssociateProcessor(mockProps);
      const currentParams: EventParams = {
        componentType: "chart",
        seriesType: "line",
        seriesIndex: 0,
        seriesName: "test",
        name: "test",
        data: [1000, 1],
        dataType: "number",
        value: 1,
        color: "#000",
        event: {},
        dataIndex: 0,
      };
      const result = traceFilters(currentParams);

      expect(result?.latency).toHaveLength(2);
      expect(result?.latency[0]).toEqual({
        label: "Service1--Service2",
        value: "0",
        data: [100, 150],
      });
      expect(result?.latency[1]).toEqual({
        label: "Service2--Infinity",
        value: "1",
        data: [150, Infinity],
      });
    });

    it("generates metricValue for all series", () => {
      const option: FilterOption = {
        series: [
          {
            name: "Service1",
            data: [[1000, 100] as (number | string)[], [2000, 200] as (number | string)[]],
          },
          {
            name: "Service2",
            data: [[1000, 150] as (number | string)[], [2000, 250] as (number | string)[]],
          },
        ],
        type: "line",
        legend: createMockLegendOptions(),
      };
      const mockProps: AssociateProcessorProps = {
        filters: { dataIndex: 0, sourceId: "test" },
        option,
        relatedTrace: {
          duration: { start: "0", end: "0", step: "HOUR" },
          refIdType: "",
          status: "",
          queryOrder: "",
          latency: false,
          enableRelate: false,
        },
      };
      const { traceFilters } = useAssociateProcessor(mockProps);
      const currentParams: EventParams = {
        componentType: "chart",
        seriesType: "line",
        seriesIndex: 0,
        seriesName: "test",
        name: "test",
        data: [1000, 1],
        dataType: "number",
        value: 1,
        color: "#000",
        event: {},
        dataIndex: 0,
      };
      const result = traceFilters(currentParams);

      expect(result?.metricValue).toHaveLength(2);
      expect(result?.metricValue[0]).toEqual({
        label: "Service1",
        value: "0",
        data: 100,
        date: 1000,
      });
      expect(result?.metricValue[1]).toEqual({
        label: "Service2",
        value: "1",
        data: 150,
        date: 1000,
      });
    });

    it("handles empty series gracefully", () => {
      const mockProps: AssociateProcessorProps = {
        filters: { dataIndex: 0, sourceId: "test" },
        option: { series: [], type: "line", legend: createMockLegendOptions() },
        relatedTrace: {
          duration: { start: "0", end: "0", step: "HOUR" },
          refIdType: "",
          status: "",
          queryOrder: "",
          latency: false,
          enableRelate: false,
        },
      };
      const { traceFilters } = useAssociateProcessor(mockProps);
      const currentParams: EventParams = {
        componentType: "chart",
        seriesType: "line",
        seriesIndex: 0,
        seriesName: "test",
        name: "test",
        data: [1000, 1],
        dataType: "number",
        value: 1,
        color: "#000",
        event: {},
        dataIndex: 0,
      };
      const result = traceFilters(currentParams);

      expect(result?.metricValue).toEqual([]);
      expect(result?.latency).toBeUndefined();
    });
  });
});
