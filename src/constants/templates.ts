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
        x: 0,
        y: 0,
        w: 24,
        h: 45,
        i: "0",
        type: "Tab",
        widget: {},
        graph: {},
        standard: {},
        metrics: [],
        metricTypes: [],
        children: [
          {
            x: 0,
            y: 0,
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
            x: 0,
            y: 0,
            w: 8,
            h: 12,
            i: "1",
            metrics: ["all_percentile"],
            metricTypes: ["readLabeledMetricsValues"],
            type: "Widget",
            widget: {
              title: "Global Response Latency",
              tips: "Tooltip",
            },
            graph: {
              type: "Line",
            },
            standard: {
              unit: "percentile in ms",
              metricLabels: "P50, P75, P90, P95, P99",
              labelsIndex: "0, 1, 2, 3, 4",
            },
          },
          {
            x: 0,
            y: 0,
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
    ],
  },
};

export const ServiceLayout = {
  id: "1",
  configuration: {
    name: "Service",
    isRoot: true,
    children: [
      {
        x: 0,
        y: 0,
        w: 24,
        h: 45,
        i: "0",
        type: "Tab",
        widget: {},
        graph: {},
        standard: {},
        metrics: [],
        metricTypes: [],
        children: [
          {
            name: "Overview",
            children: [
              {
                x: 0,
                y: 0,
                w: 8,
                h: 12,
                i: "0",
                metrics: ["service_percentile"],
                metricTypes: ["readLabeledMetricsValues"],
                type: "Widget",
                widget: {
                  title: "Service Response Time Percentile",
                },
                graph: {
                  type: "Line",
                },
                standard: {
                  unit: "ms",
                  metricLabels: "P50, P75, P90, P95, P99",
                  labelsIndex: "0, 1, 2, 3, 4",
                },
              },
              {
                x: 8,
                y: 0,
                w: 8,
                h: 12,
                i: "1",
                metrics: ["service_apdex"],
                metricTypes: ["readMetricsValue"],
                type: "Widget",
                widget: {
                  title: "Service Apdex",
                  tips: "Tooltip",
                },
                graph: {
                  type: "Card",
                  fontSize: 20,
                },
                standard: {
                  divide: "10000",
                },
              },
              {
                x: 16,
                y: 0,
                w: 8,
                h: 12,
                i: "2",
                metrics: ["service_sla"],
                metricTypes: ["readMetricsValue"],
                type: "Widget",
                widget: {
                  title: "Successful Rate",
                  tips: "Tooltip",
                },
                graph: {
                  type: "Card",
                  fontSize: 20,
                },
                standard: {
                  unit: "%",
                  divide: "100",
                },
              },
              {
                x: 0,
                y: 12,
                w: 8,
                h: 12,
                i: "3",
                metrics: ["service_cpm"],
                metricTypes: ["readMetricsValue"],
                type: "Widget",
                widget: {
                  title: "Service Load",
                  tips: "For HTTP 1/2, gRPC, RPC services, this means Calls Per Minute (CPM), for TCP services, this means Packets Per Minute (PPM)",
                },
                graph: {
                  type: "Card",
                  fontSize: 20,
                },
                standard: {
                  unit: "CPM / PPM",
                  divide: "100",
                },
              },
              {
                x: 8,
                y: 12,
                w: 8,
                h: 12,
                i: "4",
                metrics: ["service_cpm"],
                metricTypes: ["readMetricsValues"],
                type: "Widget",
                widget: {
                  title: "Service cpm",
                  tips: "For HTTP 1/2, gRPC, RPC services, this means Calls Per Minute (CPM), for TCP services, this means Packets Per Minute (PPM)",
                },
                graph: {
                  type: "Line",
                },
                standard: {
                  unit: "CPM / PPM",
                  divide: "100",
                },
              },
              {
                x: 16,
                y: 12,
                w: 8,
                h: 12,
                i: "5",
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
                x: 0,
                y: 24,
                w: 8,
                h: 12,
                i: "6",
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
                  divide: "10000",
                },
              },
              {
                x: 8,
                y: 24,
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
                  divide: "100",
                },
              },
              {
                x: 16,
                y: 24,
                w: 8,
                h: 12,
                i: "8",
                metrics: [
                  "service_throughput_received",
                  "service_throughput_sent",
                ],
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
                x: 0,
                y: 36,
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
                x: 8,
                y: 36,
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
          {
            name: "Endpoints",
            children: [
              {
                x: 0,
                y: 0,
                w: 16,
                h: 12,
                i: "0",
                metrics: ["endpoint_sla"],
                metricTypes: ["readMetricsValues"],
                type: "Widget",
                widget: {},
                graph: {
                  type: "EndpointList",
                  dashboardName: "123",
                  fontSize: 12,
                },
                standard: {},
              },
            ],
          },
          {
            name: "Service Instances",
            children: [
              {
                x: 0,
                y: 0,
                w: 16,
                h: 12,
                i: "0",
                metrics: ["service_instance_sla"],
                metricTypes: ["readMetricsValues"],
                type: "Widget",
                widget: {},
                graph: {
                  type: "InstanceList",
                  dashboardName: "123",
                  fontSize: 12,
                },
                standard: {
                  unit: "ms",
                },
              },
            ],
          },
          {
            name: "Topology",
            children: [
              {
                x: 0,
                y: 0,
                w: 4,
                h: 6,
                i: "0",
                metrics: [],
                metricTypes: [],
                type: "Topology",
                widget: {},
                graph: {
                  fontColor: "white",
                  backgroundColor: "green",
                  iconTheme: true,
                  content: "Topology",
                  fontSize: 18,
                  showDepth: true,
                },
                standard: {},
              },
            ],
          },
          {
            name: "Trace",
            children: [
              {
                x: 0,
                y: 0,
                w: 24,
                h: 36,
                i: "0",
                metrics: [],
                metricTypes: [],
                type: "Trace",
                widget: {},
                graph: {},
                standard: {},
              },
            ],
          },
          {
            name: "Profile",
            children: [
              {
                x: 0,
                y: 0,
                w: 24,
                h: 36,
                i: "0",
                metrics: [],
                metricTypes: [],
                type: "Profile",
                widget: {},
                graph: {},
                standard: {},
              },
            ],
          },
          {
            name: "Log",
            children: [
              {
                x: 0,
                y: 0,
                w: 24,
                h: 36,
                i: "0",
                metrics: [],
                metricTypes: [],
                type: "Log",
                widget: {},
                graph: {},
                standard: {},
              },
            ],
          },
        ],
      },
    ],
  },
};
