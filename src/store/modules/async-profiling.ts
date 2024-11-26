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
import { defineStore } from "pinia";
import type { Option } from "@/types/app";
import type {
  AsyncProfilingTask,
  AsyncProfileTaskCreationRequest,
  AsyncProfilerStackElement,
  AsyncProfilerTaskProgress,
} from "@/types/async-profiling";
import { store } from "@/store";
import graphql from "@/graphql";
import { useAppStoreWithOut } from "@/store/modules/app";
import type { AxiosResponse } from "axios";
import type { Instance } from "@/types/selector";

interface AsyncProfilingState {
  taskList: Array<Recordable<AsyncProfilingTask>>;
  labels: Option[];
  asyncProfilingTips: string;
  selectedTask: Recordable<AsyncProfilingTask>;
  taskProgress: Recordable<AsyncProfilerTaskProgress>;
  instances: Instance[];
  analyzeTrees: AsyncProfilerStackElement[];
}

export const asyncProfilingStore = defineStore({
  id: "asyncProfiling",
  state: (): AsyncProfilingState => ({
    taskList: [],
    labels: [{ value: "", label: "" }],
    asyncProfilingTips: "",
    selectedTask: {},
    taskProgress: {},
    instances: [],
    analyzeTrees: [],
  }),
  actions: {
    setSelectedTask(task: Recordable<AsyncProfilingTask>) {
      this.selectedTask = task || {};
    },
    async getTaskList(params: { serviceId: string; startTime: number; endTime: number }) {
      if (!params.serviceId) {
        return new Promise((resolve) => resolve({}));
      }
      const res: AxiosResponse = await graphql
        .query("getAsyncTaskList")
        .params({ request: { ...params, limit: 10000 } });

      this.asyncProfilingTips = "";
      if (res.data.errors) {
        return res.data;
      }
      this.taskList = res.data.data.asyncTaskList.tasks || [];
      this.selectedTask = this.taskList[0] || {};
      this.setSelectedTask(this.selectedTask);
      if (!this.taskList.length) {
        return res.data;
      }
      return res.data;
    },
    async getTaskLogs(param: { taskID: string }) {
      const res: AxiosResponse = await graphql.query("getAsyncProfileTaskProcess").params(param);

      if (res.data.errors) {
        return res.data;
      }
      this.taskProgress = res.data.data.taskProgress;
      return res.data;
    },
    async getServiceInstances(param: { serviceId: string; isRelation: boolean }): Promise<Nullable<AxiosResponse>> {
      if (!param.serviceId) {
        return null;
      }
      const res: AxiosResponse = await graphql.query("queryInstances").params({
        serviceId: param.serviceId,
        duration: useAppStoreWithOut().durationTime,
      });
      if (!res.data.errors) {
        this.instances = res.data.data.pods || [];
      }
      return res.data;
    },
    async createTask(param: AsyncProfileTaskCreationRequest) {
      const res: AxiosResponse = await graphql
        .query("saveAsyncProfileTask")
        .params({ asyncProfilerTaskCreationRequest: param });

      if (res.data.errors) {
        return res.data;
      }
      this.getTaskList();
      return res.data;
    },
    async getAsyncProfilingAnalyze(params: { taskId: string; instanceIds: Array<string>; eventType: string }) {
      if (!params.instanceIds.length) {
        return new Promise((resolve) => resolve({}));
      }
      const res: AxiosResponse = await graphql.query("GetAsyncProfileAnalyze").params(params);

      if (res.data.errors) {
        this.analyzeTrees = [];
        return res.data;
      }
      const { analysisResult } = res.data.data;
      if (!analysisResult) {
        this.analyzeTrees = [];
        return res.data;
      }
      if (analysisResult.tip) {
        this.analyzeTrees = [];
        return res.data;
      }
      this.analyzeTrees = analysisResult.elements;
      return res.data;
    },
  },
});

export function useAsyncProfilingStore(): Recordable {
  return asyncProfilingStore(store);
}
