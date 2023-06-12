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
import type { AxiosResponse } from "axios";
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
      const res: AxiosResponse = await graphql.query("getCreateTaskData").params({ serviceId });

      if (res.data.errors) {
        return res.data;
      }
      const json = res.data.data.createTaskData;
      this.couldProfiling = json.couldProfiling || false;
      this.labels = json.processLabels.map((d: string) => {
        return { label: d, value: d };
      });
      return res.data;
    },
    async createTask(param: EBPFTaskCreationRequest) {
      const res: AxiosResponse = await graphql.query("saveEBPFTask").params({ request: param });

      if (res.data.errors) {
        return res.data;
      }
      this.getTaskList({
        serviceId: param.serviceId,
        targets: ["ON_CPU", "OFF_CPU"],
        triggerType: EBPFProfilingTriggerType.FIXED_TIME,
      });
      return res.data;
    },
    async getTaskList(params: { serviceId: string; targets: string[] }) {
      if (!params.serviceId) {
        return new Promise((resolve) => resolve({}));
      }
      const res: AxiosResponse = await graphql.query("getEBPFTasks").params(params);

      this.ebpfTips = "";
      if (res.data.errors) {
        return res.data;
      }
      this.taskList = res.data.data.queryEBPFTasks || [];
      this.selectedTask = this.taskList[0] || {};
      this.setSelectedTask(this.selectedTask);
      if (!this.taskList.length) {
        return res.data;
      }
      this.getEBPFSchedules({ taskId: String(this.taskList[0].taskId) });
      return res.data;
    },
    async getEBPFSchedules(params: { taskId: string }) {
      if (!params.taskId) {
        return new Promise((resolve) => resolve({}));
      }

      const res: AxiosResponse = await graphql.query("getEBPFSchedules").params({ ...params });

      if (res.data.errors) {
        this.eBPFSchedules = [];
        return res.data;
      }
      this.ebpfTips = "";
      const { eBPFSchedules } = res.data.data;

      this.eBPFSchedules = eBPFSchedules;
      if (!eBPFSchedules.length) {
        this.eBPFSchedules = [];
        this.analyzeTrees = [];
      }
      return res.data;
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
      const res: AxiosResponse = await graphql.query("getEBPFResult").params(params);

      if (res.data.errors) {
        this.analyzeTrees = [];
        return res.data;
      }
      const { analysisEBPFResult } = res.data.data;
      this.ebpfTips = analysisEBPFResult.tip;
      if (!analysisEBPFResult) {
        this.analyzeTrees = [];
        return res.data;
      }
      if (analysisEBPFResult.tip) {
        this.analyzeTrees = [];
        return res.data;
      }
      this.analyzeTrees = analysisEBPFResult.trees;
      return res.data;
    },
  },
});

export function useEbpfStore(): Recordable {
  return ebpfStore(store);
}
