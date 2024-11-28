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

export const GetAsyncTaskList = {
  variable: "$request: AsyncProfilerTaskListRequest!",
  query: `
  asyncTaskList: queryAsyncProfilerTaskList(request: $request) {
    errorReason
    tasks {
      id
      serviceId
      serviceInstanceIds
      createTime
      events
      duration
      execArgs
    }
  }
  `,
};

export const GetAsyncProfileTaskProcess = {
  variable: "$taskId: String!",
  query: `
  taskProgress: queryAsyncProfilerTaskProgress(taskId: $taskId) {
    logs {
      id
      instanceId
      instanceName
      operationType
      operationTime
    }
    errorInstanceIds
    successInstanceIds
  }
  `,
};

export const CreateAsyncProfileTask = {
  variable: "$asyncProfilerTaskCreationRequest: AsyncProfilerTaskCreationRequest!",
  query: `
  task: createAsyncProfilerTask(asyncProfilerTaskCreationRequest: $asyncProfilerTaskCreationRequest) {
    id
    errorReason
    code
  }
  `,
};

export const GetAsyncProfileAnalyze = {
  variable: "$request: AsyncProfilerAnalyzationRequest!",
  query: `
  analysisResult: queryAsyncProfilerAnalyze(request: $request) {
    tree {
      type
      elements {
        id
        parentId
        symbol: codeSignature
        dumpCount: total
        self
      }
    }
  }
  `,
};
