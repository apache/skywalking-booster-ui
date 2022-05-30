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

export interface EBPFTaskCreationRequest {
  serviceId: string;
  processLabels: string[];
  startTime: number;
  duration: number;
  targetType: string;
}

export interface EBPFTaskList {
  taskId: string;
  serviceName: string;
  serviceId: string;
  processLabels: string[];
  taskStartTime: number;
  fixedTriggerDuration: number;
  targetType: string;
  createTime: number;
  triggerType: string;
}

export interface EBPFProfilingSchedule {
  scheduleId: string;
  taskId: string;
  process: Process;
  endTime: number;
  startTime: number;
}

export type Process = {
  id: string;
  name: string;
  serviceId: string;
  serviceName: string;
  instanceId: string;
  instanceName: string;
  agentId: string;
  detectType: string;
  attributes: { name: string; value: string }[];
  labels: string[];
};
export type StackElement = {
  id: string;
  originId: string;
  name: string;
  parentId: string;
  symbol: string;
  dumpCount: number;
  stackType: string;
  value: number;
  children?: StackElement[];
  rateOfRoot?: string;
  rateOfParent: string;
};
export type AnalyzationTrees = {
  id: string;
  parentId: string;
  symbol: string;
  dumpCount: number;
  stackType: string;
};
