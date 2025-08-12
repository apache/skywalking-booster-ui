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
import type { Span } from "./trace";

type ProfileStackElement = {
  id: string;
  parentId: string;
  codeSignature: string;
  duration: number;
  durationChildExcluded: number;
  count: number;
};
export type ProfileAnalyzationTrees = { elements: ProfileStackElement[] }[];
export interface TaskLog {
  id: string;
  instanceId: string;
  instanceName: string;
  operationTime: number;
  operationType: string;
}
export interface TaskListItem {
  id: string;
  serviceId: string;
  serviceName: string;
  endpointName: string;
  startTime: number;
  duration: number;
  minDurationThreshold: number;
  dumpPeriod: number;
  maxSamplingCount: number;
  logs: TaskLog[];
  errorInstanceIds: string[];
  successInstanceIds: string[];
  serviceInstanceIds: string[];
}
export type SegmentSpan = Span;

export interface ProfileTaskCreationRequest {
  serviceId: string;
  endpointName: string;
  startTime: number;
  duration: number;
  minDurationThreshold: number;
  dumpPeriod: number;
  maxSamplingCount: number;
}
export type ProfileTimeRange = { start: number; end: number };

export type ProfileAnalyzeParams = { segmentId: string; timeRange: ProfileTimeRange };
