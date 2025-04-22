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
import type { EBPFTaskCreationRequest, EBPFProfilingSchedule, EBPFTaskList, AnalyzationTrees } from "@/types/ebpf";
import { store } from "@/store";
import graphql from "@/graphql";
import { EBPFProfilingTriggerType } from "../data";
interface EbpfState {
  taskList: Array<Recordable<EBPFTaskList>>;
  eBPFSchedules: EBPFProfilingSchedule[];
  currentSchedule: EBPFProfilingSchedule | Record<string, never>;
  analyzeTrees: AnalyzationTrees[];
  labels: Option[];
  couldProfiling: boolean;
  ebpfTips: string;
  selectedTask: Recordable<EBPFTaskList>;
  aggregateType: string;
}

export const ebpfStore = defineStore({
  id: "eBPF",
  state: (): EbpfState => ({
    taskList: [],
    eBPFSchedules: [],
    currentSchedule: {},
    analyzeTrees: [],
    labels: [{ value: "", label: "" }],
    couldProfiling: false,
    ebpfTips: "",
    selectedTask: {},
    aggregateType: "COUNT",
  }),
  actions: {
    setSelectedTask(task: Recordable<EBPFTaskList>) {
      this.selectedTask = task || {};
    },
    setCurrentSchedule(s: EBPFProfilingSchedule) {
      this.currentSchedule = s;
    },
    setAnalyzeTrees(tree: AnalyzationTrees[]) {
      this.analyzeTrees = tree;
    },
    async getCreateTaskData(serviceId: string) {
      const response = await graphql.query("getCreateTaskData").params({ serviceId });

      if (response.errors) {
        return response;
      }
      const json = response.data.createTaskData;
      this.couldProfiling = json.couldProfiling || false;
      this.labels = json.processLabels.map((d: string) => {
        return { label: d, value: d };
      });
      return response;
    },
    async createTask(param: EBPFTaskCreationRequest) {
      const response = await graphql.query("saveEBPFTask").params({ request: param });

      if (response.errors) {
        return response;
      }
      this.getTaskList({
        serviceId: param.serviceId,
        targets: ["ON_CPU", "OFF_CPU"],
        triggerType: EBPFProfilingTriggerType.FIXED_TIME,
      });
      return response;
    },
    async getTaskList(params: { serviceId: string; targets: string[] }) {
      if (!params.serviceId) {
        return new Promise((resolve) => resolve({}));
      }
      const response = await graphql.query("getEBPFTasks").params(params);

      this.ebpfTips = "";
      if (response.errors) {
        return response;
      }
      this.taskList = response.data.queryEBPFTasks || [];
      this.selectedTask = this.taskList[0] || {};
      this.setSelectedTask(this.selectedTask);
      if (!this.taskList.length) {
        return response;
      }
      this.getEBPFSchedules({ taskId: String(this.taskList[0].taskId) });
      return response;
    },
    async getEBPFSchedules(params: { taskId: string }) {
      if (!params.taskId) {
        return new Promise((resolve) => resolve({}));
      }

      const response = await graphql.query("getEBPFSchedules").params({ ...params });

      if (response.errors) {
        this.eBPFSchedules = [];
        return response;
      }
      this.ebpfTips = "";
      const { eBPFSchedules } = response.data;

      this.eBPFSchedules = eBPFSchedules;
      if (!eBPFSchedules.length) {
        this.eBPFSchedules = [];
        this.analyzeTrees = [];
      }
      return response;
    },
    async getEBPFAnalyze(params: {
      scheduleIdList: string[];
      timeRanges: Array<{ start: number; end: number }>;
      aggregateType: string;
    }) {
      this.aggregateType = params.aggregateType;
      if (!params.scheduleIdList.length) {
        return new Promise((resolve) => resolve({}));
      }
      if (!params.timeRanges.length) {
        return new Promise((resolve) => resolve({}));
      }
      const response = await graphql.query("getEBPFResult").params(params);

      if (response.errors) {
        this.analyzeTrees = [];
        return response;
      }
      const { analysisEBPFResult } = response.data;
      this.ebpfTips = analysisEBPFResult.tip;
      if (!analysisEBPFResult) {
        this.analyzeTrees = [];
        return response;
      }
      if (analysisEBPFResult.tip) {
        this.analyzeTrees = [];
        return response;
      }
      this.analyzeTrees = analysisEBPFResult.trees;
      return response;
    },
  },
});

export function useEbpfStore(): Recordable {
  return ebpfStore(store);
}
