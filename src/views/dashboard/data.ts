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
export const dragIgnoreFrom =
  "svg.d3-trace-tree, .dragger, .micro-topo-chart, .schedules, .vis-item, .vis-timeline, .process-svg";

export const PodsChartTypes = ["EndpointList", "InstanceList"];

export const ListChartTypes = ["EndpointList", "InstanceList", "ServiceList"];

export const ChartTypes = [
  { label: "Bar", value: "Bar" },
  { label: "Line", value: "Line" },
  { label: "Area", value: "Area" },
  { label: "Card", value: "Card" },
  { label: "Top List", value: "TopList" },
  { label: "Table", value: "Table" },
  { label: "Text", value: "Text" },
  { label: "Heatmap", value: "Heatmap" },
  { label: "Service List", value: "ServiceList" },
  { label: "Endpoint List", value: "EndpointList" },
  { label: "Instance List", value: "InstanceList" },
];
export const MetricChartType: any = {
  readMetricsValue: [{ label: "Card", value: "Card" }],
  readMetricsValues: [
    { label: "Bar", value: "Bar" },
    { label: "Line", value: "Line" },
    { label: "Area", value: "Area" },
  ],
  sortMetrics: [{ label: "Top List", value: "TopList" }],
  readLabeledMetricsValues: [{ label: "Line", value: "Line" }],
  readHeatMap: [{ label: "Heat Map", value: "HeatMap" }],
  readSampledRecords: [{ label: "Top List", value: "TopList" }],
};
export const DefaultGraphConfig: { [key: string]: any } = {
  Bar: {
    type: "Bar",
    showBackground: true,
  },
  Line: {
    type: "Line",
    step: false,
    smooth: false,
    showSymbol: false,
    showXAxis: true,
    showYAxis: true,
  },
  Area: {
    type: "Area",
    opacity: 0.4,
    showXAxis: true,
    showYAxis: true,
  },
  Card: {
    type: "Card",
    fontSize: 14,
    textAlign: "center",
    showUnit: true,
  },
  Table: {
    type: "Table",
    showTableValues: true,
    tableHeaderCol1: "",
    tableHeaderCol2: "",
  },
  TopList: {
    type: "TopList",
    color: "purple",
  },
  InstanceList: {
    type: "InstanceList",
    dashboardName: "",
    fontSize: 12,
  },
  EndpointList: {
    type: "EndpointList",
    dashboardName: "",
    fontSize: 12,
    showXAxis: false,
    showYAxis: false,
  },
  ServiceList: {
    type: "ServiceList",
    dashboardName: "",
    fontSize: 12,
    showXAxis: false,
    showYAxis: false,
    showGroup: true,
  },
  HeatMap: {
    type: "HeatMap",
  },
};

export enum MetricsType {
  UNKNOWN = "UNKNOWN",
  REGULAR_VALUE = "REGULAR_VALUE",
  LABELED_VALUE = "LABELED_VALUE",
  HEATMAP = "HEATMAP",
  SAMPLED_RECORD = "SAMPLED_RECORD",
}
export const MetricTypes: {
  [key: string]: Array<{ label: string; value: string }>;
} = {
  REGULAR_VALUE: [
    { label: "read all values in the duration", value: "readMetricsValues" },
    {
      label: "read the single value in the duration",
      value: "readMetricsValue",
    },
    { label: "get sorted top N values", value: "sortMetrics" },
  ],
  LABELED_VALUE: [
    {
      label: "read all values of labels in the duration",
      value: "readLabeledMetricsValues",
    },
  ],
  HEATMAP: [
    { label: "read heatmap values in the duration", value: "readHeatMap" },
  ],
  SAMPLED_RECORD: [
    { label: "get sorted topN values", value: "readSampledRecords" },
  ],
};

