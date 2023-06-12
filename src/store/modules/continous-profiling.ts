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
import type { StrategyItem, CheckItems } from "@/types/continous-profiling";
import type { EBPFTaskList, EBPFProfilingSchedule, AnalyzationTrees } from "@/types/ebpf";
import type { Instance } from "@/types/selector";
import { store } from "@/store";
import graphql from "@/graphql";
import type { MonitorInstance, MonitorProcess } from "@/types/continous-profiling";
import type { AxiosResponse } from "axios";
import { dateFormat } from "@/utils/dateFormat";

interface ContinousProfilingState {
  strategyList: Array<Recordable<StrategyItem>>;
  selectedStrategy: Recordable<StrategyItem>;
  taskList: Array<Recordable<EBPFTaskList>>;
  selectedTask: Recordable<EBPFTaskList>;
  errorTip: string;
  errorReason: string;
  instances: Instance[];
  instance: Nullable<Instance>;
  eBPFSchedules: EBPFProfilingSchedule[];
  currentSchedule: EBPFProfilingSchedule | Record<string, never>;
  analyzeTrees: AnalyzationTrees[];
  ebpfTips: string;
  aggregateType: string;
  instancesLoading: boolean;
  policyLoading: boolean;
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
    instances: [],
    eBPFSchedules: [],
    currentSchedule: {},
    analyzeTrees: [],
    aggregateType: "COUNT",
    instance: null,
    instancesLoading: false,
    policyLoading: false,
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
      this.policyLoading = true;
      const res: AxiosResponse = await graphql.query("getStrategyList").params(params);

      this.policyLoading = false;
      if (res.data.errors) {
        return res.data;
      }
      const list = res.data.data.strategyList || [];
      if (!list.length) {
        this.taskList = [];
        this.instances = [];
        this.instance = null;
      }
      const arr = list.length ? res.data.data.strategyList : [{ type: "", checkItems: [{ type: "" }] }];
      this.strategyList = arr.map((d: StrategyItem, index: number) => {
        return {
          ...d,
          id: index,
        };
      });
      this.setSelectedStrategy(this.strategyList[0]);
      if (!this.selectedStrategy.type) {
        return res.data;
      }
      this.getMonitoringInstances(params.serviceId);
      return res.data;
    },
    async getMonitoringInstances(serviceId: string): Promise<Nullable<AxiosResponse>> {
      this.instancesLoading = true;
      if (!serviceId) {
        return null;
      }
      const res: AxiosResponse = await graphql.query("getMonitoringInstances").params({
        serviceId,
        target: this.selectedStrategy.type,
      });
      this.instancesLoading = false;
      if (res.data.errors) {
        return res.data;
      }
      this.instances = (res.data.data.instances || [])
        .map((d: MonitorInstance) => {
          const processes = (d.processes || [])
            .sort((c: MonitorProcess, d: MonitorProcess) => d.lastTriggerTimestamp - c.lastTriggerTimestamp)
            .map((p: MonitorProcess) => {
              return {
                ...p,
                lastTriggerTime: d.lastTriggerTimestamp ? dateFormat(d.lastTriggerTimestamp) : "",
                labels: p.labels.join("; "),
              };
            });

          return {
            ...d,
            processes,
            lastTriggerTime: d.lastTriggerTimestamp ? dateFormat(d.lastTriggerTimestamp) : "",
          };
        })
        .sort((a: MonitorInstance, b: MonitorInstance) => b.lastTriggerTimestamp - a.lastTriggerTimestamp);
      this.instance = this.instances[0] || null;
      return res.data;
    },
  },
});

export function useContinousProfilingStore(): Recordable {
  return continousProfilingStore(store);
}
