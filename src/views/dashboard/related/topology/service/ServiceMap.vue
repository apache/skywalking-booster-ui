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
  <div ref="chart" class="micro-topo-chart" v-loading="loading" :style="`height: ${height}px`">
    <svg class="svg-topology" :width="width - 100" :height="height" @click="svgEvent">
      <g class="svg-graph" :transform="`translate(${diff[0]}, ${diff[1]})`">
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
          <circle
            class="topo-line-anchor"
            :cx="(l.sourceX + l.targetX) / 2"
            :cy="(l.sourceY + l.targetY) / 2"
            r="4"
            fill="#97B0F8"
            @click="handleLinkClick($event, l)"
            @mouseover="showLinkTip($event, l)"
            @mouseout="hideTip"
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
    <div id="tooltip"></div>
    <div class="legend">
      <div>
        <img :src="icons.CUBE" />
        <span>
          {{ settings.description ? settings.description.healthy || "" : "" }}
        </span>
      </div>
      <div>
        <img :src="icons.CUBEERROR" />
        <span>
          {{ settings.description ? settings.description.unhealthy || "" : "" }}
        </span>
      </div>
    </div>
    <div class="setting" v-if="showSetting && dashboardStore.editMode">
      <Settings @update="updateSettings" @updateNodes="freshNodes" />
    </div>
    <div class="tool">
      <span v-show="graphConfig.showDepth">
        <span class="label">{{ t("currentDepth") }}</span>
        <Selector class="inputs" :value="depth" :options="DepthList" @change="changeDepth" />
      </span>
      <span class="switch-icon ml-5" title="Settings" @click="setConfig" v-if="dashboardStore.editMode">
        <Icon size="middle" iconName="settings" />
      </span>
      <span class="switch-icon ml-5" title="Back to overview topology" @click="backToTopology">
        <Icon size="middle" iconName="keyboard_backspace" />
      </span>
    </div>
    <div
      class="operations-list"
      v-if="topologyStore.node"
      :style="{
        top: operationsPos.y + 5 + 'px',
        left: operationsPos.x + 5 + 'px',
      }"
    >
      <span v-for="(item, index) of items" :key="index" @click="item.func(item)">
        {{ item.title }}
      </span>
    </div>
    <el-dialog
      v-model="hierarchyRelated"
      :title="getHierarchyTitle()"
      :destroy-on-close="true"
      @closed="hierarchyRelated = false"
      width="640px"
    >
      <div class="hierarchy-related">
        <hierarchy-map :config="config" />
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
  import type { PropType } from "vue";
  import { ref, onMounted, onBeforeUnmount, reactive, watch, computed, nextTick } from "vue";
  import { useI18n } from "vue-i18n";
  import * as d3 from "d3";
  import type { Node, Call } from "@/types/topology";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useTopologyStore } from "@/store/modules/topology";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { EntityType, DepthList, MetricModes, CallTypes } from "@/views/dashboard/data";
  import router from "@/router";
  import { ElMessage } from "element-plus";
  import Settings from "../config/Settings.vue";
  import HierarchyMap from "./HierarchyMap.vue";
  import type { Option } from "@/types/app";
  import type { Service } from "@/types/selector";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import getDashboard from "@/hooks/useDashboardsSession";
  import type { MetricConfigOpt } from "@/types/dashboard";
  import { aggregation } from "@/hooks/useMetricsProcessor";
  import icons from "@/assets/img/icons";
  import { useQueryTopologyMetrics } from "@/hooks/useMetricsProcessor";
  import { layout, computeLevels, changeNode } from "../components/utils/layout";
  import zoom from "@/views/dashboard/related/components/utils/zoom";
  import { useQueryTopologyExpressionsProcessor } from "@/hooks/useExpressionsProcessor";
  import { ConfigFieldTypes } from "@/views/dashboard/data";
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
  const chart = ref<Nullable<HTMLDivElement>>(null);
  const showSetting = ref<boolean>(false);
  const settings = ref<any>(props.config);
  const operationsPos = reactive<{ x: number; y: number }>({ x: NaN, y: NaN });
  const items = ref<{ id: string; title: string; func: any; dashboard?: string }[]>([]);
  const graphConfig = computed(() => props.config.graph || {});
  const depth = ref<number>(graphConfig.value.depth || 2);
  const topologyLayout = ref<any>({});
  const tooltip = ref<Nullable<any>>(null);
  const graphWidth = ref<number>(100);
  const currentNode = ref<Nullable<Node>>(null);
  const diff = computed(() => [(width.value - graphWidth.value - 130) / 2, 100]);
  const hierarchyRelated = ref<boolean>(false);
  const radius = 8;

  onMounted(async () => {
    await nextTick();
    setTimeout(() => {
      init();
    }, 10);
  });
  async function init() {
    const dom = document.querySelector(".topology")?.getBoundingClientRect() || {
      height: 40,
      width: 0,
    };
    height.value = dom.height - 40;
    width.value = dom.width;
    svg.value = d3.select(".svg-topology");
    graph.value = d3.select(".svg-graph");
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
    loading.value = true;
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
    if (settings.value.metricMode === MetricModes.Expression) {
      topologyStore.queryNodeExpressions(settings.value.nodeExpressions || []);
      topologyStore.getLinkExpressions(settings.value.linkClientExpressions || [], CallTypes.Client);
      topologyStore.getLinkExpressions(settings.value.linkServerExpressions || [], CallTypes.Server);
    } else {
      topologyStore.queryNodeMetrics(settings.value.nodeMetrics || []);
      topologyStore.getLinkClientMetrics(settings.value.linkClientMetrics || []);
      topologyStore.getLinkServerMetrics(settings.value.linkServerMetrics || []);
    }

    window.addEventListener("resize", resize);
    await initLegendMetrics();
    draw();
    tooltip.value = d3.select("#tooltip");
    setNodeTools(settings.value.nodeDashboard);
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

  function getHierarchyTitle() {
    if (!currentNode.value) {
      return;
    }
    if (currentNode.value.layers.includes(dashboardStore.layerId)) {
      return `${dashboardStore.layerId} --> ${currentNode.value.name}`;
    }
    const layer = currentNode.value.layers.filter((d: string) => d !== dashboardStore.layerId);
    if (layer.length) {
      return `${layer[0]} --> ${currentNode.value.name}`;
    }
    return "";
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
        (topologyStore.nodeMetricValue[m] &&
          topologyStore.nodeMetricValue[m].values.find((val: { id: string; value: unknown }) => val.id === data.id)) ||
        {};
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

    tooltip.value
      .style("top", event.offsetY + 10 + "px")
      .style("left", event.offsetX + 10 + "px")
      .style("visibility", "visible")
      .html(tipHtml);
  }
  function showLinkTip(event: MouseEvent, data: Call) {
    const linkClientMetrics: string[] =
      settings.value.metricMode === MetricModes.Expression
        ? settings.value.linkClientExpressions
        : settings.value.linkClientMetrics || [];
    const linkServerMetricConfig: MetricConfigOpt[] = settings.value.linkServerMetricConfig || [];
    const linkClientMetricConfig: MetricConfigOpt[] = settings.value.linkClientMetricConfig || [];
    const linkServerMetrics: string[] =
      settings.value.metricMode === MetricModes.Expression
        ? settings.value.linkServerExpressions
        : settings.value.linkServerMetrics || [];
    const htmlServer = linkServerMetrics.map((m, index) => {
      const metric = topologyStore.linkServerMetrics[m].values.find(
        (val: { id: string; value: unknown }) => val.id === data.id,
      );
      if (metric) {
        const opt: MetricConfigOpt = linkServerMetricConfig[index] || {};
        const v = aggregation(metric.value, opt);
        return ` <div class="mb-5"><span class="grey">${opt.label || m}: </span>${v} ${opt.unit || ""}</div>`;
      }
    });
    const htmlClient = linkClientMetrics.map((m: string, index: number) => {
      const opt: MetricConfigOpt = linkClientMetricConfig[index] || {};
      const metric = topologyStore.linkClientMetrics[m].values.find(
        (val: { id: string; value: unknown }) => val.id === data.id,
      );
      if (metric) {
        const v = aggregation(metric.value, opt);
        return ` <div class="mb-5"><span class="grey">${opt.label || m}: </span>${v} ${opt.unit || ""}</div>`;
      }
    });
    const html = [
      ...htmlServer,
      ...htmlClient,
      `<div><span class="grey">${t("detectPoint")}:</span>${data.detectPoints.join(" | ")}</div>`,
    ].join(" ");

    tooltip.value
      .style("top", event.offsetY + "px")
      .style("left", event.offsetX + "px")
      .style("visibility", "visible")
      .html(html);
  }

  function hideTip() {
    tooltip.value.style("visibility", "hidden");
  }
  function handleNodeClick(event: MouseEvent, d: Node & { x: number; y: number }) {
    event.stopPropagation();
    hideTip();
    topologyStore.setNode(d);
    topologyStore.setLink(null);
    operationsPos.x = event.offsetX;
    operationsPos.y = event.offsetY;
    if (d.layers.includes(dashboardStore.layerId)) {
      setNodeTools(settings.value.nodeDashboard);
      return;
    }
    initNodeMenus();
  }
  function handleLinkClick(event: MouseEvent, d: Call) {
    event.stopPropagation();
    if (!d.sourceObj.layers.includes(dashboardStore.layerId) || !d.targetObj.layers.includes(dashboardStore.layerId)) {
      return;
    }
    topologyStore.setNode(null);
    topologyStore.setLink(d);
    if (!settings.value.linkDashboard) {
      return;
    }
    const origin = dashboardStore.entity;
    const e = dashboardStore.entity === EntityType[1].value ? EntityType[0].value : dashboardStore.entity;
    const { dashboard } = getDashboard({
      name: settings.value.linkDashboard,
      layer: dashboardStore.layerId,
      entity: `${e}Relation`,
    });
    if (!dashboard) {
      ElMessage.error(`The dashboard named ${settings.value.linkDashboard} doesn't exist`);
      return;
    }
    dashboardStore.setEntity(dashboard.entity);
    const path = `/dashboard/related/${dashboard.layer}/${e}Relation/${d.sourceObj.id}/${d.targetObj.id}/${dashboard.name}`;
    const routeUrl = router.resolve({ path });
    window.open(routeUrl.href, "_blank");
    dashboardStore.setEntity(origin);
  }
  async function handleHierarchyRelatedServices() {
    hierarchyRelated.value = true;
  }
  async function handleInspect() {
    const id = topologyStore.node.id;
    loading.value = true;
    const resp = await topologyStore.getDepthServiceTopology([id], Number(depth.value));
    loading.value = false;
    if (resp && resp.errors) {
      ElMessage.error(resp.errors);
    }
    await update();
    topologyStore.setNode(null);
    topologyStore.setLink(null);
  }
  function handleGoEndpoint(params: { dashboard: string }) {
    if (!params.dashboard) {
      return;
    }
    const origin = dashboardStore.entity;
    const path = `/dashboard/${dashboardStore.layerId}/${EntityType[2].value}/${topologyStore.node.id}/${params.dashboard}`;
    const routeUrl = router.resolve({ path });

    window.open(routeUrl.href, "_blank");
    dashboardStore.setEntity(origin);
  }
  function handleGoInstance(params: { dashboard: string }) {
    if (!params.dashboard) {
      return;
    }
    const origin = dashboardStore.entity;
    const path = `/dashboard/${dashboardStore.layerId}/${EntityType[3].value}/${topologyStore.node.id}/${params.dashboard}`;
    const routeUrl = router.resolve({ path });

    window.open(routeUrl.href, "_blank");
    dashboardStore.setEntity(origin);
  }
  function handleGoDashboard(params: { dashboard: string }) {
    if (!params.dashboard) {
      return;
    }
    const origin = dashboardStore.entity;
    const path = `/dashboard/${dashboardStore.layerId}/${EntityType[0].value}/${topologyStore.node.id}/${params.dashboard}`;
    const routeUrl = router.resolve({ path });

    window.open(routeUrl.href, "_blank");
    dashboardStore.setEntity(origin);
  }
  function handleGoAlerting() {
    const path = `/alerting`;
    const routeUrl = router.resolve({ path });

    window.open(routeUrl.href, "_blank");
  }
  function handleGoLayerDashboard(param: { id: string }) {
    if (!(param.id && currentNode.value)) {
      return;
    }
    const origin = dashboardStore.entity;
    const { dashboard } = getDashboard(
      {
        layer: param.id,
        entity: EntityType[0].value,
      },
      ConfigFieldTypes.ISDEFAULT,
    );
    if (!dashboard) {
      return ElMessage.info("No Dashboard");
    }

    const path = `/dashboard/${param.id}/${EntityType[0].value}/${currentNode.value.id}/${dashboard.name}`;
    const routeUrl = router.resolve({ path });

    window.open(routeUrl.href, "_blank");
    dashboardStore.setEntity(origin);
  }
  async function backToTopology() {
    loading.value = true;
    await freshNodes();
    topologyStore.setNode(null);
    topologyStore.setLink(null);
  }
  async function getTopology() {
    const ids = selectorStore.services.map((d: Service) => d.id);
    const serviceIds = dashboardStore.entity === EntityType[0].value ? [selectorStore.currentService.id] : ids;
    const resp = await topologyStore.getDepthServiceTopology(serviceIds, Number(depth.value));
    return resp;
  }
  function setConfig() {
    showSetting.value = !showSetting.value;
    dashboardStore.selectWidget(props.config);
  }
  function resize() {
    const dom = document.querySelector(".topology")?.getBoundingClientRect() || {
      height: 40,
      width: 0,
    };
    height.value = dom.height - 40;
    width.value = dom.width;
  }
  function updateSettings(config: any) {
    settings.value = config;
    setNodeTools(config.nodeDashboard);
  }
  function initNodeMenus() {
    items.value = [
      { id: "hierarchyServices", title: "Hierarchy Services", func: handleHierarchyRelatedServices },
      { id: "inspect", title: "Inspect", func: handleInspect },
      { id: "alerting", title: "Alerting", func: handleGoAlerting },
    ];
    if (!currentNode.value) {
      return;
    }
    const diffLayers = currentNode.value.layers.filter((l: string) => l !== dashboardStore.layerId);
    for (const l of diffLayers) {
      items.value.push({
        id: l,
        title: `${l} Dashboard`,
        func: handleGoLayerDashboard,
      });
    }
  }
  function setNodeTools(nodeDashboard: any) {
    initNodeMenus();
    if (!(nodeDashboard && nodeDashboard.length)) {
      return;
    }
    for (const item of nodeDashboard) {
      if (item.scope === EntityType[0].value) {
        items.value.push({
          id: "dashboard",
          title: "Service Dashboard",
          func: handleGoDashboard,
          ...item,
        });
      }
      if (item.scope === EntityType[2].value) {
        items.value.push({
          id: "endpoint",
          title: "Endpoint Dashboard",
          func: handleGoEndpoint,
          ...item,
        });
      }
      if (item.scope === EntityType[3].value) {
        items.value.push({
          id: "instance",
          title: "Service Instance Dashboard",
          func: handleGoInstance,
          ...item,
        });
      }
    }
  }
  function svgEvent() {
    topologyStore.setNode(null);
    topologyStore.setLink(null);
    dashboardStore.selectWidget(props.config);
  }

  async function changeDepth(opt: Option[] | any) {
    depth.value = opt[0].value;
    freshNodes();
  }
  onBeforeUnmount(() => {
    window.removeEventListener("resize", resize);
  });
  watch(
    () => [selectorStore.currentService, selectorStore.currentDestService],
    (newVal, oldVal) => {
      if (!(oldVal[0] && newVal[0])) {
        return;
      }
      freshNodes();
      hierarchyRelated.value = false;
    },
  );
  watch(
    () => appStore.durationTime,
    () => {
      if (dashboardStore.entity === EntityType[1].value) {
        freshNodes();
        hierarchyRelated.value = false;
      }
    },
  );
</script>
<style lang="scss" scoped>
  .hierarchy-related {
    height: 600px;
    width: 600px;
    overflow: hidden;
  }

  .micro-topo-chart {
    position: relative;
    overflow: auto;
    margin-top: 30px;

    .node-text {
      fill: var(--sw-topology-color);
      font-size: 12px;
      opacity: 0.9;
    }

    .svg-topology {
      cursor: move;
      background-color: $theme-background;
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

  #tooltip {
    position: absolute;
    visibility: hidden;
    padding: 5px;
    border: var(--sw-topology-border);
    border-radius: 3px;
    background-color: $theme-background;
  }
</style>
