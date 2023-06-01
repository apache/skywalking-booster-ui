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
import { ElMessage } from "element-plus";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useNetworkProfilingStore } from "@/store/modules/network-profiling";
import type { StrategyItem, CheckItems } from "@/types/continous-profiling";
import type { EBPFTaskList, EBPFProfilingSchedule, AnalyzationTrees } from "@/types/ebpf";
import type { Instance, Process } from "@/types/selector";
import { store } from "@/store";
import graphql from "@/graphql";
import type { AxiosResponse } from "axios";
import { EBPFProfilingTriggerType } from "../data";
import dateFormatStep from "@/utils/dateFormat";
import getLocalTime from "@/utils/localtime";

interface ContinousProfilingState {
  strategyList: Array<Recordable<StrategyItem>>;
  selectedStrategy: Recordable<StrategyItem>;
  taskList: Array<Recordable<EBPFTaskList>>;
  selectedTask: Recordable<EBPFTaskList>;
  errorTip: string;
  errorReason: string;
  processes: Process[];
  instances: Instance[];
  instance: Nullable<Instance>;
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
    selectedTask: {},
    errorReason: "",
    errorTip: "",
    ebpfTips: "",
    processes: [],
    instances: [],
    eBPFSchedules: [],
    currentSchedule: {},
    analyzeTrees: [],
    aggregateType: "COUNT",
    instance: null,
  }),
  actions: {
    setSelectedStrategy(task: Recordable<StrategyItem>) {
      this.selectedStrategy = task || {};
    },
    setselectedTask(task: Recordable<EBPFTaskList>) {
      this.selectedTask = task || {};
    },
    setCurrentSchedule(s: EBPFProfilingSchedule) {
      this.currentSchedule = s;
    },
    setAnalyzeTrees(tree: AnalyzationTrees[]) {
      this.analyzeTrees = tree;
    },
    setCurrentInstance(instance: Nullable<Instance>) {
      this.instance = instance;
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
      if (!this.strategyList.length) {
        this.nodes = [];
        this.calls = [];
        this.taskList = [];
      }
      if (!this.selectedStrategy.type) {
        return res.data;
      }
      this.getContinousTaskList({
        serviceId: params.serviceId,
        targets: [this.selectedStrategy.type],
        triggerType: EBPFProfilingTriggerType.CONTINUOUS_PROFILING,
      });
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
      if (!this.taskList.length) {
        const networkProfilingStore = useNetworkProfilingStore();
        networkProfilingStore.seNodes([]);
        networkProfilingStore.setLinks([]);
        this.eBPFSchedules = [];
        this.analyzeTrees = [];
        this.selectedTask = {};
        return;
      }
      // this.selectedTask = this.taskList[0] || {};
      // this.setselectedTask(this.selectedTask);
      // await this.getGraphData();
      return res.data;
    },
    async getGraphData() {
      if (this.selectedStrategy.type === "NETWORK") {
        await this.getTopology();
      } else {
        await this.preAnalyzeTask();
      }
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
        this.instance = this.instances[0] || null;
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
    async getTopology() {
      const networkProfilingStore = useNetworkProfilingStore();
      const appStore = useAppStoreWithOut();
      networkProfilingStore.setSelectedNetworkTask(this.selectedTask);
      const { taskStartTime, fixedTriggerDuration } = this.selectedTask;
      const startTime =
        fixedTriggerDuration > 1800 ? taskStartTime + fixedTriggerDuration * 1000 - 30 * 60 * 1000 : taskStartTime;
      let endTime = taskStartTime + fixedTriggerDuration * 1000;
      if (taskStartTime + fixedTriggerDuration * 1000 > new Date().getTime()) {
        endTime = new Date().getTime();
      }
      const resp = await networkProfilingStore.getProcessTopology({
        serviceInstanceId: this.instance.id || "",
        duration: {
          start: dateFormatStep(getLocalTime(appStore.utc, new Date(startTime)), appStore.duration.step, true),
          end: dateFormatStep(getLocalTime(appStore.utc, new Date(endTime)), appStore.duration.step, true),
          step: appStore.duration.step,
        },
      });
      if (resp.errors) {
        ElMessage.error(resp.errors);
      }
      return resp;
    },
    async getEBPFSchedules(params: { taskId: string }) {
      if (!params.taskId) {
        return new Promise((resolve) => resolve({}));
      }
      params.taskId = "71d96efb81b0be93b1322be1b17334c87d45d6216e299504a778264f94692d1b";
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
    async preAnalyzeTask() {
      if (this.selectedStrategy.type === "NETWORK") {
        const networkProfilingStore = useNetworkProfilingStore();
        await networkProfilingStore.setSelectedNetworkTask(this.selectedTask);
        return;
      }
      const res = await this.getEBPFSchedules({
        taskId: this.selectedTask.taskId,
      });
      if (res.errors) {
        ElMessage.error(res.errors);
      }
    },
  },
});

export function useContinousProfilingStore(): Recordable {
  return continousProfilingStore(store);
}
