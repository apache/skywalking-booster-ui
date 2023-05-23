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
import type { StrategyItem, CheckItems } from "@/types/continous-profiling";
import type { ProcessNode, EBPFTaskList } from "@/types/ebpf";
import type { Instance, Process } from "@/types/selector";
import { store } from "@/store";
import graphql from "@/graphql";
import type { AxiosResponse } from "axios";
import type { Call } from "@/types/topology";
import type { LayoutConfig } from "@/types/dashboard";
import type { DurationTime } from "@/types/app";
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
  nodes: ProcessNode[];
  calls: Call[];
  node: Nullable<ProcessNode>;
  call: Nullable<Call>;
  metricsLayout: LayoutConfig[];
  selectedMetric: Nullable<LayoutConfig>;
  activeMetricIndex: string;
  aliveNetwork: boolean;
  loadNodes: boolean;
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
    processes: [],
    instances: [],
    nodes: [],
    calls: [],
    node: null,
    call: null,
    metricsLayout: [],
    selectedMetric: null,
    activeMetricIndex: "",
    aliveNetwork: false,
    loadNodes: false,
  }),
  actions: {
    setSelectedStrategy(task: Recordable<StrategyItem>) {
      this.selectedStrategy = task || {};
    },
    setSelectedContinousTask(task: Recordable<EBPFTaskList>) {
      this.selectedContinousTask = task || {};
    },
    setNode(node: Nullable<ProcessNode>) {
      this.node = node;
    },
    setLink(link: Call) {
      this.call = link;
    },
    setMetricsLayout(layout: LayoutConfig[]) {
      this.metricsLayout = layout;
    },
    setSelectedMetric(item: LayoutConfig) {
      this.selectedMetric = item;
    },
    setActiveItem(index: string) {
      this.activeMetricIndex = index;
    },
    setTopology(data: { nodes: ProcessNode[]; calls: Call[] }) {
      const obj = {} as Recordable;
      let calls = (data.calls || []).reduce((prev: Call[], next: Call) => {
        if (!obj[next.id]) {
          obj[next.id] = true;
          next.value = next.value || 1;
          for (const node of data.nodes) {
            if (next.source === node.id) {
              next.sourceObj = node;
            }
            if (next.target === node.id) {
              next.targetObj = node;
            }
          }
          next.value = next.value || 1;
          prev.push(next);
        }
        return prev;
      }, []);
      const param = {} as Recordable;
      calls = data.calls.reduce((prev: (Call & Recordable)[], next: Call & Recordable) => {
        if (param[next.targetId + next.sourceId]) {
          next.lowerArc = true;
        }
        param[next.sourceId + next.targetId] = true;
        next.sourceId = next.source;
        next.targetId = next.target;
        next.source = next.sourceObj;
        next.target = next.targetObj;
        delete next.sourceObj;
        delete next.targetObj;
        prev.push(next);
        return prev;
      }, []);
      this.calls = calls;
      this.nodes = data.nodes;
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
        this.nodes = [];
        this.calls = [];
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
    async getProcessTopology(params: { duration: DurationTime; serviceInstanceId: string }) {
      this.loadNodes = true;
      const res: AxiosResponse = await graphql.query("getProcessTopology").params(params);
      this.loadNodes = false;
      if (res.data.errors) {
        this.nodes = [];
        this.calls = [];
        return res.data;
      }
      const { topology } = res.data.data;

      this.setTopology(topology);
      return res.data;
    },
  },
});

export function useContinousProfilingStore(): Recordable {
  return continousProfilingStore(store);
}
