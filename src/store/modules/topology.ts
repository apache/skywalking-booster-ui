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
import { store } from "@/store";
import { Node, Call } from "@/types/topology";
import graphql from "@/graphql";
import { AxiosResponse } from "axios";
import { useSelectorStore } from "@/store/modules/selectors";
import { useAppStoreWithOut } from "@/store/modules/app";

interface TopologyState {
  node: Node | null;
  call: Call | null;
  calls: Call[];
  nodes: Node[];
}

export const topologyStore = defineStore({
  id: "topology",
  state: (): TopologyState => ({
    calls: [],
    nodes: [],
    node: null,
    call: null,
  }),
  actions: {
    setNode(node: Node) {
      this.node = node;
    },
    setLink(link: Call) {
      this.call = link;
    },
    setTopology(data: { nodes: Node[]; calls: Call[] }) {
      console.log(data);
      this.nodes = data.nodes;
      this.calls = data.calls;
    },
    async setMetrics(data: { nodes: Node[]; calls: Call[] }, params: any) {
      const ids = data.nodes.map((i: Node) => i.id);
      const idsC = data.calls
        .filter((i: Call) => i.detectPoints.includes("CLIENT"))
        .map((b: any) => b.id);
      const idsS = data.calls
        .filter((i: Call) => i.detectPoints.includes("SERVER"))
        .map((b: any) => b.id);
      const res: AxiosResponse = await graphql
        .query("queryTopoInfo")
        .params({ ...params, ids, idsC, idsS });
      const resInfo = res.data.data;
      if (!resInfo.sla) {
        return this.setTopology(data);
      }
      for (let i = 0; i < resInfo.sla.values.length; i += 1) {
        for (let j = 0; j < data.nodes.length; j += 1) {
          if (data.nodes[j].id === resInfo.sla.values[i].id) {
            data.nodes[j] = {
              ...data.nodes[j],
              isGroupActive: true,
              sla: resInfo.sla.values[i].value
                ? resInfo.sla.values[i].value / 100
                : -1,
              cpm: resInfo.nodeCpm.values[i]
                ? resInfo.nodeCpm.values[i].value
                : -1,
              latency: resInfo.nodeLatency.values[i]
                ? resInfo.nodeLatency.values[i].value
                : -1,
            };
          }
        }
      }
      if (!resInfo.cpmC) {
        return this.setTopology(data);
      }
      for (let i = 0; i < resInfo.cpmC.values.length; i += 1) {
        for (let j = 0; j < data.calls.length; j += 1) {
          if (data.calls[j].id === resInfo.cpmC.values[i].id) {
            data.calls[j] = {
              ...data.calls[j],
              isGroupActive: true,
              cpm: resInfo.cpmC.values[i] ? resInfo.cpmC.values[i].value : "",
              latency: resInfo.latencyC.values[i]
                ? resInfo.latencyC.values[i].value
                : "",
            };
          }
        }
      }
      if (!resInfo.cpmS) {
        return this.setTopology(data);
      }
      for (let i = 0; i < resInfo.cpmS.values.length; i += 1) {
        for (let j = 0; j < data.calls.length; j += 1) {
          if (data.calls[j].id === resInfo.cpmS.values[i].id) {
            data.calls[j] = {
              ...data.calls[j],
              cpm: resInfo.cpmS.values[i] ? resInfo.cpmS.values[i].value : "",
              latency: resInfo.latencyS.values[i]
                ? resInfo.latencyS.values[i].value
                : "",
            };
          }
        }
      }
      this.setTopology(data);
    },
    async getServiceTopology() {
      const serviceId = useSelectorStore().currentService.id;
      const duration = useAppStoreWithOut().durationTime;
      const res: AxiosResponse = await graphql
        .query("getServiceTopology")
        .params({
          serviceId,
          duration,
        });
      if (!res.data.errors) {
        this.setMetrics(res.data.data.topology, { duration });
      }
      return res.data;
    },
    async getGlobalTopology() {
      const duration = useAppStoreWithOut().durationTime;
      const res: AxiosResponse = await graphql
        .query("getGlobalTopology")
        .params({
          duration,
        });
      if (!res.data.errors) {
        this.setMetrics(res.data.data.topology, { duration });
      }
      return res.data;
    },
    async getEndpointTopology() {
      const endpointId = useSelectorStore().currentPod.id;
      const duration = useAppStoreWithOut().durationTime;
      const res: AxiosResponse = await graphql
        .query("getEndpointTopology")
        .params({
          endpointId,
          duration,
        });
      if (!res.data.errors) {
        this.setTopology(res.data.data.topology);
      }
      return res.data;
    },
    async getInstanceTopology() {
      const serverServiceId = useSelectorStore().currentService.id;
      const clientServiceId = useSelectorStore().currentDestService.id;
      const duration = useAppStoreWithOut().durationTime;
      const res: AxiosResponse = await graphql
        .query("getInstanceTopology")
        .params({
          clientServiceId,
          serverServiceId,
          duration,
        });
      if (!res.data.errors) {
        this.setTopology(res.data.data.topology);
      }
      return res.data;
    },
  },
});

export function useTopologyStore(): any {
  return topologyStore(store);
}
