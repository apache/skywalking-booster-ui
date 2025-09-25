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

import type { DurationTime } from "./app";
export interface Trace {
  duration: number;
  isError: boolean;
  key: string;
  operationNames: string[];
  start: string;
  traceIds: Array<string | any>;
  segmentId: string;
  spans: Span[];
  endpointNames: string[];
  traceId: string;
  serviceCode: string;
  label: string;
  id: string;
  parentId: string;
}

export interface Span {
  endpointName: string;
  serviceCode: string;
  parentSpanId: number;
  segmentId: string;
  label?: string;
  layer: string;
  spanId: number;
  traceId: string;
  type: string;
  peer: string;
  component: string;
  isError: boolean;
  isBroken?: boolean;
  refs: Array<Ref>;
  startTime: number;
  endTime: number;
  duration?: number;
  dur?: number;
  children?: Span[];
  tags?: { value: string; key: string }[];
  logs?: LogRef[];
  parentSegmentId?: string;
  key?: string;
  serviceInstanceName?: string;
  attachedEvents?: SpanAttachedEvent[];
  level?: number;
  totalExec?: number;
  groupRef?: StatisticsGroupRef;
  maxTime?: number;
  minTime?: number;
  sumTime?: number;
  avgTime?: number;
  count?: number;
  profiled?: boolean;
}
export type Ref = {
  type?: string;
  parentSegmentId: string;
  parentSpanId: number;
  traceId: string;
};
export interface LogRef {
  time: number;
  data: { key: string; value: string }[];
}

export interface StatisticsSpan {
  groupRef: StatisticsGroupRef;
  maxTime: number;
  minTime: number;
  sumTime: number;
  avgTime: number;
  count: number;
}

export interface StatisticsGroupRef {
  endpointName: string;
  type: string;
}

export interface TraceTreeRef {
  segmentMap: Map<string, Span>;
  segmentIdGroup: string[];
}

type Instant = {
  seconds: number;
  nanos: number;
};
type KeyValue = {
  key: string;
  value: string | number;
};
export interface SpanAttachedEvent {
  startTime: Instant;
  endTime: Instant;
  event: string;
  tags: KeyValue[];
  summary: KeyValue[];
}

export interface TraceCondition {
  queryDuration: DurationTime;
  traceState: string;
  queryOrder: string;
  paging: { pageNum: number; pageSize: number };
}
