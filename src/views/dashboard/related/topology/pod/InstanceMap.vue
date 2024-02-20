<!-- Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. -->
<template>
  <div
    class="hierarchy-services-topo"
    v-loading="loading"
    element-loading-background="rgba(0, 0, 0, 0)"
    :style="`height: ${height}px`"
  >
    <Graph
      :nodes="topologyStore.hierarchyInstanceNodes"
      :calls="topologyStore.hierarchyInstanceCalls"
      :entity="EntityType[3].value"
      @getNodeMetrics="getNodeMetrics"
      @showNodeTip="showNodeTip"
      @handleNodeClick="handleNodeClick"
      @hideTip="hideTip"
    />
    <div id="popover"></div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted, nextTick } from "vue";
  import * as d3 from "d3";
  import type { HierarchyNode } from "@/types/topology";
  import { useTopologyStore } from "@/store/modules/topology";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { EntityType, ConfigFieldTypes } from "@/views/dashboard/data";
  import router from "@/router";
  import { ElMessage } from "element-plus";
  import type { MetricConfigOpt } from "@/types/dashboard";
  import { aggregation } from "@/hooks/useMetricsProcessor";
  import getDashboard from "@/hooks/useDashboardsSession";
  import Graph from "../components/Graph.vue";

  /*global Nullable*/
  const topologyStore = useTopologyStore();
  const dashboardStore = useDashboardStore();
  const height = ref<number>(100);
  const loading = ref<boolean>(false);
  const popover = ref<Nullable<any>>(null);

  onMounted(async () => {
    await nextTick();
    init();
  });

  getTopology();

  async function init() {
    const dom = document.querySelector(".hierarchy-related")?.getBoundingClientRect() || {
      height: 80,
      width: 0,
    };
    height.value = dom.height - 80;
    popover.value = d3.select("#popover");
  }

  async function getTopology() {
    loading.value = true;
    const resp = await topologyStore.getHierarchyInstanceTopology();
    loading.value = false;

    if (resp && resp.errors) {
      ElMessage.error(resp.errors);
    }
  }

  async function getNodeMetrics() {
    const layerList = [];
    const layerMap = new Map();
    for (const n of topologyStore.hierarchyInstanceNodes) {
      if (layerMap.get(n.layer)) {
        const arr = layerMap.get(n.layer);
        arr.push(n);
        layerMap.set(n.layer, arr);
      } else {
        layerMap.set(n.layer, [n]);
      }
    }
    for (const d of layerMap.values()) {
      layerList.push(d);
    }
    for (const list of layerList) {
      const { dashboard } = getDashboard(
        {
          layer: list[0].layer || "",
          entity: EntityType[3].value,
        },
        ConfigFieldTypes.ISDEFAULT,
      );
      const exp = (dashboard && dashboard.expressions) || [];
      await topologyStore.queryHierarchyInstanceNodeExpressions(exp, list[0].layer);
    }
  }

  function showNodeTip(event: MouseEvent, data: HierarchyNode) {
    if (!data) {
      return;
    }
    if (!popover.value) {
      return;
    }
    const dashboard =
      getDashboard(
        {
          layer: data.layer || "",
          entity: EntityType[3].value,
        },
        ConfigFieldTypes.ISDEFAULT,
      ).dashboard || {};
    const exprssions = dashboard.expressions || [];
    const nodeMetricConfig = dashboard.expressionsConfig || [];
    const html = exprssions.map((m: string, index: number) => {
      const metric =
        topologyStore.hierarchyInstanceNodeMetrics[data.layer || ""][m].values.find(
          (val: { id: string; value: unknown }) => val.id === data.id,
        ) || {};
      const opt: MetricConfigOpt = nodeMetricConfig[index] || {};
      const v = aggregation(metric.value, opt);
      return ` <div class="mb-5"><span class="grey">${opt.label || m}: </span>${v} ${opt.unit || ""}</div>`;
    });
    const tipHtml = [
      `<div class="mb-5"><span class="grey">name: </span>${data.name}</div><div class="mb-5"><span class="grey">layer: </span>${data.layer}</div>`,
      ...html,
    ].join(" ");

    popover.value
      .style("top", event.offsetY + 10 + "px")
      .style("left", event.offsetX + 10 + "px")
      .style("visibility", "visible")
      .html(tipHtml);
  }

  function hideTip() {
    popover.value.style("visibility", "hidden");
  }

  function handleNodeClick(event: MouseEvent, d: HierarchyNode & { serviceId: string }) {
    const origin = dashboardStore.entity;
    event.stopPropagation();
    hideTip();
    const { dashboard } = getDashboard(
      {
        layer: d.layer || "",
        entity: EntityType[3].value,
      },
      ConfigFieldTypes.ISDEFAULT,
    );
    if (!dashboard) {
      return;
    }
    const name = dashboard.name;
    const path = `/dashboard/${dashboard.layer}/${EntityType[3].value}/${d.serviceId}/${d.key}/${name}`;
    const routeUrl = router.resolve({ path });

    window.open(routeUrl.href, "_blank");
    dashboardStore.setEntity(origin);
  }
</script>
<style lang="scss" scoped>
  @import url("../style.scss");
</style>
