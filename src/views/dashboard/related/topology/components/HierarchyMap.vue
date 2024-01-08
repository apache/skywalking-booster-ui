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
    <svg class="hierarchy-services-svg" :width="width" :height="height" @click="svgEvent">
      <g class="hierarchy-services-graph" :transform="`translate(${diff[0]}, ${diff[1]})`">
        <g
          class="topo-node"
          v-for="(n, index) in topologyLayout.nodes"
          :key="index"
          @mouseout="hideTip"
          @mouseover="showNodeTip($event, n)"
          @click="handleNodeClick($event, n)"
          @mousedown="startMoveNode($event, n)"
          @mouseup="stopMoveNode($event)"
        >
          <image width="36" height="36" :x="n.x - 15" :y="n.y - 18" :href="getNodeStatus(n)" />
          <image width="28" height="25" :x="n.x - 14" :y="n.y - 43" :href="icons.LOCAL" style="opacity: 0.8" />
          <image
            width="12"
            height="12"
            :x="n.x - 6"
            :y="n.y - 38"
            :href="!n.type || n.type === `N/A` ? icons.UNDEFINED : icons[n.type.toUpperCase().replace('-', '')]"
          />
          <text
            class="node-text"
            :x="n.x - (Math.min(n.name.length, 20) * 6) / 2 + 6"
            :y="n.y + n.height + 8"
            style="pointer-events: none"
          >
            {{ n.name.length > 20 ? `${n.name.substring(0, 20)}...` : n.name }}
          </text>
        </g>
        <g v-for="(l, index) in topologyLayout.calls" :key="index">
          <path
            class="topo-line"
            :d="`M${l.sourceX} ${l.sourceY} L${l.targetX} ${l.targetY}`"
            stroke="#97B0F8"
            marker-end="url(#arrow)"
          />
        </g>
        <g class="arrows">
          <defs v-for="(_, index) in topologyLayout.calls" :key="index">
            <marker
              id="arrow"
              markerUnits="strokeWidth"
              markerWidth="16"
              markerHeight="16"
              viewBox="0 0 12 12"
              refX="10"
              refY="6"
              orient="auto"
            >
              <path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#97B0F8" />
            </marker>
          </defs>
        </g>
      </g>
    </svg>
    <div id="popover"></div>
  </div>
