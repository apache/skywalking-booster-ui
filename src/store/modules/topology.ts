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
import type { AxiosResponse } from "axios";
import query from "@/graphql/fetch";
import { useQueryTopologyMetrics } from "@/hooks/useMetricsProcessor";
import { useQueryTopologyExpressionsProcessor } from "@/hooks/useExpressionsProcessor";
import { ElMessage } from "element-plus";

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
    setNodeValue(m: MetricVal) {
      this.nodeMetricValue = m;
    },
    setLegendValues(expressions: string, data: { [key: string]: any }) {
      for (let idx = 0; idx < this.nodes.length; idx++) {
        for (let index = 0; index < expressions.length; index++) {
          const k = "expression" + idx + index;
          if (expressions[index]) {
            this.nodes[idx][expressions[index]] = Number(data[k].results[0].values[0].value);
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
      const res: AxiosResponse = await graphql.query("getServicesTopology").params({
        serviceIds,
        duration,
      });
      if (res.data.errors) {
        return res.data;
      }
      return res.data.data.topology;
    },
    async getInstanceTopology() {
      const { currentService, currentDestService } = useSelectorStore();
      const serverServiceId = (currentService && currentService.id) || "";
      const clientServiceId = (currentDestService && currentDestService.id) || "";
      const duration = useAppStoreWithOut().durationTime;
      if (!(serverServiceId && clientServiceId)) {
        return new Promise((resolve) => resolve({}));
      }
      const res: AxiosResponse = await graphql.query("getInstanceTopology").params({
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
      if (!endpointIds.length) {
        return new Promise((resolve) => resolve({}));
      }
      const res = await this.getEndpointTopology(endpointIds);
      if (depth > 1) {
        const ids = res.nodes.map((item: Node) => item.id).filter((d: string) => !endpointIds.includes(d));
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
              .filter((d: string) => ![...ids, ...pods, ...endpointIds].includes(d));
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
                .filter((d: string) => ![...endpoints, ...ids, ...pods, ...endpointIds].includes(d));
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
      const res: AxiosResponse = await query({ queryStr, conditions });

      if (res.data.errors) {
        return res.data;
      }
      const topo = res.data.data;
      const calls = [] as Call[];
      const nodes = [] as Node[];
      for (const key of Object.keys(topo)) {
        calls.push(...topo[key].calls);
        nodes.push(...topo[key].nodes);
      }
      // this.setTopology({ calls, nodes });

      return { calls, nodes };
    },
    async getNodeMetricValue(param: { queryStr: string; conditions: { [key: string]: unknown } }) {
      const res: AxiosResponse = await query(param);

      if (res.data.errors) {
        return res.data;
      }
      this.setNodeMetricValue(res.data.data);
      return res.data;
    },
    async getNodeExpressionValue(param: { queryStr: string; conditions: { [key: string]: unknown } }) {
      const res: AxiosResponse = await query(param);

      if (res.data.errors) {
        return res.data;
      }

      return res.data;
    },
    async getLinkClientMetrics(linkClientMetrics: string[]) {
      if (!linkClientMetrics.length) {
        this.setLinkClientMetrics({});
        return;
      }
      const idsC = this.calls.filter((i: Call) => i.detectPoints.includes("CLIENT")).map((b: Call) => b.id);
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
      const idsS = this.calls.filter((i: Call) => i.detectPoints.includes("SERVER")).map((b: Call) => b.id);
      if (!idsS.length) {
        return;
      }
      const param = await useQueryTopologyMetrics(linkServerMetrics, idsS);
      const res = await this.getCallServerMetrics(param);

      if (res.errors) {
        ElMessage.error(res.errors);
      }
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
      const { getExpressionQuery, handleExpressionValues } = useQueryTopologyExpressionsProcessor(expressions, calls);
      const param = getExpressionQuery();
      const res = await this.getNodeExpressionValue(param);
      if (res.errors) {
        ElMessage.error(res.errors);
        return;
      }
      const metrics = handleExpressionValues(res.data);
      if (type === "SERVER") {
        this.setLinkServerMetrics(metrics);
      } else {
        this.setLinkClientMetrics(metrics);
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
    async queryNodeExpressions(expressions: string[]) {
      if (!expressions.length) {
        this.setNodeMetricValue({});
        return;
      }
      if (!this.nodes.length) {
        this.setNodeMetricValue({});
        return;
      }
      const { getExpressionQuery, handleExpressionValues } = useQueryTopologyExpressionsProcessor(
        expressions,
        this.nodes,
      );
      const param = getExpressionQuery();
      const res = await this.getNodeExpressionValue(param);
      if (res.errors) {
        ElMessage.error(res.errors);
        return;
      }
      const metrics = handleExpressionValues(res.data);
      this.setNodeMetricValue(metrics);
    },
    async getLegendMetrics(param: { queryStr: string; conditions: { [key: string]: unknown } }) {
      const res: AxiosResponse = await query(param);

      if (res.data.errors) {
        return res.data;
      }
      const data = res.data.data;
      const metrics = Object.keys(data);
      this.nodes = this.nodes.map((d: Node & Recordable) => {
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
    async getCallServerMetrics(param: { queryStr: string; conditions: { [key: string]: unknown } }) {
      const res: AxiosResponse = await query(param);

      if (res.data.errors) {
        return res.data;
      }
      this.setLinkServerMetrics(res.data.data);
      return res.data;
    },
    async getCallClientMetrics(param: { queryStr: string; conditions: { [key: string]: unknown } }) {
      const res: AxiosResponse = await query(param);

      if (res.data.errors) {
        return res.data;
      }
      this.setLinkClientMetrics(res.data.data);
      return res.data;
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
      const res: AxiosResponse = await graphql
        .query("getHierarchyServiceTopology")
        .params({ serviceId: id, layer: layer });
      if (res.data.errors) {
        return res.data;
      }
      const resp = await this.getListLayerLevels();
      if (resp.errors) {
        return resp;
      }
      const levels = resp.data.levels || [];
      this.setHierarchyServiceTopology(res.data.data.hierarchyServiceTopology || {}, levels);
      return res.data;
    },
    async getListLayerLevels() {
      const res: AxiosResponse = await graphql.query("queryListLayerLevels").params({});

      return res.data;
    },
    async getHierarchyInstanceTopology() {
      const { currentPod } = useSelectorStore();
      const dashboardStore = useDashboardStore();

      if (!(currentPod && dashboardStore.layerId)) {
        return new Promise((resolve) => resolve({}));
      }
      const res: AxiosResponse = await graphql
        .query("getHierarchyInstanceTopology")
        .params({ instanceId: currentPod.id, layer: dashboardStore.layerId });
      if (res.data.errors) {
        return res.data;
      }
      const resp = await this.getListLayerLevels();
      if (resp.errors) {
        return resp;
      }
      const levels = resp.data.levels || [];
      this.setHierarchyInstanceTopology(res.data.data.hierarchyInstanceTopology || {}, levels);
      return res.data;
    },
    async queryHierarchyExpressions(expressions: string[], nodes: Node[]) {
      const { getExpressionQuery, handleExpressionValues } = useQueryTopologyExpressionsProcessor(expressions, nodes);
      const param = getExpressionQuery();
      const res = await this.getNodeExpressionValue(param);
      if (res.errors) {
        ElMessage.error(res.errors);
        return;
      }
      const metrics = handleExpressionValues(res.data);
      return metrics;
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
      const metrics = await this.queryHierarchyExpressions(expressions, nodes);
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
      const metrics = await this.queryHierarchyExpressions(expressions, nodes);
      this.setHierarchyInstanceNodeMetricValue(metrics, layer);
    },
  },
});

export function useTopologyStore(): Recordable {
  return topologyStore(store);
}
