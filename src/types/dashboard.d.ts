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
  isRoot: boolean;
  name: string;
  isDefault: boolean;
  expressions?: string[];
  expressionsConfig?: MetricConfigOpt[];
};
export interface LayoutConfig {
  x: number;
  y: number;
  w: number;
  h: number;
  i: string;
  type: string;
  metricMode?: string;
  widget?: WidgetConfig;
  graph?: GraphConfig;
  metrics?: string[];
  expressions?: string[];
  metricTypes?: string[];
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
}
export type RelatedTrace = {
  duration: DurationTime;
  status: string;
  queryOrder: string;
  latency: boolean;
  enableRelate: boolean;
};

export type Filters = {
  dataIndex: number;
  sourceId: string;
  isRange?: boolean;
  duration?: {
    startTime: string;
    endTime: string;
  };
  traceId?: string;
  spanId?: string;
  segmentId?: string;
  id?: string;
  queryOrder?: string;
  status?: string;
};

export type MetricConfigOpt = {
  unit?: string;
  label?: string;
  calculation?: string;
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
}

export type GraphConfig =
  | BarConfig
  | LineConfig
  | CardConfig
  | TableConfig
  | EndpointListConfig
  | ServiceListConfig
  | InstanceListConfig
  | TopologyConfig;
export interface BarConfig {
  type?: string;
  showBackground?: boolean;
  legend?: LegendOptions;
}
export interface LineConfig extends AreaConfig {
  type?: string;
  smooth?: boolean;
  showSymbol?: boolean;
  step?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  smallTips?: boolean;
  showlabels?: boolean;
}

export interface AreaConfig {
  type?: string;
  opacity?: number;
  legend?: LegendOptions;
}

export interface CardConfig {
  type?: string;
  fontSize?: number;
  showUnit?: boolean;
  textAlign?: "center" | "right" | "left";
}

export interface TextConfig {
  fontSize: number;
  backgroundColor: string;
  textAlign: string;
  fontColor: string;
  content: string;
}

export interface TableConfig {
  type?: string;
  showTableValues: boolean;
  tableHeaderCol1: string;
  tableHeaderCol2: string;
}

export interface TopListConfig {
  type?: string;
  topN: number;
}

export interface ServiceListConfig {
  type?: string;
  dashboardName: string;
  fontSize: number;
  showGroup: boolean;
}

export interface InstanceListConfig {
  type?: string;
  dashboardName: string;
  fontSize: number;
}

export interface EndpointListConfig {
  type?: string;
  dashboardName: string;
  fontSize: number;
}

export interface TopologyConfig {
  type?: string;
  backgroundColor?: string;
  fontColor?: string;
  iconTheme?: boolean;
  content?: string;
  fontSize?: number;
  depth?: number;
  showDepth?: boolean;
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
};
