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
import type { Node, Call, HierarchyNode, ServiceHierarchy, InstanceHierarchy } from "@/types/topology";
import graphql from "@/graphql";
import { useSelectorStore } from "@/store/modules/selectors";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import customQuery from "@/graphql/custom-query";
import { useQueryTopologyExpressionsProcessor } from "@/hooks/useExpressionsProcessor";

interface MetricVal {
  [key: string]: { values: { id: string; value: unknown }[] };
}
interface TopologyState {
  node: Nullable<Node>;
  call: Nullable<Call>;
  calls: Call[];
  nodes: Node[];
  hierarchyServiceCalls: Call[];
  hierarchyServiceNodes: HierarchyNode[];
  hierarchyInstanceCalls: Call[];
  hierarchyInstanceNodes: HierarchyNode[];
  nodeMetricValue: MetricVal;
  linkServerMetrics: MetricVal;
  linkClientMetrics: MetricVal;
  hierarchyNodeMetrics: { [key: string]: MetricVal };
  hierarchyInstanceNodeMetrics: { [key: string]: MetricVal };
}

export const topologyStore = defineStore({
  id: "topology",
  state: (): TopologyState => ({
    calls: [],
    nodes: [],
    hierarchyServiceCalls: [],
    hierarchyServiceNodes: [],
    hierarchyInstanceCalls: [],
    hierarchyInstanceNodes: [],
    node: null,
    call: null,
    nodeMetricValue: {},
    linkServerMetrics: {},
    linkClientMetrics: {},
    hierarchyNodeMetrics: {},
    hierarchyInstanceNodeMetrics: {},
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
      const obj = {} as Recordable;
      const nodes = (data.nodes || []).reduce((prev: Node[], next: Node) => {
        if (!obj[next.id]) {
          obj[next.id] = true;
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
    setHierarchyInstanceTopology(data: InstanceHierarchy, levels: { layer: string; level: number }[]) {
      const relations = data.relations || [];
      const nodesMap = new Map();
      const callList = [];

      for (const relation of relations) {
        const upperId = relation.upperInstance.id;
        const lowerId = relation.lowerInstance.id;
        const lowerKey = `${lowerId}-${relation.lowerInstance.layer}`;
        const upperKey = `${upperId}-${relation.upperInstance.layer}`;
        const lowerLevel = levels.find(
          (l: { layer: string; level: number }) => l.layer === relation.lowerInstance.layer,
        ) || { level: undefined };
        const upperLevel = levels.find(
          (l: { layer: string; level: number }) => l.layer === relation.upperInstance.layer,
        ) || { level: undefined };
        const lowerObj = {
          ...relation.lowerInstance,
          key: lowerId,
          id: lowerKey,
          l: lowerLevel.level,
        };
        const upperObj = {
          ...relation.upperInstance,
          key: upperId,
          id: upperKey,
          l: upperLevel.level,
        };
        if (!nodesMap.get(upperKey)) {
          nodesMap.set(upperKey, upperObj);
        }
        if (!nodesMap.get(lowerKey)) {
          nodesMap.set(lowerKey, lowerObj);
        }
        callList.push({
          target: lowerKey,
          source: upperKey,
          id: `${lowerKey}->${upperKey}`,
          sourceObj: upperObj,
          targetObj: lowerObj,
        });
      }
      this.hierarchyInstanceCalls = callList;
      this.hierarchyInstanceNodes = [];
      for (const d of nodesMap.values()) {
        this.hierarchyInstanceNodes.push(d);
      }
    },
    setHierarchyServiceTopology(data: ServiceHierarchy, levels: { layer: string; level: number }[]) {
      const relations = data.relations || [];
      const nodesMap = new Map();
      const callList = [];

      for (const relation of relations) {
        const upperId = relation.upperService.id;
        const lowerId = relation.lowerService.id;
        const lowerKey = `${lowerId}-${relation.lowerService.layer}`;
        const upperKey = `${upperId}-${relation.upperService.layer}`;
        const lowerLevel = levels.find(
          (l: { layer: string; level: number }) => l.layer === relation.lowerService.layer,
        ) || { level: undefined };
        const upperLevel = levels.find(
          (l: { layer: string; level: number }) => l.layer === relation.upperService.layer,
        ) || { level: undefined };
        const lowerObj = {
          ...relation.lowerService,
          key: lowerId,
          id: lowerKey,
          l: lowerLevel.level,
        };
        const upperObj = {
          ...relation.upperService,
          key: upperId,
          id: upperKey,
          l: upperLevel.level,
        };
        if (!nodesMap.get(upperKey)) {
          nodesMap.set(upperKey, upperObj);
        }
        if (!nodesMap.get(lowerKey)) {
          nodesMap.set(lowerKey, lowerObj);
        }
        callList.push({
          target: lowerKey,
          source: upperKey,
          id: `${lowerKey}->${upperKey}`,
          sourceObj: upperObj,
          targetObj: lowerObj,
        });
      }
      this.hierarchyServiceCalls = callList;
      this.hierarchyServiceNodes = [];
      for (const d of nodesMap.values()) {
        this.hierarchyServiceNodes.push(d);
      }
    },
    setHierarchyNodeMetricValue(m: MetricVal, layer: string) {
      this.hierarchyNodeMetrics[layer] = m;
    },
    setHierarchyInstanceNodeMetricValue(m: MetricVal, layer: string) {
      this.hierarchyInstanceNodeMetrics[layer] = m;
    },
    setLinkServerMetrics(m: MetricVal) {
      this.linkServerMetrics = m;
    },
    setLinkClientMetrics(m: MetricVal) {
      this.linkClientMetrics = m;
    },
    setNodeMetricValue(m: MetricVal) {
      this.nodeMetricValue = m;
    },
    setLegendValues(expressions: string, data: { [key: string]: any }) {
      const nodeArr = this.nodes.filter((d: Node) => d.isReal);
      for (let idx = 0; idx < nodeArr.length; idx++) {
        for (let index = 0; index < expressions.length; index++) {
          const k = "expression" + idx + index;
          if (expressions[index]) {
            nodeArr[idx][expressions[index]] = Number(data[k].results[0].values[0].value);
          }
        }
      }
    },
    async getDepthServiceTopology(serviceIds: string[], depth: number) {
      const res = await this.getServicesTopology(serviceIds);
      if (depth > 1) {
        const ids = (res.nodes || []).map((item: Node) => item.id).filter((d: string) => !serviceIds.includes(d));
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
              .filter((d: string) => ![...ids, ...pods, ...serviceIds].includes(d));
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
                .filter((d: string) => ![...services, ...ids, ...pods, ...serviceIds].includes(d));
              if (!nodeIds.length) {
                const nodes = [...res.nodes, ...json.nodes, ...topo.nodes, ...data.nodes];
                const calls = [...res.calls, ...json.calls, ...topo.calls, ...data.calls];
                this.setTopology({ nodes, calls });
                return;
              }
              const toposObj = await this.getServicesTopology(nodeIds);
              const nodes = [...res.nodes, ...json.nodes, ...topo.nodes, ...data.nodes, ...toposObj.nodes];
              const calls = [...res.calls, ...json.calls, ...topo.calls, ...data.calls, ...toposObj.calls];
              this.setTopology({ nodes, calls });
            } else {
              const nodes = [...res.nodes, ...json.nodes, ...topo.nodes, ...data.nodes];
              const calls = [...res.calls, ...json.calls, ...topo.calls, ...data.calls];
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
      if (!serviceIds.length) {
        return new Promise((resolve) => resolve({}));
      }
      const duration = useAppStoreWithOut().durationTime;
      const res = await graphql.query("getServicesTopology").params({
        serviceIds,
        duration,
      });
      if (res.errors) {
        return res;
      }
      return res.data.topology;
    },
    async getInstanceTopology() {
      const { currentService, currentDestService } = useSelectorStore();
      const serverServiceId = (currentService && currentService.id) || "";
      const clientServiceId = (currentDestService && currentDestService.id) || "";
      const duration = useAppStoreWithOut().durationTime;
      if (!(serverServiceId && clientServiceId)) {
        return new Promise((resolve) => resolve({}));
      }
      const res = await graphql.query("getInstanceTopology").params({
        clientServiceId,
        serverServiceId,
        duration,
      });
      if (!res.errors) {
        this.setInstanceTopology(res.data.topology);
      }
      return res;
    },
    async updateEndpointTopology(endpointIds: string[], depth: number) {
      if (!endpointIds.length) {
        return new Promise((resolve) => resolve({}));
      }
      const res = await this.getEndpointTopology(endpointIds);
      if (depth > 1) {
        const userNodeName = "User";
        const ids = res.nodes
          .filter((d: Node) => !endpointIds.includes(d.id) && d.name !== userNodeName)
          .map((item: Node) => item.id);
        if (!ids.length) {
          this.setTopology(res);
          return;
        }
        const json = await this.getEndpointTopology(ids);
        if (depth > 2) {
          const pods = json.nodes
            .filter((d: Node) => ![...ids, ...endpointIds].includes(d.id) && d.name !== userNodeName)
            .map((item: Node) => item.id);
          if (!pods.length) {
            const nodes = [...res.nodes, ...json.nodes];
            const calls = [...res.calls, ...json.calls];
            this.setTopology({ nodes, calls });
            return;
          }
          const topo = await this.getEndpointTopology(pods);
          if (depth > 3) {
            const endpoints = topo.nodes
              .filter((d: Node) => ![...ids, ...pods, ...endpointIds].includes(d.id) && d.name !== userNodeName)
              .map((item: Node) => item.id);
            if (!endpoints.length) {
              const nodes = [...res.nodes, ...json.nodes, ...topo.nodes];
              const calls = [...res.calls, ...json.calls, ...topo.calls];
              this.setTopology({ nodes, calls });
              return;
            }
            const data = await this.getEndpointTopology(endpoints);
            if (depth > 4) {
              const nodeIds = data.nodes
                .filter(
                  (d: Node) =>
                    ![...endpoints, ...ids, ...pods, ...endpointIds].includes(d.id) && d.name !== userNodeName,
                )
                .map((item: Node) => item.id);
              if (!nodeIds.length) {
                const nodes = [...res.nodes, ...json.nodes, ...topo.nodes, ...data.nodes];
                const calls = [...res.calls, ...json.calls, ...topo.calls, ...data.calls];
                this.setTopology({ nodes, calls });
                return;
              }
              const toposObj = await this.getEndpointTopology(nodeIds);
              const nodes = [...res.nodes, ...json.nodes, ...topo.nodes, ...data.nodes, ...toposObj.nodes];
              const calls = [...res.calls, ...json.calls, ...topo.calls, ...data.calls, ...toposObj.calls];
              this.setTopology({ nodes, calls });
            } else {
              const nodes = [...res.nodes, ...json.nodes, ...topo.nodes, ...data.nodes];
              const calls = [...res.calls, ...json.calls, ...topo.calls, ...data.calls];
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
      if (!endpointIds.length) {
        return new Promise((resolve) => resolve({}));
      }
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
      const res = await customQuery({ queryStr, conditions });

      if (res.errors) {
        return res;
      }
      const topo = res.data;
      const calls = [] as Call[];
      const nodes = [] as Node[];
      for (const key of Object.keys(topo)) {
        calls.push(...topo[key].calls);
        nodes.push(...topo[key].nodes);
      }
      // this.setTopology({ calls, nodes });

      return { calls, nodes };
    },
    async getTopologyExpressionValue(param: { queryStr: string; conditions: { [key: string]: unknown } }) {
      const res = await customQuery(param);

      if (res.errors) {
        return res;
      }

      return res;
    },
    async getLinkExpressions(expressions: string[], type: string) {
      if (!expressions.length) {
        this.setLinkServerMetrics({});
        return;
      }
      const calls = this.calls.filter((i: Call) => i.detectPoints.includes(type));
      if (!calls.length) {
        return;
      }
      const { getMetrics } = useQueryTopologyExpressionsProcessor(expressions, calls);
      const metrics = await getMetrics();
      if (type === "SERVER") {
        this.setLinkServerMetrics(metrics);
      } else {
        this.setLinkClientMetrics(metrics);
      }
    },
    async queryNodeExpressions(expressions: string[]) {
      if (!expressions.length) {
        this.setNodeMetricValue({});
        return;
      }
      if (!this.nodes.length) {
        this.setNodeMetricValue({});
        return;
      }
      const { getMetrics } = useQueryTopologyExpressionsProcessor(
        expressions,
        this.nodes.filter((d: Node) => d.isReal),
      );
      const metrics = await getMetrics();
      this.setNodeMetricValue(metrics);
    },
    async getHierarchyServiceTopology() {
      const dashboardStore = useDashboardStore();
      const { currentService } = useSelectorStore();
      const id = this.node ? this.node.id : (currentService || {}).id;
      let layer = dashboardStore.layerId;
      if (this.node) {
        layer = this.node.layers.includes(dashboardStore.layerId)
          ? dashboardStore.layerId
          : this.node.layers.filter((d: string) => d !== dashboardStore.layerId)[0];
      }
      if (!(id && layer)) {
        return new Promise((resolve) => resolve({}));
      }
      const res = await graphql.query("getHierarchyServiceTopology").params({ serviceId: id, layer: layer });
      if (res.errors) {
        return res;
      }
      const resp = await this.getListLayerLevels();
      if (resp.errors) {
        return resp;
      }
      const levels = resp.levels || [];
      this.setHierarchyServiceTopology(res.data.hierarchyServiceTopology || {}, levels);
      return res;
    },
    async getListLayerLevels() {
      const res = await graphql.query("queryListLayerLevels").params({});

      return res.data;
    },
    async getHierarchyInstanceTopology() {
      const { currentPod } = useSelectorStore();
      const dashboardStore = useDashboardStore();

      if (!(currentPod && dashboardStore.layerId)) {
        return new Promise((resolve) => resolve({}));
      }
      const res = await graphql
        .query("getHierarchyInstanceTopology")
        .params({ instanceId: currentPod.id, layer: dashboardStore.layerId });
      if (res.errors) {
        return res;
      }
      const resp = await this.getListLayerLevels();
      if (resp.errors) {
        return resp;
      }
      const levels = resp.levels || [];
      this.setHierarchyInstanceTopology(res.data.hierarchyInstanceTopology || {}, levels);
      return res;
    },
    async queryHierarchyNodeExpressions(expressions: string[], layer: string) {
      const nodes = this.hierarchyServiceNodes.filter((n: HierarchyNode) => n.layer === layer);
      if (!nodes.length) {
        this.setHierarchyNodeMetricValue({}, layer);
        return;
      }
      if (!expressions.length) {
        this.setHierarchyNodeMetricValue({}, layer);
        return;
      }
      const { getMetrics } = useQueryTopologyExpressionsProcessor(expressions, nodes);
      const metrics = await getMetrics();
      this.setHierarchyNodeMetricValue(metrics, layer);
    },
    async queryHierarchyInstanceNodeExpressions(expressions: string[], layer: string) {
      const nodes = this.hierarchyInstanceNodes.filter((n: HierarchyNode) => n.layer === layer);

      if (!expressions.length) {
        this.setHierarchyInstanceNodeMetricValue({}, layer);
        return;
      }
      if (!nodes.length) {
        this.setHierarchyInstanceNodeMetricValue({}, layer);
        return;
      }
      const { getMetrics } = useQueryTopologyExpressionsProcessor(expressions, nodes);
      const metrics = await getMetrics();
      this.setHierarchyInstanceNodeMetricValue(metrics, layer);
    },
  },
});

export function useTopologyStore(): Recordable {
  return topologyStore(store);
}
