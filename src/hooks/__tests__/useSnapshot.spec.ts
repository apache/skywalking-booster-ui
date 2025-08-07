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
import { useSnapshot } from "../useSnapshot";
import type { MetricsResults } from "@/types/dashboard";

// Helper function to create metric values with required properties
const createMetricValue = (value: string, name: string = "test") => ({
  name,
  value,
  owner: null,
  refId: null,
});

describe("useSnapshot", () => {
  describe("processResults", () => {
    it("should process metrics without labels", () => {
      const metrics = [
        {
          name: "cpu_usage",
          results: [
            {
              metric: { labels: [] },
              values: [
                { name: "cpu_usage", value: "75.5", owner: null, refId: null },
                { name: "cpu_usage", value: "82.3", owner: null, refId: null },
              ],
            },
          ],
        },
      ];

      const { processResults } = useSnapshot(metrics);
      const result = processResults();

      expect(result).toEqual([
        {
          name: "cpu_usage",
          values: [{ values: [75.5, 82.3] }],
        },
      ]);
    });

    it("should process metrics with labels", () => {
      const metrics = [
        {
          name: "memory_usage",
          results: [
            {
              metric: {
                labels: [{ key: "instance", value: "server-1" }],
              },
              values: [createMetricValue("45.2", "memory_usage")],
            },
          ],
        },
      ];

      const { processResults } = useSnapshot(metrics);
      const result = processResults();

      expect(result).toEqual([
        {
          name: "memory_usage",
          values: [
            {
              name: "memory_usage{instance=server-1}",
              values: [45.2],
            },
          ],
        },
      ]);
    });

    it("should process metrics with multiple labels", () => {
      const metrics = [
        {
          name: "http_requests",
          results: [
            {
              metric: {
                labels: [
                  { key: "method", value: "GET" },
                  { key: "status", value: "200" },
                ],
              },
              values: [createMetricValue("100", "http_requests"), createMetricValue("150", "http_requests")],
            },
          ],
        },
      ];

      const { processResults } = useSnapshot(metrics);
      const result = processResults();

      expect(result).toEqual([
        {
          name: "http_requests",
          values: [
            {
              name: "http_requests{method=GET},http_requests{status=200}",
              values: [100, 150],
            },
          ],
        },
      ]);
    });

    it("should process multiple metrics", () => {
      const metrics: { name: string; results: MetricsResults[] }[] = [
        {
          name: "cpu_usage",
          results: [
            {
              metric: { labels: [] },
              values: [{ value: "75.5", name: "cpu_usage", owner: null, refId: null }],
            },
          ],
        },
        {
          name: "memory_usage",
          results: [
            {
              metric: {
                labels: [{ key: "instance", value: "server-1" }],
              },
              values: [{ value: "45.2", name: "memory_usage", owner: null, refId: null }],
            },
          ],
        },
      ];

      const { processResults } = useSnapshot(metrics);
      const result = processResults();

      expect(result).toEqual([
        {
          name: "cpu_usage",
          values: [{ values: [75.5] }],
        },
        {
          name: "memory_usage",
          values: [
            {
              name: "memory_usage{instance=server-1}",
              values: [45.2],
            },
          ],
        },
      ]);
    });

    it("should handle empty values array", () => {
      const metrics = [
        {
          name: "empty_metric",
          results: [
            {
              metric: { labels: [] },
              values: [],
            },
          ],
        },
      ];

      const { processResults } = useSnapshot(metrics);
      const result = processResults();

      expect(result).toEqual([
        {
          name: "empty_metric",
          values: [{ values: [] }],
        },
      ]);
    });

    it("should handle empty results array", () => {
      const metrics = [
        {
          name: "no_results_metric",
          results: [],
        },
      ];

      const { processResults } = useSnapshot(metrics);
      const result = processResults();

      expect(result).toEqual([
        {
          name: "no_results_metric",
          values: [],
        },
      ]);
    });

    it("should handle empty metrics array", () => {
      const metrics: { name: string; results: MetricsResults[] }[] = [];

      const { processResults } = useSnapshot(metrics);
      const result = processResults();

      expect(result).toEqual([]);
    });

    it("should handle decimal values", () => {
      const metrics: { name: string; results: MetricsResults[] }[] = [
        {
          name: "precision_metric",
          results: [
            {
              metric: { labels: [] },
              values: [
                { value: "3.14159", name: "precision_metric", owner: null, refId: null },
                { value: "2.71828", name: "precision_metric", owner: null, refId: null },
              ],
            },
          ],
        },
      ];

      const { processResults } = useSnapshot(metrics);
      const result = processResults();

      expect(result).toEqual([
        {
          name: "precision_metric",
          values: [{ values: [3.14159, 2.71828] }],
        },
      ]);
    });

    it("should handle negative numbers", () => {
      const metrics: { name: string; results: MetricsResults[] }[] = [
        {
          name: "negative_metric",
          results: [
            {
              metric: { labels: [] },
              values: [
                { value: "-10", name: "negative_metric", owner: null, refId: null },
                { value: "-3.14", name: "negative_metric", owner: null, refId: null },
                { value: "0", name: "negative_metric", owner: null, refId: null },
              ],
            },
          ],
        },
      ];

      const { processResults } = useSnapshot(metrics);
      const result = processResults();

      expect(result).toEqual([
        {
          name: "negative_metric",
          values: [{ values: [-10, -3.14, 0] }],
        },
      ]);
    });

    it("should handle mixed scenarios", () => {
      const metrics: { name: string; results: MetricsResults[] }[] = [
        {
          name: "mixed_metric",
          results: [
            {
              metric: { labels: [] },
              values: [{ value: "100", name: "mixed_metric", owner: null, refId: null }],
            },
            {
              metric: {
                labels: [{ key: "instance", value: "server-1" }],
              },
              values: [{ value: "200", name: "mixed_metric", owner: null, refId: null }],
            },
          ],
        },
      ];

      const { processResults } = useSnapshot(metrics);
      const result = processResults();

      expect(result).toEqual([
        {
          name: "mixed_metric",
          values: [
            { values: [100] },
            {
              name: "mixed_metric{instance=server-1}",
              values: [200],
            },
          ],
        },
      ]);
    });
  });
});
