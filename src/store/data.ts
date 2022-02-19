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
export const NewControl = {
  x: 0,
  y: 0,
  w: 24,
  h: 12,
  i: "0",
  type: "Widget",
  widget: {
    title: "Title",
  },
  graph: {},
  standard: {},
  metrics: [""],
  metricTypes: [""],
};
export const ConfigData: any = {
  x: 0,
  y: 0,
  w: 8,
  h: 12,
  i: "0",
  metrics: ["service_resp_time"],
  metricTypes: ["readMetricsValues"],
  type: "Widget",
  widget: {
    title: "service_resp_time",
    tips: "Tooltip",
  },
  graph: {
    type: "Line",
    showXAxis: true,
    showYAxis: true,
  },
  standard: {
    sortOrder: "DEC",
    unit: "min",
  },
  children: [],
};
export const ConfigData1: any = {
  x: 0,
  y: 0,
  w: 8,
  h: 12,
  i: "0",
  metrics: ["service_instance_resp_time"],
  metricTypes: ["readMetricsValues"],
  type: "Widget",
  widget: {
    title: "service_instance_resp_time",
    tips: "Tooltip",
  },
  graph: {
    type: "Line",
    showXAxis: true,
    showYAxis: true,
  },
  standard: {
    sortOrder: "DEC",
    unit: "min",
  },
  children: [],
};
export const ConfigData2: any = {
  x: 0,
  y: 0,
  w: 8,
  h: 12,
  i: "0",
  metrics: ["endpoint_avg"],
  metricTypes: ["readMetricsValues"],
  type: "Widget",
  widget: {
    title: "endpoint_avg",
    tips: "Tooltip",
  },
  graph: {
    type: "Line",
    showXAxis: true,
    showYAxis: true,
  },
  standard: {
    sortOrder: "DEC",
    unit: "min",
  },
  children: [],
};
export const ConfigData3: any = [
  {
    x: 0,
    y: 0,
    w: 2,
    h: 6,
    i: "1",
    type: "Topology",
    widget: {
      title: "Topology",
      tips: "Topology",
    },
  },
  {
    x: 2,
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
      unit: "min",
    },
    children: [],
  },
];
export const ConfigData4: any = {
  x: 0,
  y: 0,
  w: 8,
  h: 12,
  i: "0",
  metrics: ["service_relation_server_resp_time"],
  metricTypes: ["readMetricsValues"],
  type: "Widget",
  widget: {
    title: "service_relation_server_resp_time",
    tips: "Tooltip",
  },
  graph: {
    type: "Line",
  },
  standard: {
    unit: "min",
  },
  children: [],
};
export const ConfigData5: any = {
  x: 0,
  y: 0,
  w: 8,
  h: 12,
  i: "0",
  metrics: ["endpoint_relation_cpm"],
  metricTypes: ["readMetricsValues"],
  type: "Widget",
  widget: {
    title: "endpoint_relation_cpm",
    tips: "Tooltip",
  },
  graph: {
    type: "Line",
  },
  standard: {
    unit: "min",
  },
  children: [],
};
export const ConfigData6: any = {
  x: 0,
  y: 0,
  w: 8,
  h: 12,
  i: "0",
  metrics: ["service_instance_relation_server_cpm"],
  metricTypes: ["readMetricsValues"],
  type: "Widget",
  widget: {
    title: "service_instance_relation_server_cpm",
    tips: "Tooltip",
  },
  graph: {
    type: "Line",
  },
  standard: {
    unit: "min",
  },
  children: [],
};
