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
import { EBPFTaskList, ProcessNode } from "@/types/ebpf";
import { store } from "@/store";
import graphql from "@/graphql";
import { AxiosResponse } from "axios";
import { Call } from "@/types/topology";
import { LayoutConfig } from "@/types/dashboard";
import { ElMessage } from "element-plus";

interface NetworkProfilingState {
  networkTasks: EBPFTaskList[];
  networkTip: string;
  selectedNetworkTask: Recordable<EBPFTaskList>;
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

export const networkProfilingStore = defineStore({
  id: "networkProfiling",
  state: (): NetworkProfilingState => ({
    networkTasks: [],
    networkTip: "",
    selectedNetworkTask: {},
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
    setSelectedNetworkTask(task: EBPFTaskList) {
      this.selectedNetworkTask = task || {};
    },
    setNode(node: Node) {
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
      const obj = {} as any;
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
      calls = calls.map((d: any) => {
        d.sourceId = d.source;
        d.targetId = d.target;
        d.source = d.sourceObj;
        d.target = d.targetObj;
        delete d.sourceObj;
        delete d.targetObj;
        return d;
      });
      this.calls = calls;
      this.nodes = data.nodes;
    },
    async createNetworkTask(param: {
      serviceId: string;
      serviceInstanceId: string;
    }) {
      const res: AxiosResponse = await graphql
        .query("newNetworkProfiling")
        .params({ request: { instanceId: param.serviceInstanceId } });

      if (res.data.errors) {
        return res.data;
      }
      return res.data;
    },
    async getTaskList(params: {
      serviceId: string;
      serviceInstanceId: string;
      targets: string[];
    }) {
      if (!params.serviceId) {
        return new Promise((resolve) => resolve({}));
      }
      const res: AxiosResponse = await graphql
        .query("getEBPFTasks")
        .params(params);

      this.networkTip = "";
      if (res.data.errors) {
        return res.data;
      }
      this.networkTasks = res.data.data.queryEBPFTasks || [];
      this.selectedNetworkTask = this.networkTasks[0] || {};
      this.setSelectedNetworkTask(this.selectedNetworkTask);
      return res.data;
    },
    async keepNetworkProfiling(taskId: string) {
      if (!taskId) {
        return new Promise((resolve) => resolve({}));
      }
      const res: AxiosResponse = await graphql
        .query("aliveNetworkProfiling")
        .params({ taskId });

      this.aliveMessage = "";
      if (res.data.errors) {
        return res.data;
      }
      this.aliveNetwork = res.data.data.keepEBPFNetworkProfiling.status;
      if (!this.aliveNetwork) {
        ElMessage.warning(res.data.data.keepEBPFNetworkProfiling.errorReason);
      }
      return res.data;
    },
    async getProcessTopology(params: {
      duration: any;
      serviceInstanceId: string;
    }) {
      this.loadNodes = true;
      const res: AxiosResponse = await graphql
        .query("getProcessTopology")
        .params(params);
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

export function useNetworkProfilingStore(): any {
  return networkProfilingStore(store);
}
