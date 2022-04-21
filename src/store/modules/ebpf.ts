import { TaskListItem } from "./../../types/profile.d";
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
import { Duration, Option } from "@/types/app";
import { ProfileAnalyzationTrees } from "@/types/profile";
import {
  EBPFTaskCreationRequest,
  EBPFProfilingSchedule,
  EBPFTaskList,
} from "@/types/ebpf";
import { Trace, Span } from "@/types/trace";
import { store } from "@/store";
import graphql from "@/graphql";
import { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";

interface EbpfStore {
  durationTime: Duration;
  taskList: EBPFTaskList[];
  eBPFSchedules: EBPFProfilingSchedule[];
  currentSchedule: EBPFProfilingSchedule | Record<string, never>;
  analyzeTrees: ProfileAnalyzationTrees;
  highlightTop: boolean;
  labels: Option[];
  couldProfiling: boolean;
}

export const ebpfStore = defineStore({
  id: "eBPF",
  state: (): EbpfStore => ({
    durationTime: useAppStoreWithOut().durationTime,
    taskList: [],
    eBPFSchedules: [],
    currentSchedule: {},
    analyzeTrees: [],
    highlightTop: true,
    labels: [{ value: "", label: "" }],
    couldProfiling: false,
  }),
  actions: {
    setCurrentSpan(span: Span) {
      this.currentSpan = span;
    },
    setCurrentSchedule(s: Trace) {
      this.currentSchedule = s;
    },
    setHighlightTop() {
      this.highlightTop = !this.highlightTop;
    },
    async getCreateTaskData(serviceId: string) {
      const res: AxiosResponse = await graphql
        .query("getCreateTaskData")
        .params({ serviceId });

      if (res.data.errors) {
        return res.data;
      }
      const json = res.data.data.createTaskData;
      this.couldProfiling = json.couldProfiling || [];
      this.labels = json.processLabels.map((d: string) => {
        return { label: d, value: d };
      });
      return res.data;
    },
    async createTask(param: EBPFTaskCreationRequest) {
      const res: AxiosResponse = await graphql
        .query("saveEBPFTask")
        .params({ request: param });

      if (res.data.errors) {
        return res.data;
      }
      this.getTaskList(param.serviceId);
      return res.data;
    },
    async getTaskList(serviceId: string) {
      const res: AxiosResponse = await graphql
        .query("getEBPFTasks")
        .params({ serviceId });

      if (res.data.errors) {
        return res.data;
      }
      this.taskList = res.data.data.queryEBPFTasks || [];
      if (!this.taskList.length) {
        return res.data;
      }
      this.getEBPFSchedules({ taskId: this.taskList[0].taskId });
      return res.data;
    },
    async getEBPFSchedules(params: { taskId: string; duration?: Duration }) {
      const duration = useAppStoreWithOut().durationTime;
      const res: AxiosResponse = await graphql
        .query("getEBPFSchedules")
        .params({ ...params, duration });

      if (res.data.errors) {
        this.eBPFSchedules = [];
        return res.data;
      }
      const { eBPFSchedules } = res.data.data;

      this.eBPFSchedules = eBPFSchedules;
      if (!eBPFSchedules.length) {
        this.eBPFSchedules = [];
        this.analyzeTrees = [];

        return res.data;
      }
      return res.data;
    },
    async getEBPFAnalyze(params: {
      scheduleIdList: string[];
      timeRanges: Array<{ start: number; end: number }>;
    }) {
      const res: AxiosResponse = await graphql
        .query("getEBPFResult")
        .params(params);

      if (res.data.errors) {
        this.analyzeTrees = [];
        return res.data;
      }
      const { analysisEBPFResult, tip } = res.data.data;
      if (tip) {
        this.analyzeTrees = [];
        return res.data;
      }

      if (!analysisEBPFResult) {
        this.analyzeTrees = [];
        return res.data;
      }
      this.analyzeTrees = analysisEBPFResult.trees[0].elements;
      return res.data;
    },
  },
});

export function useEbpfStore(): any {
  return ebpfStore(store);
}
