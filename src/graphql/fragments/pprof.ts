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

export const GetPprofTaskList = {
  variable: "$request: PprofTaskListRequest!",
  query: `
  pprofTaskList: queryPprofTaskList(request: $request) {
    errorReason
    tasks {
      id
      serviceId
      serviceInstanceIds
      createTime
      events
      duration
      dumpPeriod
    }
  }
  `,
};

export const GetPprofTaskProcess = {
  variable: "$taskId: String!",
  query: `
  taskProgress: queryPprofTaskProgress(taskId: $taskId) {
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

export const CreatePprofTask = {
  variable: "$pprofTaskCreationRequest: PprofTaskCreationRequest!",
  query: `
  task: createPprofTask(pprofTaskCreationRequest: $pprofTaskCreationRequest) {
    id
    errorReason
    code
  }
  `,
};

export const GetPprofAnalyze = {
  variable: "$request: PprofAnalyzationRequest!",
  query: `
  analysisResult: queryPprofAnalyze(request: $request) {
    tree {
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
