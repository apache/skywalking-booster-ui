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
import type {
  AsyncProfilingTask,
  AsyncProfileTaskCreationRequest,
  AsyncProfilerStackElement,
  AsyncProfilerTaskProgress,
} from "@/types/async-profiling";
import { store } from "@/store";
import graphql from "@/graphql";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import type { Instance } from "@/types/selector";

interface AsyncProfilingState {
  taskList: Array<Recordable<AsyncProfilingTask>>;
  selectedTask: Recordable<AsyncProfilingTask>;
  taskProgress: Recordable<AsyncProfilerTaskProgress>;
  instances: Instance[];
  analyzeTrees: AsyncProfilerStackElement[];
  loadingTree: boolean;
  loadingTasks: boolean;
}

export const asyncProfilingStore = defineStore({
  id: "asyncProfiling",
  state: (): AsyncProfilingState => ({
    taskList: [],
    selectedTask: {},
    taskProgress: {},
    instances: [],
    analyzeTrees: [],
    loadingTree: false,
    loadingTasks: false,
  }),
  actions: {
    setSelectedTask(task: Recordable<AsyncProfilingTask>) {
      this.selectedTask = task || {};
    },
    setAnalyzeTrees(tree: AsyncProfilerStackElement[]) {
      this.analyzeTrees = tree;
    },
    async getTaskList() {
      const selectorStore = useSelectorStore();
      this.loadingTasks = true;
      const response = await graphql.query("getAsyncTaskList").params({
        request: {
          serviceId: selectorStore.currentService.id,
          limit: 10000,
        },
      });
      this.loadingTasks = false;
      if (response.errors) {
        return response;
      }
      this.taskList = response.data.asyncTaskList.tasks || [];
      this.selectedTask = this.taskList[0] || {};
      this.setAnalyzeTrees([]);
      this.setSelectedTask(this.selectedTask);
      if (!this.taskList.length) {
        return response;
      }
      return response;
    },
    async getTaskLogs(param: { taskID: string }) {
      const response = await graphql.query("getAsyncProfileTaskProcess").params(param);

      if (response.errors) {
        return response;
      }
      this.taskProgress = response.data.taskProgress;
      return response;
    },
    async getServiceInstances(param: { serviceId: string; isRelation: boolean }) {
      if (!param.serviceId) {
        return null;
      }
      const response = await graphql.query("queryInstances").params({
        serviceId: param.serviceId,
        duration: useAppStoreWithOut().durationTime,
      });
      if (!response.errors) {
        this.instances = (response.data.pods || []).map((d: Instance) => {
          d.value = d.id || "";
          return d;
        });
      }
      return response;
    },
    async createTask(param: AsyncProfileTaskCreationRequest) {
      const response = await graphql.query("saveAsyncProfileTask").params({ asyncProfilerTaskCreationRequest: param });

      if (response.errors) {
        return response;
      }
      this.getTaskList();
      return response;
    },
    async getAsyncProfilingAnalyze(params: { taskId: string; instanceIds: Array<string>; eventType: string }) {
      if (!params.instanceIds.length) {
        return new Promise((resolve) => resolve({}));
      }
      this.loadingTree = true;
      const response = await graphql.query("getAsyncProfileAnalyze").params({ request: params });
      this.loadingTree = false;
      if (response.errors) {
        this.analyzeTrees = [];
        return response;
      }
      const { analysisResult } = response.data;
      if (!analysisResult) {
        this.analyzeTrees = [];
        return response;
      }
      this.analyzeTrees = [analysisResult.tree];
      return response;
    },
  },
});

export function useAsyncProfilingStore(): Recordable {
  return asyncProfilingStore(store);
}
