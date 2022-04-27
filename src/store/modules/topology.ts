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
import { useQueryTopologyMetrics } from "@/hooks/useProcessor";
import { ElMessage } from "element-plus";

interface MetricVal {
  [key: string]: { values: { id: string; value: unknown }[] };
}
interface TopologyState {
  node: Nullable<Node>;
  call: Nullable<Call>;
  calls: Call[];
  nodes: Node[];
  nodeMetricValue: MetricVal;
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
    nodeMetricValue: {},
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
    setTopology(data: { nodes: Node[]; calls: Call[] }) {
      const obj = {} as any;
      const services = useSelectorStore().services;
      const nodes = (data.nodes || []).reduce((prev: Node[], next: Node) => {
        if (!obj[next.id]) {
          obj[next.id] = true;
          const s = services.filter((d: Service) => d.id === next.id)[0] || {};
          next.layer = s.layers ? s.layers[0] : null;
          prev.push(next);
        }
        return prev;
      }, []);
      const calls = (data.calls || []).reduce((prev: Call[], next: Call) => {
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

      this.calls = calls;
      this.nodes = nodes;
    },
    setNodeMetricValue(m: { id: string; value: unknown }[]) {
      this.nodeMetricValue = m;
    },
    setLinkServerMetrics(m: { id: string; value: unknown }[]) {
      this.linkServerMetrics = m;
    },
    setLinkClientMetrics(m: { id: string; value: unknown }[]) {
      this.linkClientMetrics = m;
    },
    async getDepthServiceTopology(serviceIds: string[], depth: number) {
      const res = await this.getServicesTopology(serviceIds);
      if (depth > 1) {
        const ids = (res.nodes || [])
          .map((item: Node) => item.id)
          .filter((d: string) => !serviceIds.includes(d));
        if (!ids.length) {
          this.setTopology(res);
          return;
        }
        const json = await this.getServicesTopology(ids);
        if (depth > 2) {
          const pods = json.nodes
            .map((item: Node) => item.id)
            .filter((d: string) => ![...ids, ...serviceIds].includes(d));
          if (!pods.length) {
            const nodes = [...res.nodes, ...json.nodes];
            const calls = [...res.calls, ...json.calls];
            this.setTopology({ nodes, calls });
            return;
          }
          const topo = await this.getServicesTopology(pods);
          if (depth > 3) {
            const services = topo.nodes
              .map((item: Node) => item.id)
              .filter(
                (d: string) => ![...ids, ...pods, ...serviceIds].includes(d)
              );
            if (!services.length) {
              const nodes = [...res.nodes, ...json.nodes, ...topo.nodes];
              const calls = [...res.calls, ...json.calls, ...topo.calls];
              this.setTopology({ nodes, calls });
              return;
            }
            const data = await this.getServicesTopology(services);
            if (depth > 4) {
              const nodeIds = data.nodes
                .map((item: Node) => item.id)
                .filter(
                  (d: string) =>
                    ![...services, ...ids, ...pods, ...serviceIds].includes(d)
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
                this.setTopology({ nodes, calls });
                return;
              }
              const toposObj = await this.getServicesTopology(nodeIds);
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
              this.setTopology({ nodes, calls });
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
              this.setTopology({ nodes, calls });
            }
          } else {
            const nodes = [...res.nodes, ...json.nodes, ...topo.nodes];
            const calls = [...res.calls, ...json.calls, ...topo.calls];
            this.setTopology({ nodes, calls });
          }
        } else {
          this.setTopology({
            nodes: [...res.nodes, ...json.nodes],
            calls: [...res.calls, ...json.calls],
          });
        }
      } else {
        this.setTopology(res);
      }
    },
    async getServicesTopology(serviceIds: string[]) {
      const duration = useAppStoreWithOut().durationTime;
      const res: AxiosResponse = await graphql
        .query("getServicesTopology")
        .params({
          serviceIds,
          duration,
        });
      if (res.data.errors) {
        return res.data;
      }
      return res.data.data.topology;
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
          this.setTopology(res);
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
            this.setTopology({ nodes, calls });
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
              this.setTopology({ nodes, calls });
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
                this.setTopology({ nodes, calls });
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
              this.setTopology({ nodes, calls });
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
              this.setTopology({ nodes, calls });
            }
          } else {
            const nodes = [...res.nodes, ...json.nodes, ...topo.nodes];
            const calls = [...res.calls, ...json.calls, ...topo.calls];
            this.setTopology({ nodes, calls });
          }
        } else {
          this.setTopology({
            nodes: [...res.nodes, ...json.nodes],
            calls: [...res.calls, ...json.calls],
          });
        }
      } else {
        this.setTopology(res);
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
      // this.setTopology({ calls, nodes });

      return { calls, nodes };
    },
    async getNodeMetricValue(param: {
      queryStr: string;
      conditions: { [key: string]: unknown };
    }) {
      const res: AxiosResponse = await query(param);

      if (res.data.errors) {
        return res.data;
      }
      this.setNodeMetricValue(res.data.data);
      return res.data;
    },
    async getLinkClientMetrics(linkClientMetrics: string[]) {
      if (!linkClientMetrics.length) {
        this.setLinkClientMetrics({});
        return;
      }
      const idsC = this.calls
        .filter((i: Call) => i.detectPoints.includes("CLIENT"))
        .map((b: Call) => b.id);
      if (!idsC.length) {
        return;
      }
      const param = await useQueryTopologyMetrics(linkClientMetrics, idsC);
      const res = await this.getCallClientMetrics(param);

      if (res.errors) {
        ElMessage.error(res.errors);
      }
    },
    async getLinkServerMetrics(linkServerMetrics: string[]) {
      if (!linkServerMetrics.length) {
        this.setLinkServerMetrics({});
        return;
      }
      const idsS = this.calls
        .filter((i: Call) => i.detectPoints.includes("SERVER"))
        .map((b: Call) => b.id);
      if (!idsS.length) {
        return;
      }
      const param = await useQueryTopologyMetrics(linkServerMetrics, idsS);
      const res = await this.getCallServerMetrics(param);

      if (res.errors) {
        ElMessage.error(res.errors);
      }
    },
    async queryNodeMetrics(nodeMetrics: string[]) {
      if (!nodeMetrics.length) {
        this.setNodeMetricValue({});
        return;
      }
      const ids = this.nodes.map((d: Node) => d.id);
      if (!ids.length) {
        return;
      }
      const param = await useQueryTopologyMetrics(nodeMetrics, ids);
      const res = await this.getNodeMetricValue(param);

      if (res.errors) {
        ElMessage.error(res.errors);
      }
    },
    async getLegendMetrics(param: {
      queryStr: string;
      conditions: { [key: string]: unknown };
    }) {
      const res: AxiosResponse = await query(param);

      if (res.data.errors) {
        return res.data;
      }
      const data = res.data.data;
      const metrics = Object.keys(data);
      this.nodes = this.nodes.map((d: Node | any) => {
        for (const m of metrics) {
          for (const val of data[m].values) {
            if (d.id === val.id) {
              d[m] = val.value;
            }
          }
        }
        return d;
      });
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