export enum MetricCatalog {
  SERVICE = "Service",
  SERVICE_INSTANCE = "ServiceInstance",
  ENDPOINT = "Endpoint",
  ALL = "All",
  SERVICE_RELATION = "ServiceRelation",
  SERVICE_INSTANCE_RELATION = "ServiceInstanceRelation",
  ENDPOINT_RELATION = "EndpointRelation",
}
export const EntityType = [
  { value: "Service", label: "Service", key: 1 },
  { value: "All", label: "All", key: 10 },
  { value: "Endpoint", label: "Endpoint", key: 3 },
  { value: "ServiceInstance", label: "Service Instance", key: 3 },
  { value: "ServiceRelation", label: "Service Relation", key: 2 },
  {
    value: "ServiceInstanceRelation",
    label: "Service Instance Relation",
    key: 4,
  },
  { value: "EndpointRelation", label: "Endpoint Relation", key: 4 },
  { value: "ProcessRelation", label: "Process Relation", key: 5 },
];
export const ListEntity: any = {
  InstanceList: EntityType[3].value,
  EndpointList: EntityType[2].value,
  ServiceList: EntityType[0].value,
};
export const SortOrder = [
  { label: "DES", value: "DES" },
  { label: "ASC", value: "ASC" },
];
export const AllTools = [
  { name: "playlist_add", content: "Add Widget", id: "addWidget" },
  { name: "all_inbox", content: "Add Tab", id: "addTab" },
  { name: "library_books", content: "Add Text", id: "addText" },
  { name: "device_hub", content: "Add Topology", id: "addTopology" },
  { name: "merge", content: "Add Trace", id: "addTrace" },
  { name: "assignment", content: "Add Log", id: "addLog" },
];
export const ServiceTools = [
  { name: "playlist_add", content: "Add Widget", id: "addWidget" },
  { name: "all_inbox", content: "Add Tab", id: "addTab" },
  { name: "library_books", content: "Add Text", id: "addText" },
  { name: "device_hub", content: "Add Topology", id: "addTopology" },
  { name: "merge", content: "Add Trace", id: "addTrace" },
  { name: "timeline", content: "Add Trace Profiling", id: "addProfile" },
  { name: "insert_chart", content: "Add eBPF Profiling", id: "addEbpf" },
  { name: "assignment", content: "Add Log", id: "addLog" },
  { name: "demand", content: "Add On Demand Log", id: "addDemandLog" },
  { name: "event", content: "Add Event", id: "addEvent" },
];
export const InstanceTools = [
  { name: "playlist_add", content: "Add Widget", id: "addWidget" },
  { name: "all_inbox", content: "Add Tab", id: "addTab" },
  { name: "library_books", content: "Add Text", id: "addText" },
  { name: "merge", content: "Add Trace", id: "addTrace" },
  { name: "assignment", content: "Add Log", id: "addLog" },
  { name: "demand", content: "Add On Demand Log", id: "addDemandLog" },
  { name: "event", content: "Add Event", id: "addEvent" },
  {
    name: "timeline",
    content: "Add Network Profiling",
    id: "addNetworkProfiling",
  },
];
export const EndpointTools = [
  { name: "playlist_add", content: "Add Widget", id: "addWidget" },
  { name: "all_inbox", content: "Add Tab", id: "addTab" },
  { name: "library_books", content: "Add Text", id: "addText" },
  { name: "device_hub", content: "Add Topology", id: "addTopology" },
  { name: "merge", content: "Add Trace", id: "addTrace" },
  { name: "assignment", content: "Add Log", id: "addLog" },
  { name: "event", content: "Add Event", id: "addEvent" },
];
export const ProcessTools = [
  { name: "playlist_add", content: "Add Widget", id: "addWidget" },
  { name: "all_inbox", content: "Add Tab", id: "addTab" },
  { name: "library_books", content: "Add Text", id: "addText" },
  { name: "time_range", content: "Add Time Range Text", id: "addTimeRange" },
];
export const ServiceRelationTools = [
  { name: "playlist_add", content: "Add Widget", id: "addWidget" },
  { name: "all_inbox", content: "Add Tab", id: "addTab" },
  { name: "library_books", content: "Add Text", id: "addText" },
  { name: "device_hub", content: "Add Topology", id: "addTopology" },
];

export const EndpointRelationTools = [
  { name: "playlist_add", content: "Add Widget", id: "addWidget" },
  { name: "all_inbox", content: "Add Tab", id: "addTab" },
  { name: "library_books", content: "Add Text", id: "addText" },
];
export const InstanceRelationTools = [
  { name: "playlist_add", content: "Add Widget", id: "addWidget" },
  { name: "all_inbox", content: "Add Tab", id: "addTab" },
  { name: "library_books", content: "Add Text", id: "addText" },
  { name: "device_hub", content: "Add Topology", id: "addTopology" },
];

export const ScopeType = [
  { value: "Service", label: "Service", key: 1 },
  { value: "Endpoint", label: "Endpoint", key: 3 },
  { value: "ServiceInstance", label: "Service Instance", key: 3 },
];
export const LegendConditions = [
  { label: "&&", value: "and" },
  { label: "||", value: "or" },
];
export const MetricConditions = [
  { label: ">", value: ">" },
  { label: "<", value: "<" },
];
export enum LegendOpt {
  NAME = "name",
  VALUE = "value",
  CONDITION = "condition",
}
export const DepthList = [1, 2, 3, 4, 5].map((item: number) => ({
  value: item,
  label: String(item),
}));
export const Status = [
  { label: "All", value: "ALL" },
  { label: "Success", value: "SUCCESS" },
  { label: "Error", value: "ERROR" },
];
export const QueryOrders = [
  { label: "Start Time", value: "BY_START_TIME" },
  { label: "Duration", value: "BY_DURATION" },
];
export const TextColors: { [key: string]: string } = {
  green: "#67C23A",
  blue: "#409EFF",
  red: "#F56C6C",
  grey: "#909399",
  white: "#fff",
  black: "#000",
  orange: "#E6A23C",
  purple: "#bf99f8",
};

export const CalculationOpts = [
  { label: "Percentage", value: "percentage" },
  { label: "Apdex", value: "apdex" },
  { label: "Avg-preview", value: "average" },
  { label: "Percentage + Avg-preview", value: "percentageAvg" },
  { label: "Apdex + Avg-preview", value: "apdexAvg" },
  { label: "Byte to KB", value: "byteToKB" },
  { label: "Byte to MB", value: "byteToMB" },
  { label: "Byte to GB", value: "byteToGB" },
  {
    label: "Milliseconds to YYYY-MM-DD HH:mm:ss",
    value: "convertMilliseconds",
  },
  { label: "Seconds to YYYY-MM-DD HH:mm:ss", value: "convertSeconds" },
  { label: "Precision is 2", value: "precision" },
  { label: "Milliseconds to seconds", value: "msTos" },
  { label: "Seconds to days", value: "secondToDay" },
  { label: "Nanoseconds to milliseconds", value: "nanosecondToMillisecond" },
];
