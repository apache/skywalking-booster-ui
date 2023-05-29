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
import { useAppStoreWithOut } from "@/store/modules/app";
import { useNetworkProfilingStore } from "@/store/modules/network-profiling";
import type { StrategyItem, CheckItems } from "@/types/continous-profiling";
import type { EBPFTaskList, EBPFProfilingSchedule, AnalyzationTrees } from "@/types/ebpf";
import type { Instance, Process } from "@/types/selector";
import { store } from "@/store";
import graphql from "@/graphql";
import type { AxiosResponse } from "axios";
import { EBPFProfilingTriggerType } from "../data";

interface ContinousProfilingState {
  strategyList: Array<Recordable<StrategyItem>>;
  selectedStrategy: Recordable<StrategyItem>;
  taskList: Array<Recordable<EBPFTaskList>>;
  selectedContinousTask: Recordable<EBPFTaskList>;
  errorTip: string;
  errorReason: string;
  processes: Process[];
  instances: Instance[];
  eBPFSchedules: EBPFProfilingSchedule[];
  currentSchedule: EBPFProfilingSchedule | Record<string, never>;
  analyzeTrees: AnalyzationTrees[];
  ebpfTips: string;
  aggregateType: string;
}

export const continousProfilingStore = defineStore({
  id: "continousProfiling",
  state: (): ContinousProfilingState => ({
    strategyList: [],
    selectedStrategy: {},
    taskList: [],
    selectedContinousTask: {},
    errorReason: "",
    errorTip: "",
    ebpfTips: "",
    processes: [],
    instances: [],
    eBPFSchedules: [],
    currentSchedule: {},
    analyzeTrees: [],
    aggregateType: "COUNT",
  }),
  actions: {
    setSelectedStrategy(task: Recordable<StrategyItem>) {
      this.selectedStrategy = task || {};
    },
    setSelectedContinousTask(task: Recordable<EBPFTaskList>) {
      this.selectedContinousTask = task || {};
    },
    setCurrentSchedule(s: EBPFProfilingSchedule) {
      this.currentSchedule = s;
    },
    setAnalyzeTrees(tree: AnalyzationTrees[]) {
      this.analyzeTrees = tree;
    },
    async setContinuousProfilingPolicy(
      serviceId: string,
      targets: {
        targetType: string;
        checkItems: CheckItems[];
      }[],
    ) {
      const res: AxiosResponse = await graphql.query("editStrategy").params({
        request: {
          serviceId,
          targets,
        },
      });

      if (res.data.errors) {
        return res.data;
      }

      return res.data;
    },
    async getStrategyList(params: { serviceId: string }) {
      if (!params.serviceId) {
        return new Promise((resolve) => resolve({}));
      }
      const res: AxiosResponse = await graphql.query("getStrategyList").params(params);

      if (res.data.errors) {
        return res.data;
      }
      this.strategyList = (res.data.data.strategyList || []).map((d: StrategyItem, index: number) => {
        return {
          ...d,
          id: index,
        };
      });
      this.setSelectedStrategy(this.strategyList[0] || {});
      this.getContinousTaskList({
        serviceId: params.serviceId,
        targets: [this.selectedStrategy.type],
        triggerType: EBPFProfilingTriggerType.CONTINUOUS_PROFILING,
      });
      if (!this.strategyList.length) {
        this.nodes = [];
        this.calls = [];
      }
      return res.data;
    },
    async getContinousTaskList(params: {
      serviceId: string;
      serviceInstanceId: string;
      targets: string[];
      triggerType: string;
    }) {
      if (!params.serviceId) {
        return new Promise((resolve) => resolve({}));
      }
      const res: AxiosResponse = await graphql.query("getEBPFTasks").params(params);

      this.errorTip = "";
      if (res.data.errors) {
        return res.data;
      }
      this.taskList = res.data.data.queryEBPFTasks || [];
      this.selectedContinousTask = this.taskList[0] || {};
      this.setSelectedContinousTask(this.selectedContinousTask);
      if (!this.taskList.length) {
        const networkProfilingStore = useNetworkProfilingStore();
        networkProfilingStore.seNodes([]);
        networkProfilingStore.setLinks([]);
        this.eBPFSchedules = [];
        this.analyzeTrees = [];
      }
      return res.data;
    },
    async getServiceInstances(serviceId: string): Promise<Nullable<AxiosResponse>> {
      if (!serviceId) {
        return null;
      }
      const res: AxiosResponse = await graphql.query("queryInstances").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
      });
      if (!res.data.errors) {
        this.instances = res.data.data.pods || [];
      }
      return res.data;
    },
    async getProcesses(instanceId: string): Promise<Nullable<AxiosResponse>> {
      if (!instanceId) {
        return null;
      }
      const res: AxiosResponse = await graphql.query("queryProcesses").params({
        instanceId,
        duration: useAppStoreWithOut().durationTime,
      });
      if (!res.data.errors) {
        this.processes = res.data.data.processes || [];
      }
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
      this.ebpftTips = "";
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
      this.ebpftTips = analysisEBPFResult.tip;
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

export function useContinousProfilingStore(): Recordable {
  return continousProfilingStore(store);
}
