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

export const queryCreateTaskData = {
  variable: "$serviceId: ID!",
  query: `
  createTaskData: queryPrepareCreateEBPFProfilingTaskData(serviceId: $serviceId) {
    couldProfiling
    processLabels
    }`,
};
export const createEBPFTask = {
  variable: "$request: EBPFProfilingTaskFixedTimeCreationRequest!",
  query: `
  createTaskData: createEBPFProfilingFixedTimeTask(request: $request) {
    status
    errorReason
    id
  }`,
};
export const queryEBPFTasks = {
  variable:
    "$serviceId: ID, $serviceInstanceId: ID, $targets: [EBPFProfilingTargetType!], $triggerType: EBPFProfilingTriggerType",
  query: `
  queryEBPFTasks: queryEBPFProfilingTasks(serviceId: $serviceId, serviceInstanceId: $serviceInstanceId, targets: $targets, triggerType: $triggerType) {
    taskId
    serviceName
    serviceId
    serviceInstanceId
    serviceInstanceName
    processLabels
    processName
    processId
    taskStartTime
    triggerType
    fixedTriggerDuration
    targetType
    createTime
    continuousProfilingCauses {
      type
      singleValue {
        threshold
        current
      }
      uri {
        uriRegex
        uriPath
        threshold
        current
      }
      message
    }
  }`,
};
export const queryEBPFSchedules = {
  variable: "$taskId: ID!",
  query: `
  eBPFSchedules: queryEBPFProfilingSchedules(taskId: $taskId) {
    scheduleId
    taskId
    process {
      id
      name
      serviceId
      serviceName
      instanceId
      instanceName
      agentId
      detectType
      attributes {
        name
        value
      }
      labels
    }
    startTime
    endTime
  }`,
};

export const analysisEBPFResult = {
  variable:
    "$scheduleIdList: [ID!]!, $timeRanges: [EBPFProfilingAnalyzeTimeRange!]!, $aggregateType: EBPFProfilingAnalyzeAggregateType",
  query: `
  analysisEBPFResult: analysisEBPFProfilingResult(scheduleIdList: $scheduleIdList, timeRanges: $timeRanges, aggregateType: $aggregateType) {
    tip
    trees {
      elements {
        id
        parentId
        symbol
        stackType
        dumpCount
      }
    }
  }`,
};

export const createNetworkProfiling = {
  variable: "$request: EBPFProfilingNetworkTaskRequest!",
  query: `
  createEBPFNetworkProfiling(request: $request) {
    status
    errorReason
    id
  }`,
};

export const keepNetworkProfiling = {
  variable: "$taskId: ID!",
  query: `
  keepEBPFNetworkProfiling(taskId: $taskId) {
    status
    errorReason
  }`,
};

export const monitoringInstances = {
  variable: "$serviceId: ID!, $target: ContinuousProfilingTargetType!",
  query: `
  instances: queryContinuousProfilingMonitoringInstances(serviceId: $serviceId, target: $target) {
    id
    name
    attributes {
      name
      value
    }
    triggeredCount
    lastTriggerTimestamp
    processes {
      id
      name
      detectType
      labels
      lastTriggerTimestamp
      triggeredCount
    }
  }`,
};
