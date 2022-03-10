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
export const All = {
  id: "0",
  configuration: {
    name: "Global",
    isRoot: true,
    children: [
      {
        w: 8,
        h: 12,
        i: "0",
        metrics: ["all_heatmap"],
        metricTypes: ["readHeatMap"],
        type: "Widget",
        widget: {
          title: "all_heatmap",
          tips: "Tooltip",
        },
        graph: {
          type: "HeatMap",
        },
        standard: {
          unit: "ms",
        },
      },
      {
        w: 8,
        h: 12,
        i: "1",
        metrics: ["all_percentile"],
        metricTypes: ["readLabeledMetricsValues"],
        type: "Widget",
        metricLabels: "P50, P75, P90, P95, P99",
        labelsIndex: "0, 1, 2, 3, 4",
        widget: {
          title: "Global Response Latency",
          tips: "Tooltip",
        },
        graph: {
          type: "Line",
        },
        standard: {
          unit: "percentile in ms",
        },
      },
      {
        w: 8,
        h: 12,
        i: "3",
        metrics: ["service_cpm"],
        metricTypes: ["readMetricsValues"],
        type: "Widget",
        widget: {
          title: "Service List",
          tips: "Tooltip",
        },
        graph: {
          type: "ServiceList",
          dashboardName: "123",
          fontSize: 12,
        },
        standard: {
          unit: "percentile in ms",
        },
      },
    ],
  },
};

export const Service = {
  id: "1",
  configuration: {
    name: "Service",
    isRoot: true,
    children: [
      {
        w: 8,
        h: 12,
        i: "0",
        metrics: ["service_apdex"],
        metricTypes: ["readMetricsValue"],
        type: "Widget",
        widget: {
          title: "Service Apdex",
          tips: "Tooltip",
        },
        graph: {
          type: "Card",
        },
        standard: {
          aggregation: "/",
          aggregationNum: "10000",
        },
      },
      {
        w: 8,
        h: 12,
        i: "1",
        metrics: ["service_sla"],
        metricTypes: ["readMetricsValue"],
        type: "Widget",
        widget: {
          title: "Successful Rate",
          tips: "Tooltip",
        },
        graph: {
          type: "Card",
        },
        standard: {
          unit: "%",
          aggregation: "/",
          aggregationNum: "100",
        },
      },
      {
        w: 8,
        h: 12,
        i: "2",
        metrics: ["service_cpm"],
        metricTypes: ["readMetricsValue"],
        type: "Widget",
        widget: {
          title: "Service Load",
          tips: "For HTTP 1/2, gRPC, RPC services, this means Calls Per Minute (CPM), for TCP services, this means Packets Per Minute (PPM)",
        },
        graph: {
          type: "Card",
        },
        standard: {
          unit: "CPM / PPM",
          aggregation: "/",
          aggregationNum: "100",
        },
      },
      {
        w: 8,
        h: 12,
        i: "3",
        metrics: ["service_cpm"],
        metricTypes: ["readMetricsValues"],
        type: "Widget",
        widget: {
          title: "Service cpm",
          tips: "For HTTP 1/2, gRPC, RPC services, this means Calls Per Minute (CPM), for TCP services, this means Packets Per Minute (PPM)",
        },
        graph: {
          type: "Card",
        },
        standard: {
          unit: "CPM / PPM",
          aggregation: "/",
          aggregationNum: "100",
        },
      },
      {
        w: 8,
        h: 12,
        i: "4",
        metrics: ["service_resp_time"],
        metricTypes: ["readMetricsValues"],
        type: "Widget",
        widget: {
          title: "Service Avg Response Time",
        },
        graph: {
          type: "Line",
        },
        standard: {
          unit: "ms",
        },
      },
      {
        w: 8,
        h: 12,
        i: "5",
        metrics: ["service_apdex"],
        metricTypes: ["readMetricsValues"],
        type: "Widget",
        widget: {
          title: "Service Apdex",
        },
        graph: {
          type: "Line",
        },
        standard: {
          aggregation: "/",
          aggregationNum: "10000",
        },
      },
      {
        w: 8,
        h: 12,
        i: "6",
        metrics: ["service_percentile"],
        metricTypes: ["readLabeledMetricsValues"],
        type: "Widget",
        metricLabels: "P50, P75, P90, P95, P99",
        labelsIndex: "0, 1, 2, 3, 4",
        widget: {
          title: "Service Response Time Percentile",
        },
        graph: {
          type: "Line",
        },
        standard: {
          unit: "ms",
        },
      },
      {
        w: 8,
        h: 12,
        i: "7",
        metrics: ["service_sla"],
        metricTypes: ["readMetricsValues"],
        type: "Widget",
        widget: {
          title: "Successful Rate",
        },
        graph: {
          type: "Line",
        },
        standard: {
          unit: "%",
          aggregation: "/",
          aggregationNum: "100",
        },
      },
      {
        w: 8,
        h: 12,
        i: "8",
        metrics: ["service_throughput_received", "service_throughput_sent"],
        metricTypes: ["readMetricsValues", "readMetricsValues"],
        type: "Widget",
        widget: {
          title: "Service Throughput",
        },
        graph: {
          type: "Line",
        },
        standard: {
          unit: "Bytes",
          tips: "This metrics is only avaible for TCP services",
        },
      },
      {
        w: 8,
        h: 12,
        i: "9",
        metrics: ["service_mq_consume_count"],
        metricTypes: ["readMetricsValues"],
        type: "Widget",
        widget: {
          title: "Message Queue Consuming Count",
        },
        graph: {
          type: "Line",
        },
        standard: {
          tips: "The number of consumed messages.",
        },
      },
      {
        w: 8,
        h: 12,
        i: "10",
        metrics: ["service_mq_consume_latency"],
        metricTypes: ["readMetricsValues"],
        type: "Widget",
        widget: {
          title: "Message Queue Consuming Count",
        },
        graph: {
          type: "Line",
        },
        standard: {
          unit: "ms",
          tips: "The avg latency of message consuming. Latency = timestamp(received) - timestamp(producing)",
        },
      },
    ],
  },
};
