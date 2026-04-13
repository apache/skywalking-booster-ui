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
import type { PprofTask, PprofTaskCreationRequest, PprofStackElement, PprofTaskProgress } from "@/types/pprof";
import { store } from "@/store";
import graphql from "@/graphql";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import type { Instance } from "@/types/selector";

interface PprofState {
  taskList: Array<PprofTask>;
  selectedTask: Nullable<PprofTask>;
  taskProgress: Nullable<PprofTaskProgress>;
  instances: Instance[];
  analyzeTrees: PprofStackElement[];
  loadingTree: boolean;
  loadingTasks: boolean;
}

export const pprofStore = defineStore({
  id: "pprof",
  state: (): PprofState => ({
    taskList: [],
    selectedTask: null,
    taskProgress: null,
    instances: [],
    analyzeTrees: [],
    loadingTree: false,
    loadingTasks: false,
  }),
  actions: {
    setSelectedTask(task: Nullable<PprofTask>) {
      this.selectedTask = task || {};
    },
    setAnalyzeTrees(tree: PprofStackElement[]) {
      this.analyzeTrees = tree;
    },
    async getTaskList() {
      const selectorStore = useSelectorStore();
      if (!selectorStore.currentService?.id) {
        return;
      }
      this.loadingTasks = true;
      const response = await graphql.query("getPprofTaskList").params({
        request: {
          serviceId: selectorStore.currentService?.id,
          limit: 10000,
        },
      });
      this.loadingTasks = false;
      if (response.errors) {
        return response;
      }
      this.taskList = response.data.pprofTaskList.tasks || [];
      this.selectedTask = this.taskList[0] || {};
      this.setAnalyzeTrees([]);
      this.setSelectedTask(this.selectedTask);
      if (!this.taskList.length) {
        return response;
      }
      return response;
    },
    async getTaskLogs(param: { taskId: string }) {
      const response = await graphql.query("getPprofTaskProcess").params(param);
      if (response.errors) {
        return response;
      }
      this.taskProgress = response.data.taskProgress;
      return response;
    },
    async getServiceInstances(param: { serviceId: string; isRelation?: boolean }) {
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
    async createTask(param: PprofTaskCreationRequest) {
      if (!param.serviceId) {
        return;
      }
      const response = await graphql.query("savePprofTask").params({ pprofTaskCreationRequest: param });
      if (response.errors) {
        return response;
      }
      this.getTaskList();
      return response;
    },
    async getPprofAnalyze(params: { taskId: string; instanceIds: Array<string> }) {
      if (!params.instanceIds.length) {
        this.analyzeTrees = [];
        return new Promise((resolve) => resolve({}));
      }
      this.loadingTree = true;
      const response = await graphql.query("getPprofAnalyze").params({ request: params });
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

export function usePprofStore() {
  return pprofStore(store);
}
