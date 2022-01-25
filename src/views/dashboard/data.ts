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

export const PodsChartTypes = ["EndpointList", "InstanceList"];

export const TableChartTypes = ["EndpointList", "InstanceList", "ServiceList"];

export const ChartTypes = [
  { label: "Bar", value: "Bar" },
  { label: "Line", value: "Line" },
  { label: "Area", value: "Area" },
  // { label: "Pie", value: "Pie" },
  { label: "Card", value: "Card" },
  { label: "Top List", value: "TopList" },
  { label: "Table", value: "Table" },
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
    showUint: true,
  },
  Table: {
    type: "Table",
    showTableValues: true,
    tableHeaderCol1: "",
    tableHeaderCol2: "",
  },
  TopList: {
    type: "TopList",
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
  },
  ServiceList: {
    type: "ServiceList",
    dashboardName: "",
    fontSize: 12,
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
  { value: "Endpoint", label: "Service Endpoint", key: 3 },
  { value: "ServiceInstance", label: "Service Instance", key: 3 },
  { value: "ServiceRelationClient", label: "Service Relation(client)", key: 2 },
  { value: "ServiceRelationServer", label: "Service Relation(server)", key: 2 },
  {
    value: "ServiceInstanceRelationClient",
    label: "Service Instance Relation(client)",
    key: 4,
  },
  {
    value: "ServiceInstanceRelationServer",
    label: "Service Instance Relation(server)",
    key: 4,
  },
  { value: "EndpointRelation", label: "Endpoint Relation", key: 4 },
];
export const TableEntity: any = {
  InstanceList: EntityType[3].value,
  EndpointList: EntityType[2].value,
  ServiceList: EntityType[0].value,
};
export const SortOrder = [
  { label: "DES", value: "DES" },
  { label: "ASC", value: "ASC" },
];
export const ToolIcons = [
  { name: "playlist_add", content: "Add Widget", id: "addWidget" },
  { name: "all_inbox", content: "Add Tab", id: "addTab" },
  // { name: "insert_image", content: "Add Image", id: "addImage" },
  { name: "save_alt", content: "Export", id: "export" },
  { name: "folder_open", content: "Import", id: "import" },
  { name: "settings", content: "Settings", id: "settings" },
  { name: "save", content: "Apply", id: "applay" },
];
