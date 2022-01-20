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
export interface LayoutConfig {
  x: number;
  y: number;
  w: number;
  h: number;
  i: string;
  widget: WidgetConfig;
  graph: GraphConfig;
  standard: StandardConfig;
  metrics: string[];
  type: string;
  metricTypes: string[];
  children?: any;
}

export interface WidgetConfig {
  title?: string;
  tips?: string;
}

export interface StandardConfig {
  sortOrder?: string;
  unit?: string;
  max?: string;
  min?: string;
  plus?: string;
  minus?: string;
  multiply?: string;
  divide?: string;
  milliseconds?: string;
  seconds?: string;
  maxItemNum?: number;
}

export type GraphConfig =
  | BarConfig
  | LineConfig
  | CardConfig
  | TableConfig
  | EndpointListConfig
  | ServiceListConfig
  | InstanceListConfig;
export interface BarConfig {
  type?: string;
  showBackground?: boolean;
}
export interface LineConfig extends AreaConfig {
  type?: string;
  smooth?: boolean;
  showSymbol?: boolean;
  step?: boolean;
}

export interface AreaConfig {
  type?: string;
  opacity?: number;
}

export interface CardConfig {
  type?: string;
  fontSize?: number;
  showUint: boolean;
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
