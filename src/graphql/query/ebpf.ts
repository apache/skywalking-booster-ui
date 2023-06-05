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

import {
  queryCreateTaskData,
  createEBPFTask,
  queryEBPFTasks,
  queryEBPFSchedules,
  analysisEBPFResult,
  createNetworkProfiling,
  keepNetworkProfiling,
  monitoringInstances,
} from "../fragments/ebpf";

export const getCreateTaskData = `query queryCreateTaskData(${queryCreateTaskData.variable}) {${queryCreateTaskData.query}}`;

export const saveEBPFTask = `mutation createEBPFTask(${createEBPFTask.variable}) {${createEBPFTask.query}}`;

export const getEBPFTasks = `query queryEBPFTasks(${queryEBPFTasks.variable}) {${queryEBPFTasks.query}}`;

export const getEBPFSchedules = `query queryEBPFSchedules(${queryEBPFSchedules.variable}) {${queryEBPFSchedules.query}}`;

export const getEBPFResult = `query analysisEBPFResult(${analysisEBPFResult.variable}) {${analysisEBPFResult.query}}`;

export const newNetworkProfiling = `mutation createNetworkProfiling(${createNetworkProfiling.variable}) {${createNetworkProfiling.query}}`;

export const aliveNetworkProfiling = `mutation keepNetworkProfiling(${keepNetworkProfiling.variable}) {${keepNetworkProfiling.query}}`;

export const getMonitoringInstances = `query continuousProfilingMonitoringInstances(${monitoringInstances.variable}) {${monitoringInstances.query}}`;
