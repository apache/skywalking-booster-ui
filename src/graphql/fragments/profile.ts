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

export const CreateProfileTask = {
  variable: "$creationRequest: ProfileTaskCreationRequest",
  query: `
  task: createProfileTask(creationRequest: $creationRequest) {
    id
    errorReason
  }
  `,
};

export const GetProfileTaskList = {
  variable: "$endpointName: String, $serviceId: ID",
  query: `
  taskList: getProfileTaskList(endpointName: $endpointName, serviceId: $serviceId) {
    serviceId
    endpointName
    startTime
    duration
    minDurationThreshold
    dumpPeriod
    maxSamplingCount
    id
    logs {
      id
      instanceId
      instanceName
      operationType
      operationTime
    }
  }
  `,
};
export const GetProfileTaskSegmentList = {
  variable: "$taskID: ID!",
  query: `
  segmentList: getProfileTaskSegments(taskID: $taskID) {
    traceId
    instanceId
    instanceName
    endpointNames
    duration
    start
    spans {
      spanId
      parentSpanId
      segmentId
      refs {
        traceId
        parentSegmentId
        parentSpanId
        type
      }
      serviceCode
      serviceInstanceName
      startTime
      endTime
      endpointName
      type
      peer
      component
      isError
      layer
      tags {
        key value
      }
      logs {
        time
        data {
          key
          value
        }
      }
      profiled
    }
  }
  `,
};

export const GetProfileAnalyze = {
  variable: "$queries: [SegmentProfileAnalyzeQuery!]!",
  query: `
  analyze: getSegmentsProfileAnalyze(queries: $queries) {
    tip
    trees {
      elements {
        id
        parentId
        codeSignature
        duration
        durationChildExcluded
        count
      }
    }
  }
  `,
};
export const GetProfileTaskLogs = {
  variable: "$taskID: String",
  query: `
  taskLogs: getProfileTaskLogs(taskID: $taskID) {
    id
    instanceId
    instanceName
    operationTime
    operationType
  }
  `,
};
export const GetStrategyList = {
  variable: "$serviceId: ID!",
  query: `
  strategyList: queryContinuousProfilingServiceTargets(serviceId: $serviceId) {
    type
    checkItems {
      type
      threshold
      period
      count
      uriList
      uriRegex
    }
  }
  `,
};

export const EditStrategy = {
  variable: "$request: ContinuousProfilingPolicyCreation!",
  query: `
  strategy: setContinuousProfilingPolicy(request: $request) {
    errorReason
    status
  }
  `,
};
