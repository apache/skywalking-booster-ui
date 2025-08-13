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
import { DurationTime } from "./app";
export type DashboardItem = {
  id?: string;
  entity: string;
  layer: string;
  isRoot?: boolean;
  name: string;
  isDefault?: boolean;
  expressions?: string[];
  expressionsConfig?: MetricConfigOpt[];
  path?: string;
};

export type NodeDashboard = {
  scope: string;
  dashboard: string;
};
export interface LayoutConfig {
  x: number;
  y: number;
  w: number;
  h: number;
  i: string;
  type: string;
  widget?: WidgetConfig;
  graph?: GraphConfig;
  expressions?: string[];
  typesOfMQE?: string[];
  children?: { name: string; children: LayoutConfig[]; expression?: string; enable?: boolean }[];
  activedTabIndex?: number;
  metricConfig?: MetricConfigOpt[];
  id?: string;
  associate?: { widgetId: string }[];
  eventAssociate?: boolean;
  filters?: Filters;
  relatedTrace?: RelatedTrace;
  subExpressions?: string[];
  subTypesOfMQE?: string[];
  valueRelatedDashboard?: string;
  legendMQE?: LegendMQE;
  linkDashboard?: string;
  nodeDashboard?: NodeDashboard[];
  linkServerExpressions?: string[];
  linkClientExpressions?: string[];
  nodeExpressions?: string[];
  description?: any;
  linkServerMetricConfig?: MetricConfigOpt[];
  linkClientMetricConfig?: MetricConfigOpt[];
  nodeMetricConfig?: MetricConfigOpt[];
  instanceDashboardName?: string;
  processDashboardName?: string;
}

type LegendMQE = {
  expression: string;
};

export type RelatedTrace = {
  duration: DurationTime;
  status: string;
  queryOrder: string;
  latency: boolean;
  enableRelate: boolean;
  refIdType: string;
};

export type FilterDuration = {
  startTime: string;
  endTime: string;
  step?: string;
};

export type Owner = {
  scope: string;
  serviceID: string;
  serviceInstanceID: string;
  endpointID: string;
};
export type TopListItem = {
  name: string;
  value: string;
  refId: string;
  owner: Owner;
};
export type TopListData = {
  [key: string]: TopListItem[];
};

export type Filters = {
  dataIndex?: number;
  sourceId?: string;
  isRange?: boolean;
  duration?: FilterDuration;
  traceId?: string;
  spanId?: string;
  segmentId?: string;
  id?: string;
  queryOrder?: string;
  status?: string;
  metricValue?: { label: string; data: string; value: string }[];
  owner?: Nullable<Owner>;
  isReadRecords?: boolean | undefined;
};

export type Series = {
  data: (number | string)[][];
  name: string;
};

export type FilterOption = {
  series: Series[];
  type: string;
  legend: LegendOptions;
};

export type AssociateProcessorProps = {
  filters: Filters;
  option: FilterOption;
  relatedTrace: RelatedTrace;
};

export type MetricConfigOpt = {
  unit?: string;
  label?: string;
  labelsIndex?: string;
  sortOrder?: string;
  topN?: number;
  index?: number;
  detailLabel?: string;
};

export interface WidgetConfig {
  name?: string;
  title?: string;
  tips?: string;
  url?: string;
  type?: string;
}

export type GraphConfig =
  | BarConfig
  | LineConfig
  | CardConfig
  | TableConfig
  | EndpointListConfig
  | ServiceListConfig
  | InstanceListConfig
  | TopologyConfig
  | TextConfig
  | TimeRangeConfig
  | TopListConfig;

export interface BaseConfig {
  type?: string;
  valueMappings?: { [key: string]: string };
  legend?: LegendOptions;
  dashboardName?: string;
}
export interface TimeRangeConfig extends BaseConfig {
  fontSize: number;
  backgroundColor: string;
  textAlign: string;
  fontColor: string;
  text: string;
}
export interface BarConfig extends BaseConfig {
  showBackground?: boolean;
  legend?: LegendOptions;
}
export interface LineConfig extends AreaConfig {
  smooth?: boolean;
  showSymbol?: boolean;
  step?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  smallTips?: boolean;
  showlabels?: boolean;
  noTooltips?: boolean;
}

export interface AreaConfig extends BaseConfig {
  opacity?: number;
  legend?: LegendOptions;
}

export interface CardConfig extends BaseConfig {
  fontSize?: number;
  showUnit?: boolean;
  textAlign?: "center" | "right" | "left";
  valueMappings?: { [key: string]: string };
}

export interface TextConfig extends BaseConfig {
  fontSize: number;
  backgroundColor: string;
  textAlign: string;
  fontColor: string;
  content: string;
  url: string;
}

export interface TableConfig extends BaseConfig {
  showTableValues: boolean;
  tableHeaderCol2: string;
}

export interface TopListConfig extends BaseConfig {
  topN: number;
  color: string;
}

export interface ServiceListConfig extends BaseConfig {
  dashboardName: string;
  fontSize: number;
  showGroup: boolean;
}

export interface InstanceListConfig extends BaseConfig {
  dashboardName: string;
  fontSize: number;
}

export interface EndpointListConfig extends BaseConfig {
  dashboardName: string;
  fontSize: number;
}

export interface TopologyConfig extends BaseConfig {
  backgroundColor?: string;
  fontColor?: string;
  iconTheme?: boolean;
  content?: string;
  fontSize?: number;
  depth?: number;
  showDepth?: boolean;
  showBackground?: boolean;
}
export type EventParams = {
  componentType: string;
  seriesType: string;
  seriesIndex: number;
  seriesName: string;
  name: string;
  dataIndex: number;
  data: Record<string, unknown>;
  dataType: string;
  value: number | number[];
  color: string;
};
export type LegendOptions = {
  show: boolean;
  total: boolean;
  min: boolean;
  max: boolean;
  mean: boolean;
  asTable: boolean;
  toTheRight: boolean;
  width: number;
  asSelector: boolean;
};
export type MetricsResults = {
  metric: { labels: MetricLabel[] };
  values: MetricValue[];
};
type MetricLabel = {
  key: string;
  value: string;
};
type MetricValue = {
  name: string;
  value: string;
  owner: Nullable<Owner>;
  refId: null | string;
};
