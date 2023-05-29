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
import type { EBPFTaskList, ProcessNode } from "@/types/ebpf";
import { store } from "@/store";
import graphql from "@/graphql";
import type { AxiosResponse } from "axios";
import type { Call } from "@/types/topology";
import type { LayoutConfig } from "@/types/dashboard";
import { ElMessage } from "element-plus";
import type { DurationTime } from "@/types/app";

interface NetworkProfilingState {
  networkTasks: Array<Recordable<EBPFTaskList>>;
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
    setSelectedNetworkTask(task: Recordable<EBPFTaskList>) {
      this.selectedNetworkTask = task || {};
    },
    setNode(node: Nullable<ProcessNode>) {
      this.node = node;
    },
    setLink(link: Call) {
      this.call = link;
    },
    seNodes(nodes: Node[]) {
      this.nodes = nodes;
    },
    setLinks(links: Call[]) {
      this.calls = links;
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
    async createNetworkTask(
      instanceId: string,
      params: {
        uriRegex: string;
        when4xx: string;
        when5xx: string;
        minDuration: number;
      }[],
    ) {
      const res: AxiosResponse = await graphql.query("newNetworkProfiling").params({
        request: {
          instanceId,
          samplings: params,
        },
      });

      if (res.data.errors) {
        return res.data;
      }
      return res.data;
    },
    async getTaskList(params: { serviceId: string; serviceInstanceId: string; targets: string[] }) {
      if (!params.serviceId) {
        return new Promise((resolve) => resolve({}));
      }
      const res: AxiosResponse = await graphql.query("getEBPFTasks").params(params);

      this.networkTip = "";
      if (res.data.errors) {
        return res.data;
      }
      this.networkTasks = res.data.data.queryEBPFTasks || [];
      this.selectedNetworkTask = this.networkTasks[0] || {};
      this.setSelectedNetworkTask(this.selectedNetworkTask);
      if (!this.networkTasks.length) {
        this.nodes = [];
        this.calls = [];
      }
      return res.data;
    },
    async keepNetworkProfiling(taskId: string) {
      if (!taskId) {
        return new Promise((resolve) => resolve({}));
      }
      const res: AxiosResponse = await graphql.query("aliveNetworkProfiling").params({ taskId });

      if (res.data.errors) {
        return res.data;
      }
      this.aliveNetwork = res.data.data.keepEBPFNetworkProfiling.status;
      if (!this.aliveNetwork) {
        ElMessage.warning(res.data.data.keepEBPFNetworkProfiling.errorReason);
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

export function useNetworkProfilingStore(): Recordable {
  return networkProfilingStore(store);
}
