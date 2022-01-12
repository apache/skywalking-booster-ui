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
export const ChartTypes = [
  { label: "Bar", value: "Bar" },
  { label: "Line", value: "Line" },
  { label: "Area", value: "Area" },
  { label: "Heatmap", value: "Heatmap" },
  { label: "Pie", value: "Pie" },
  { label: "Card", value: "Card" },
  { label: "Top List", value: "TopList" },
  { label: "Table", value: "Table" },
  { label: "Endpoint List", value: "EndpointList" },
  { label: "Instance List", value: "InstanceList" },
  // { label: "Image", value: "Image" },
];
export const DefaultGraphConfig: { [key: string]: any } = {
  Bar: {
    type: "Bar",
    showBackground: true,
    barWidth: 30,
  },
  Line: {
    type: "Line",
    step: false,
    smooth: false,
    showSymbol: false,
  },
  Area: {
    type: "Area",
    opacity: 0.4,
  },
};

export enum MetricQueryTypes {
  ReadMetricsValue = "readMetricsValue",
  ReadMetricsValues = "readMetricsValues",
  SortMetrics = "sortMetrics",
  ReadLabeledMetricsValues = "readLabeledMetricsValues",
  READHEATMAP = "readHeatMap",
  ReadSampledRecords = "readSampledRecords",
}
export enum MetricsType {
  UNKNOWN = "UNKNOWN",
  REGULAR_VALUE = "REGULAR_VALUE",
  LABELED_VALUE = "LABELED_VALUE",
  HEATMAP = "HEATMAP",
  SAMPLED_RECORD = "SAMPLED_RECORD",
}
export const ValuesTypes: {
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
export const MetricChartType: { [key: string]: string } = {
  readMetricsValue: "ChartNum",
  readMetricsValues: "ChartLine",
  sortMetrics: "ChartSlow",
  readLabeledMetricsValues: "ChartLine",
  readHeatMap: "ChartHeatmap",
  readSampledRecords: "ChartSlow",
};
export const CalculationType = [
  { label: "Plus", value: "+" },
  { label: "Minus", value: "-" },
  { label: "Multiplication", value: "*" },
  { label: "Division", value: "/" },
  { label: "Convert Unix Timestamp(milliseconds)", value: "milliseconds" },
  { label: "Convert Unix Timestamp(seconds)", value: "seconds" },
];
export const ReadValueChartType = [
  { value: "ChartNum", label: "Digital Card" },
  { value: "ChartSlow", label: "Slow Chart" },
];

export const MaxItemNum = 10;

export enum MetricsName {
  SERVICE_RESP_TIME = "service_resp_time",
  SERVICE_SLA = "service_sla",
  SERVICE_CPM = "service_cpm",
  SERVICE_PERCENTILE = "service_percentile",
  SERVICE_APDEX = "service_apdex",
}
export const EntityType = [
  { value: "service", label: "Service", key: 1 },
  { value: "all", label: "All", key: 10 },
  { value: "endpoint", label: "Service Endpoint", key: 3 },
  { value: "serviceInstance", label: "Service Instance", key: 3 },
  { value: "serviceRelationClient", label: "Service Relation(client)", key: 2 },
  { value: "serviceRelationServer", label: "Service Relation(server)", key: 2 },
  {
    value: "serviceInstanceRelationClient",
    label: "Service Instance Relation(client)",
    key: 4,
  },
  {
    value: "serviceInstanceRelationServer",
    label: "Service Instance Relation(server)",
    key: 4,
  },
  { value: "endpointRelation", label: "Endpoint Relation", key: 4 },
];
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
export const Options = [
  {
    value: "Option1",
    label: "Option1",
  },
  {
    value: "Option2",
    label: "Option2",
  },
  {
    value: "Option3",
    label: "Option3",
  },
  {
    value: "Option4",
    label: "Option4",
  },
  {
    value: "Option5",
    label: "Option5",
  },
];
export const SelectOpts = [
  {
    value: "guide",
    label: "Guide",
    children: [
      {
        value: "disciplines",
        label: "Disciplines",
        children: [
          {
            value: "consistency",
            label: "Consistency",
          },
          {
            value: "feedback",
            label: "Feedback",
          },
          {
            value: "efficiency",
            label: "Efficiency",
          },
          {
            value: "controllability",
            label: "Controllability",
          },
        ],
      },
      {
        value: "navigation",
        label: "Navigation",
        children: [
          {
            value: "side nav",
            label: "Side Navigation",
          },
          {
            value: "top nav",
            label: "Top Navigation",
          },
        ],
      },
    ],
  },
];
