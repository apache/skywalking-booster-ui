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
import { Service } from "@/types/selector";
import { Node, Call } from "@/types/topology";
import graphql from "@/graphql";
import { useSelectorStore } from "@/store/modules/selectors";
import { useAppStoreWithOut } from "@/store/modules/app";
import { AxiosResponse } from "axios";
import query from "@/graphql/fetch";

interface MetricVal {
  [key: string]: { values: { id: string; value: unknown }[] };
}
interface TopologyState {
  node: Nullable<Node>;
  call: Nullable<Call>;
  calls: Call[];
  nodes: Node[];
  nodeMetrics: MetricVal;
  linkServerMetrics: MetricVal;
  linkClientMetrics: MetricVal;
}

export const topologyStore = defineStore({
  id: "topology",
  state: (): TopologyState => ({
    calls: [],
    nodes: [],
    node: null,
    call: null,
    nodeMetrics: {},
    linkServerMetrics: {},
    linkClientMetrics: {},
  }),
  actions: {
    setNode(node: Node) {
      this.node = node;
    },
    setLink(link: Call) {
      this.call = link;
    },
    setTopology(data: { nodes: Node[]; calls: Call[] }) {
      this.nodes = data.nodes.map((n: Node) => {
        const service =
          useSelectorStore().services.filter(
            (d: Service) => d.id === n.id
          )[0] || {};
        n.layer = service.layers ? service.layers[0] : null;
        return n;
      });
      this.calls = data.calls.map((c: Call) => {
        for (const s of useSelectorStore().services) {
          if (c.source.id === s.id) {
            c.source.layer = s.layers[0];
          }
          if (c.target.id === s.id) {
            c.target.layer = s.layers[0];
          }
        }
        return c;
      });
    },
    setInstanceTopology(data: { nodes: Node[]; calls: Call[] }) {
      for (const call of data.calls) {
        for (const node of data.nodes) {
          if (call.source === node.id) {
            call.sourceObj = node;
          }
          if (call.target === node.id) {
            call.targetObj = node;
          }
        }
        call.value = call.value || 1;
      }
      this.calls = data.calls;
      this.nodes = data.nodes;
    },
    setEndpointTopology(data: { nodes: Node[]; calls: Call[] }) {
      const obj = {} as any;
      let nodes = [];
      let calls = [];
      nodes = data.nodes.reduce((prev: Node[], next: Node) => {
        if (!obj[next.id]) {
          obj[next.id] = true;
          prev.push(next);
        }
        return prev;
      }, []);
      calls = data.calls.reduce((prev: Call[], next: Call) => {
        if (!obj[next.id]) {
          obj[next.id] = true;
          next.value = next.value || 1;
          prev.push(next);
        }
        return prev;
      }, []);
      for (const call of calls) {
        for (const node of nodes) {
          if (call.source === node.id) {
            call.sourceObj = node;
          }
          if (call.target === node.id) {
            call.targetObj = node;
          }
        }
        call.value = call.value || 1;
      }
      this.calls = calls;
      this.nodes = nodes;
    },
    setNodeMetrics(m: { id: string; value: unknown }[]) {
      this.nodeMetrics = m;
    },
    setLinkServerMetrics(m: { id: string; value: unknown }[]) {
      this.linkServerMetrics = m;
      console.log(m);
    },
    setLinkClientMetrics(m: { id: string; value: unknown }[]) {
      this.linkClientMetrics = m;
    },
    async getServiceTopology(id: string) {
      const serviceIds = [id];
      const duration = useAppStoreWithOut().durationTime;
      const res: AxiosResponse = await graphql
        .query("getServicesTopology")
        .params({
          serviceIds,
          duration,
        });
      if (!res.data.errors) {
        this.setTopology(res.data.data.topology);
      }
      return res.data;
    },
    async getServicesTopology() {
      const serviceIds = useSelectorStore().services.map((d: Service) => d.id);
      const duration = useAppStoreWithOut().durationTime;
      const res: AxiosResponse = await graphql
        .query("getServicesTopology")
        .params({
          serviceIds,
          duration,
        });
      if (!res.data.errors) {
        this.setTopology(res.data.data.topology);
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
        this.setInstanceTopology(res.data.data.topology);
      }
      return res.data;
    },
    async updateEndpointTopology(endpointIds: string[], depth: number) {
      const res = await this.getEndpointTopology(endpointIds);
      if (depth > 1) {
        const ids = res.nodes
          .map((item: Node) => item.id)
          .filter((d: string) => !endpointIds.includes(d));
        if (!ids.length) {
          this.setEndpointTopology(res);
          return;
        }
        const json = await this.getEndpointTopology(ids);
        if (depth > 2) {
          const pods = json.nodes
            .map((item: Node) => item.id)
            .filter((d: string) => ![...ids, ...endpointIds].includes(d));
          if (!pods.length) {
            const nodes = [...res.nodes, ...json.nodes];
            const calls = [...res.calls, ...json.calls];
            this.setEndpointTopology({ nodes, calls });
            return;
          }
          const topo = await this.getEndpointTopology(pods);
          if (depth > 3) {
            const endpoints = topo.nodes
              .map((item: Node) => item.id)
              .filter(
                (d: string) => ![...ids, ...pods, ...endpointIds].includes(d)
              );
            if (!endpoints.length) {
              const nodes = [...res.nodes, ...json.nodes, ...topo.nodes];
              const calls = [...res.calls, ...json.calls, ...topo.calls];
              this.setEndpointTopology({ nodes, calls });
              return;
            }
            const data = await this.getEndpointTopology(endpoints);
            if (depth > 4) {
              const nodeIds = data.nodes
                .map((item: Node) => item.id)
                .filter(
                  (d: string) =>
                    ![...endpoints, ...ids, ...pods, ...endpointIds].includes(d)
                );
              if (!nodeIds.length) {
                const nodes = [
                  ...res.nodes,
                  ...json.nodes,
                  ...topo.nodes,
                  ...data.nodes,
                ];
                const calls = [
                  ...res.calls,
                  ...json.calls,
                  ...topo.calls,
                  ...data.calls,
                ];
                this.setEndpointTopology({ nodes, calls });
                return;
              }
              const toposObj = await this.getEndpointTopology(nodeIds);
              const nodes = [
                ...res.nodes,
                ...json.nodes,
                ...topo.nodes,
                ...data.nodes,
                ...toposObj.nodes,
              ];
              const calls = [
                ...res.calls,
                ...json.calls,
                ...topo.calls,
                ...data.calls,
                ...toposObj.calls,
              ];
              this.setEndpointTopology({ nodes, calls });
            } else {
              const nodes = [
                ...res.nodes,
                ...json.nodes,
                ...topo.nodes,
                ...data.nodes,
              ];
              const calls = [
                ...res.calls,
                ...json.calls,
                ...topo.calls,
                ...data.calls,
              ];
              this.setEndpointTopology({ nodes, calls });
            }
          } else {
            const nodes = [...res.nodes, ...json.nodes, ...topo.nodes];
            const calls = [...res.calls, ...json.calls, ...topo.calls];
            this.setEndpointTopology({ nodes, calls });
          }
        } else {
          this.setEndpointTopology({
            nodes: [...res.nodes, ...json.nodes],
            calls: [...res.calls, ...json.calls],
          });
        }
      } else {
        this.setEndpointTopology(res);
      }
    },
    async getEndpointTopology(endpointIds: string[]) {
      const duration = useAppStoreWithOut().durationTime;
      const variables = ["$duration: Duration!"];
      const fragment = endpointIds.map((id: string, index: number) => {
        return `endpointTopology${index}: getEndpointDependencies(endpointId: "${id}", duration: $duration) {
          nodes {
            id
            name
            serviceId
            serviceName
            type
            isReal
          }
          calls {
            id
            source
            target
            detectPoints
          }
        }`;
      });
      const queryStr = `query queryData(${variables}) {${fragment}}`;
      const conditions = { duration };
      const res: AxiosResponse = await query({ queryStr, conditions });

      if (res.data.errors) {
        return res.data;
      }
      const topo = res.data.data;
      const calls = [] as any;
      const nodes = [] as any;
      for (const key of Object.keys(topo)) {
        calls.push(...topo[key].calls);
        nodes.push(...topo[key].nodes);
      }
      // this.setEndpointTopology({ calls, nodes });

      return { calls, nodes };
    },
    async getNodeMetrics(param: {
      queryStr: string;
      conditions: { [key: string]: unknown };
    }) {
      const res: AxiosResponse = await query(param);

      if (res.data.errors) {
        return res.data;
      }
      this.setNodeMetrics(res.data.data);
      return res.data;
    },
    async getCallServerMetrics(param: {
      queryStr: string;
      conditions: { [key: string]: unknown };
    }) {
      const res: AxiosResponse = await query(param);

      if (res.data.errors) {
        return res.data;
      }
      this.setLinkServerMetrics(res.data.data);
      return res.data;
    },
    async getCallClientMetrics(param: {
      queryStr: string;
      conditions: { [key: string]: unknown };
    }) {
      const res: AxiosResponse = await query(param);

      if (res.data.errors) {
        return res.data;
      }
      this.setLinkClientMetrics(res.data.data);
      return res.data;
    },
  },
});

export function useTopologyStore(): any {
  return topologyStore(store);
}