</template>
<script lang="ts" setup>
  import type { PropType } from "vue";
  import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from "vue";
  import { useI18n } from "vue-i18n";
  import * as d3 from "d3";
  import type { Node, Call } from "@/types/topology";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useTopologyStore } from "@/store/modules/topology";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { EntityType, MetricModes } from "../../../data";
  import router from "@/router";
  import { ElMessage } from "element-plus";
  import type { Service } from "@/types/selector";
  import { useAppStoreWithOut } from "@/store/modules/app";
  // import getDashboard from "@/hooks/useDashboardsSession";
  import type { MetricConfigOpt } from "@/types/dashboard";
  import { aggregation } from "@/hooks/useMetricsProcessor";
  import icons from "@/assets/img/icons";
  import { useQueryTopologyMetrics } from "@/hooks/useMetricsProcessor";
  import { layout, changeNode, computeLevels } from "./utils/layout";
  import zoom from "../../components/utils/zoom";
  import { useQueryTopologyExpressionsProcessor } from "@/hooks/useExpressionsProcessor";

  /*global Nullable, defineProps */
  const props = defineProps({
    config: {
      type: Object as PropType<any>,
      default: () => ({ graph: {} }),
    },
  });
  const { t } = useI18n();
  const selectorStore = useSelectorStore();
  const topologyStore = useTopologyStore();
  const dashboardStore = useDashboardStore();
  const appStore = useAppStoreWithOut();
  const height = ref<number>(100);
  const width = ref<number>(100);
  const loading = ref<boolean>(false);
  const svg = ref<Nullable<any>>(null);
  const graph = ref<Nullable<any>>(null);
  const settings = ref<any>(props.config);
  const graphConfig = computed(() => props.config.graph || {});
  const depth = ref<number>(graphConfig.value.depth || 2);
  const topologyLayout = ref<any>({});
  const popover = ref<Nullable<any>>(null);
  const graphWidth = ref<number>(100);
  const currentNode = ref<Nullable<Node>>(null);
  const diff = computed(() => [(width.value - graphWidth.value) / 2, 0]);
  const radius = 8;

  onMounted(async () => {
    await nextTick();
    setTimeout(() => {
      init();
    }, 10);
  });
  async function init() {
    const dom = document.querySelector(".hierarchy-related")?.getBoundingClientRect() || {
      height: 80,
      width: 0,
    };
    height.value = dom.height - 80;
    width.value = dom.width;
    svg.value = d3.select(".hierarchy-services-svg");
    graph.value = d3.select(".hierarchy-services-graph");
    loading.value = true;
    const json = await selectorStore.fetchServices(dashboardStore.layerId);
    if (json.errors) {
      ElMessage.error(json.errors);
      return;
    }
    await freshNodes();
    svg.value.call(zoom(d3, graph.value, diff.value));
  }
  async function freshNodes() {
    topologyStore.setNode(null);
    topologyStore.setLink(null);
    const resp = await getTopology();
    loading.value = false;

    if (resp && resp.errors) {
      ElMessage.error(resp.errors);
    }
    await update();
  }

  async function update() {
    window.addEventListener("resize", resize);
    await initLegendMetrics();
    draw();
    popover.value = d3.select("#popover");
  }

  function draw() {
    const levels = computeLevels(topologyStore.calls, topologyStore.nodes, []);

    topologyLayout.value = layout(levels, topologyStore.calls, radius);
    graphWidth.value = topologyLayout.value.layout.width;
    const drag: any = d3.drag().on("drag", (d: { x: number; y: number }) => {
      topologyLayout.value.calls = changeNode(d, currentNode.value, topologyLayout.value, radius);
    });
    setTimeout(() => {
      d3.selectAll(".topo-node").call(drag);
    }, 1000);
  }

  function startMoveNode(event: MouseEvent, d: Node) {
    event.stopPropagation();
    currentNode.value = d;
  }
  function stopMoveNode(event: MouseEvent) {
    event.stopPropagation();
    currentNode.value = null;
  }

  async function initLegendMetrics() {
    if (!topologyStore.nodes.length) {
      return;
    }
    if (settings.value.metricMode === MetricModes.Expression) {
      const expression = props.config.legendMQE && props.config.legendMQE.expression;
      if (!expression) {
        return;
      }
      const { getExpressionQuery } = useQueryTopologyExpressionsProcessor([expression], topologyStore.nodes);
      const param = getExpressionQuery();
      const res = await topologyStore.getNodeExpressionValue(param);
      if (res.errors) {
        ElMessage.error(res.errors);
      } else {
        topologyStore.setLegendValues([expression], res.data);
      }
    } else {
      const names = props.config.legend.map((d: any) => d.name);
      if (!names.length) {
        return;
      }
      const ids = topologyStore.nodes.map((d: Node) => d.id);
      if (ids.length) {
        const param = await useQueryTopologyMetrics(names, ids);
        const res = await topologyStore.getLegendMetrics(param);
        if (res.errors) {
          ElMessage.error(res.errors);
        }
      }
    }
  }

  function getNodeStatus(d: any) {
    const { legend, legendMQE } = settings.value;
    if (settings.value.metricMode === MetricModes.Expression) {
      if (!legendMQE) {
        return icons.CUBE;
      }
      if (!legendMQE.expression) {
        return icons.CUBE;
      }
      return Number(d[legendMQE.expression]) && d.isReal ? icons.CUBEERROR : icons.CUBE;
    }
    if (!legend) {
      return icons.CUBE;
    }
    if (!legend.length) {
      return icons.CUBE;
    }
    let c = true;
    for (const l of legend) {
      if (l.condition === "<") {
        c = c && d[l.name] < Number(l.value);
      } else {
        c = c && d[l.name] > Number(l.value);
      }
    }
    return c && d.isReal ? icons.CUBEERROR : icons.CUBE;
  }
  function showNodeTip(event: MouseEvent, data: Node) {
    const nodeMetrics: string[] =
      (settings.value.metricMode === MetricModes.Expression
        ? settings.value.nodeExpressions
        : settings.value.nodeMetrics) || [];
    const nodeMetricConfig = settings.value.nodeMetricConfig || [];
    const html = nodeMetrics.map((m, index) => {
      const metric =
        topologyStore.nodeMetricValue[m].values.find((val: { id: string; value: unknown }) => val.id === data.id) || {};
      const opt: MetricConfigOpt = nodeMetricConfig[index] || {};
      const v = aggregation(metric.value, opt);
      return ` <div class="mb-5"><span class="grey">${opt.label || m}: </span>${v} ${opt.unit || "unknown"}</div>`;
    });
    const tipHtml = [
      `<div class="mb-5"><span class="grey">name: </span>${
        data.name
      }</div><div class="mb-5"><span class="grey">type: </span>${data.type || "UNKNOWN"}</div>`,
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

  function handleNodeClick(event: MouseEvent, d: Node & { x: number; y: number }) {
    event.stopPropagation();
    hideTip();
    topologyStore.setNode(d);
    topologyStore.setLink(null);
    handleGoDashboard(d.name);
  }
  function handleGoDashboard(name: string) {
    const path = `/dashboard/${dashboardStore.layerId}/${EntityType[0].value}/${topologyStore.node.id}/${name}`;
    const routeUrl = router.resolve({ path });

    window.open(routeUrl.href, "_blank");
    dashboardStore.setEntity(origin);
  }

  async function getTopology() {
    const ids = selectorStore.services.map((d: Service) => d.id);
    const serviceIds = dashboardStore.entity === EntityType[0].value ? [selectorStore.currentService.id] : ids;
    const resp = await topologyStore.getDepthServiceTopology(serviceIds, Number(depth.value));
    return resp;
  }
  function resize() {
    const dom = document.querySelector(".hierarchy-related")?.getBoundingClientRect() || {
      height: 40,
      width: 0,
    };
    height.value = dom.height - 80;
    width.value = dom.width;
  }
  function svgEvent() {
    topologyStore.setNode(null);
    topologyStore.setLink(null);
    dashboardStore.selectWidget(props.config);
  }

  onBeforeUnmount(() => {
    window.removeEventListener("resize", resize);
  });
  watch(
    () => appStore.durationTime,
    () => {
      if (dashboardStore.entity === EntityType[1].value) {
        freshNodes();
      }
    },
  );
</script>
<style lang="scss" scoped>
  .hierarchy-services-topo {
    position: relative;

    .relation-btn {
      position: absolute;
      cursor: pointer;
      top: 50px;
      left: 700px;
      font-size: 12px;
      color: var(--sw-topology-color);
    }

    .node-text {
      fill: var(--sw-topology-color);
      font-size: 12px;
      opacity: 0.9;
    }

    .hierarchy-services-svg {
      cursor: move;
      background-color: var(--el-bg-color);
    }

    .legend {
      position: absolute;
      top: 10px;
      left: 25px;
      color: var(--sw-topology-color);

      div {
        margin-bottom: 8px;
      }

      img {
        width: 32px;
        float: left;
      }

      span {
        display: inline-block;
        height: 32px;
        line-height: 32px;
        margin-left: 5px;
      }
    }

    .setting {
      position: absolute;
      top: 80px;
      right: 10px;
      width: 400px;
      height: 600px;
      overflow: auto;
      padding: 0 15px;
      border-radius: 3px;
      color: $disabled-color;
      border: 1px solid $border-color-primary;
      background-color: var(--sw-topology-setting-bg);
      box-shadow: var(--sw-topology-box-shadow);
      transition: all 0.5ms linear;
    }

    .label {
      color: var(--sw-topology-color);
      display: inline-block;
      margin-right: 5px;
    }

    .operations-list {
      position: absolute;
      color: $font-color;
      cursor: pointer;
      border: var(--sw-topology-border);
      border-radius: 3px;
      background-color: $theme-background;
      padding: 10px 0;

      span {
        display: block;
        height: 30px;
        line-height: 30px;
        text-align: left;
        padding: 0 15px;
      }

      span:hover {
        color: $active-color;
        background-color: $popper-hover-bg-color;
      }
    }

    .tool {
      position: absolute;
      top: 35px;
      right: 10px;
    }

    .switch-icon {
      cursor: pointer;
      transition: all 0.5ms linear;
      background: var(--sw-topology-switch-icon);
      color: $text-color;
      display: inline-block;
      padding: 2px 4px;
      border-radius: 3px;
    }

    .topo-line {
      stroke-linecap: round;
      stroke-width: 1px;
      stroke-dasharray: 10 10;
      fill: none;
      animation: var(--sw-topo-animation);
    }

    .topo-line-anchor,
    .topo-node {
      cursor: pointer;
    }
  }

  .el-loading-spinner {
    top: 30%;
  }

  #popover {
    position: absolute;
    visibility: hidden;
    padding: 5px;
    border: var(--sw-topology-border);
    border-radius: 3px;
    background-color: $theme-background;
  }
</style>
