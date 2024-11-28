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

export type AsyncProfilingTask = {
  id: string;
  serviceId: string;
  serviceInstanceIds: string[];
  createTime: number;
  events: string;
  duration: number;
  execArgs: string;
};

export type AsyncProfileTaskCreationRequest = {
  serviceId: string;
  serviceInstanceIds: string[];
  duration: number;
  events: string[];
  execArgs: string;
};

export type AsyncProfilerStackElement = {
  id: string;
  parentId: string;
  codeSignature: string;
  total: number;
  self: number;
};

export type AsyncProfilerTaskProgress = {
  errorInstanceIds: string[];
  successInstanceIds: string[];
  logs: AsyncProfilerTaskLog[];
};

type AsyncProfilerTaskLog = {
  id: string;
  instanceId: string;
  instanceName: string;
  operationType: string;
  operationTime: number;
};

export type StackElement = {
  id: string;
  originId: string;
  name: string;
  parentId: string;
  codeSignature: string;
  total: number;
  self: number;
  value: number;
  children?: StackElement[];
};
