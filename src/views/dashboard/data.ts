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
  readRecords: [{ label: "Top List", value: "TopList" }],
};
export enum ProtocolTypes {
  ReadRecords = "readRecords",
  ReadSampledRecords = "readSampledRecords",
  SortMetrics = "sortMetrics",
  ReadLabeledMetricsValues = "readLabeledMetricsValues",
  ReadHeatMap = "readHeatMap",
  ReadMetricsValues = "readMetricsValues",
  ReadMetricsValue = "readMetricsValue",
}

export enum ExpressionResultType {
  UNKNOWN = "UNKNOWN",
  SINGLE_VALUE = "SINGLE_VALUE",
  TIME_SERIES_VALUES = "TIME_SERIES_VALUES",
  SORTED_LIST = "SORTED_LIST",
  RECORD_LIST = "RECORD_LIST",
}

export const DefaultGraphConfig: { [key: string]: any } = {
  Bar: {
    type: "Bar",
    showBackground: true,
  },
  Line: {
    type: "Line",
    step: false,
    smooth: false,
    showSymbol: true,
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
  HEATMAP: [{ label: "read heatmap values in the duration", value: "readHeatMap" }],
  SAMPLED_RECORD: [{ label: "get sorted topN values", value: "readRecords" }],
};

export enum MetricCatalog {
  SERVICE = "Service",
  SERVICE_INSTANCE = "ServiceInstance",
  ENDPOINT = "Endpoint",
  ALL = "All",
  SERVICE_RELATION = "ServiceRelation",
  SERVICE_INSTANCE_RELATION = "ServiceInstanceRelation",
  ENDPOINT_RELATION = "EndpointRelation",
  Process = "Process",
  PROCESS_RELATION = "ProcessRelation",
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
  { value: "Process", label: "Process", key: 6 },
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
export enum WidgetType {
  Widget = "Widget",
  Topology = "Topology",
  Tab = "Tab",
  Text = "Text",
  TimeRange = "TimeRange",
  Trace = "Trace",
  Log = "Log",
  Profile = "Profile",
  Ebpf = "Ebpf",
  DemandLog = "DemandLog",
  Event = "Event",
  NetworkProfiling = "NetworkProfiling",
  ContinuousProfiling = "ContinuousProfiling",
  ThirdPartyApp = "ThirdPartyApp",
  TaskTimeline = "TaskTimeline",
}
export const AllTools = [
  { name: "playlist_add", content: "Add Widget", id: WidgetType.Widget },
  { name: "all_inbox", content: "Add Tabs", id: WidgetType.Tab },
  { name: "library_books", content: "Add Text", id: WidgetType.Text },
  { name: "device_hub", content: "Add Topology", id: WidgetType.Topology },
  { name: "merge", content: "Add Trace", id: WidgetType.Trace },
  { name: "assignment", content: "Add Log", id: WidgetType.Log },
  { name: "add_iframe", content: "Add Iframe", id: WidgetType.ThirdPartyApp },
];
export const ServiceTools = [
  { name: "playlist_add", content: "Add Widget", id: WidgetType.Widget },
  { name: "all_inbox", content: "Add Tabs", id: WidgetType.Tab },
  { name: "library_books", content: "Add Text", id: WidgetType.Text },
  { name: "device_hub", content: "Add Topology", id: WidgetType.Topology },
  { name: "merge", content: "Add Trace", id: WidgetType.Trace },
  { name: "timeline", content: "Add Trace Profiling", id: WidgetType.Profile },
  { name: "insert_chart", content: "Add eBPF Profiling", id: WidgetType.Ebpf },
  { name: "continuous_profiling", content: "Add Continuous Profiling", id: WidgetType.ContinuousProfiling },
  { name: "assignment", content: "Add Log", id: WidgetType.Log },
  { name: "demand", content: "Add On Demand Log", id: WidgetType.DemandLog },
  { name: "event", content: "Add Event", id: WidgetType.Event },
  { name: "add_iframe", content: "Add Iframe", id: WidgetType.ThirdPartyApp },
];
export const InstanceTools = [
  { name: "playlist_add", content: "Add Widget", id: WidgetType.Widget },
  { name: "all_inbox", content: "Add Tabs", id: WidgetType.Tab },
  { name: "library_books", content: "Add Text", id: WidgetType.Text },
  { name: "merge", content: "Add Trace", id: WidgetType.Trace },
  { name: "assignment", content: "Add Log", id: WidgetType.Log },
  { name: "demand", content: "Add On Demand Log", id: WidgetType.DemandLog },
  { name: "event", content: "Add Event", id: WidgetType.Event },
  { name: "add_iframe", content: "Add Iframe", id: WidgetType.ThirdPartyApp },
  {
    name: "timeline",
    content: "Add Network Profiling",
    id: WidgetType.NetworkProfiling,
  },
];
export const EndpointTools = [
  { name: "playlist_add", content: "Add Widget", id: WidgetType.Widget },
  { name: "all_inbox", content: "Add Tabs", id: WidgetType.Tab },
  { name: "library_books", content: "Add Text", id: WidgetType.Text },
  { name: "device_hub", content: "Add Topology", id: WidgetType.Topology },
  { name: "merge", content: "Add Trace", id: WidgetType.Trace },
  { name: "assignment", content: "Add Log", id: WidgetType.Log },
  { name: "event", content: "Add Event", id: WidgetType.Event },
  { name: "add_iframe", content: "Add Iframe", id: WidgetType.ThirdPartyApp },
];
export const ProcessTools = [
  { name: "playlist_add", content: "Add Widget", id: WidgetType.Widget },
  { name: "all_inbox", content: "Add Tabs", id: WidgetType.Tab },
  { name: "task_timeline", content: "Add Task Timeline", id: WidgetType.TaskTimeline },
  { name: "library_books", content: "Add Text", id: WidgetType.Text },
  { name: "add_iframe", content: "Add Iframe", id: WidgetType.ThirdPartyApp },
];
export const ProcessRelationTools = [
  { name: "playlist_add", content: "Add Widget", id: WidgetType.Widget },
  { name: "all_inbox", content: "Add Tabs", id: WidgetType.Tab },
  { name: "library_books", content: "Add Text", id: WidgetType.Text },
  { name: "add_iframe", content: "Add Iframe", id: WidgetType.ThirdPartyApp },
];
export const ServiceRelationTools = [
  { name: "playlist_add", content: "Add Widget", id: WidgetType.Widget },
  { name: "all_inbox", content: "Add Tabs", id: WidgetType.Tab },
  { name: "library_books", content: "Add Text", id: WidgetType.Text },
  { name: "device_hub", content: "Add Topology", id: WidgetType.Topology },
  { name: "add_iframe", content: "Add Iframe", id: WidgetType.ThirdPartyApp },
];

export const EndpointRelationTools = [
  { name: "playlist_add", content: "Add Widget", id: WidgetType.Widget },
  { name: "all_inbox", content: "Add Tabs", id: WidgetType.Tab },
  { name: "library_books", content: "Add Text", id: WidgetType.Text },
  { name: "add_iframe", content: "Add Iframe", id: WidgetType.ThirdPartyApp },
];
export const InstanceRelationTools = [
  { name: "playlist_add", content: "Add Widget", id: WidgetType.Widget },
  { name: "all_inbox", content: "Add Tabs", id: WidgetType.Tab },
  { name: "library_books", content: "Add Text", id: WidgetType.Text },
  { name: "device_hub", content: "Add Topology", id: WidgetType.Topology },
  { name: "add_iframe", content: "Add Iframe", id: WidgetType.ThirdPartyApp },
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
  grey: "#809399",
  white: "#fff",
  black: "#303133",
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
  { label: "Milliseconds to seconds", value: "msTos" },
  { label: "Seconds to days", value: "secondToDay" },
  { label: "Nanoseconds to milliseconds", value: "nanosecondToMillisecond" },
];
export const RefIdTypes = [
  { label: "Trace ID", value: "traceId" },
  { label: "None", value: "none" },
];
export const RefreshOptions = [
  { label: "Last 30 minutes", value: "30", step: "MINUTE" },
  { label: "Last 8 hours", value: "8", step: "HOUR" },
  { label: "Last 7 days", value: "7", step: "DAY" },
];

export enum MetricModes {
  Expression = "Expression",
  General = "General",
}
export enum CallTypes {
  Server = "SERVER",
  Client = "CLIENT",
}
export enum ConfigFieldTypes {
  ISDEFAULT = "ISDEFAULT",
  NAME = "NAME",
}
