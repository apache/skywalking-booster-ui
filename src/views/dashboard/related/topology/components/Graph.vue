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
    ref="chart"
    class="micro-topo-chart"
    v-loading="loading"
    element-loading-background="rgba(0, 0, 0, 0)"
    :style="`height: ${height}px`"
  >
    <svg ref="svg" :width="width - 100" :height="height" style="background-color: #fff" @click="svgEvent">
      <g
        v-for="(n, index) in topologyLayout.nodes"
        :key="index"
        @mouseout="hideTip"
        @mouseover="showNodeTip($event, n)"
        @click="handleNodeClick($event, n)"
        class="topo-node"
      >
        <circle class="node" r="18" stroke-width="6" :stroke="getNodeStatus(n)" fill="none" :cx="n.x" :cy="n.y" />
        <image
          width="18"
          height="18"
          :x="n.x - 8"
          :y="n.y - 10"
          :href="!n.type || n.type === `N/A` ? icons.UNDEFINED : icons[n.type.toUpperCase().replace('-', '')]"
        />
        <text :x="n.x - (n.name.length * 6) / 2" :y="n.y + n.height + 12" style="pointer-events: none">
          {{ n.name.length > 20 ? `${n.name.substring(0, 20)}...` : n.name }}
        </text>
      </g>
      <g v-for="(l, index) in topologyLayout.calls" :key="index">
        <path
          class="topo-line"
          :d="`M${l.sourceObj.x} ${l.sourceObj.y}
          L${l.targetObj.x} ${l.targetObj.y}`"
          stroke="#aaa"
          stroke-width="1"
          marker-end="url(#arrow)"
        />
        <circle
          class="topo-line-anchor"
          :cx="(l.sourceObj.x + l.targetObj.x) / 2"
          :cy="(l.sourceObj.y + l.targetObj.y) / 2"
          r="4"
          fill="#aaa"
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
            markerWidth="8"
            markerHeight="8"
            viewBox="0 0 12 12"
            refX="10"
            refY="6"
            orient="auto"
          >
            <path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#999" />
          </marker>
        </defs>
      </g>
      <circle class="node" r="10" stroke-width="4" stroke="#ed374d" :cx="34" :cy="65" fill="none" />
      <circle class="node" r="10" stroke-width="4" stroke="#72c59f" fill="none" :cx="35" :cy="25" />
    </svg>
    <div id="tooltip"></div>
    <div class="legend">
      <div>
        <span>
          {{ settings.description ? settings.description.healthy || "" : "" }}
        </span>
      </div>
      <div>
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
      <span v-for="(item, index) of items" :key="index" @click="item.func(item.dashboard)">
        {{ item.title }}
      </span>
    </div>
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
  import { EntityType, DepthList } from "../../../data";
  import router from "@/router";
  import { ElMessage } from "element-plus";
  import Settings from "./Settings.vue";
  import type { Option } from "@/types/app";
  import type { Service } from "@/types/selector";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import getDashboard from "@/hooks/useDashboardsSession";
  import type { MetricConfigOpt } from "@/types/dashboard";
  import { aggregation } from "@/hooks/useMetricsProcessor";
  import icons from "@/assets/img/icons";
  import { useQueryTopologyMetrics } from "@/hooks/useMetricsProcessor";
  import { layout } from "./utils/layout";

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
  const chart = ref<Nullable<HTMLDivElement>>(null);
  const showSetting = ref<boolean>(false);
  const settings = ref<any>(props.config);
  const operationsPos = reactive<{ x: number; y: number }>({ x: NaN, y: NaN });
  const items = ref<{ id: string; title: string; func: any; dashboard?: string }[]>([]);
  const graphConfig = computed(() => props.config.graph || {});
  const depth = ref<number>(graphConfig.value.depth || 2);
  const topologyLayout = ref<any>({});
  const tooltip = ref<Nullable<any>>(null);

  onMounted(async () => {
    await nextTick();
    init();
  });
  async function init() {
    const dom = document.querySelector(".topology")?.getBoundingClientRect() || {
      height: 40,
      width: 0,
    };
    height.value = dom.height - 40;
    width.value = dom.width;

    loading.value = true;
    const json = await selectorStore.fetchServices(dashboardStore.layerId);
    if (json.errors) {
      ElMessage.error(json.errors);
      return;
    }
    freshNodes();
  }
  async function freshNodes() {
    const resp = await getTopology();
    loading.value = false;

    if (resp && resp.errors) {
      ElMessage.error(resp.errors);
    }
    topologyStore.queryNodeMetrics(settings.value.nodeMetrics || []);
    topologyStore.getLinkClientMetrics(settings.value.linkClientMetrics || []);
    topologyStore.getLinkServerMetrics(settings.value.linkServerMetrics || []);
    // window.addEventListener("resize", resize);
    await initLegendMetrics();
    draw();
    tooltip.value = d3.select("#tooltip");
    setNodeTools(settings.value.nodeDashboard);
  }
  function draw() {
    const levels = [];
    const nodes = topologyStore.nodes.sort((a: any, b: any) => b.service_cpm - a.service_cpm);
    const index = nodes.findIndex((n: Node) => n.type === "USER");
    const key = index < 0 ? 0 : index;
    levels.push([nodes[key]]);
    nodes.splice(key, 1);
    for (const level of levels) {
      const a = [];
      for (const l of level) {
        for (const n of topologyStore.calls) {
          if (n.target === l.id) {
            const i = nodes.findIndex((d: Node) => d.id === n.source);
            if (i > -1) {
              a.push(nodes[i]);
              nodes.splice(i, 1);
            }
          }
          if (n.source === l.id) {
            const i = nodes.findIndex((d: Node) => d.id === n.target);
            if (i > -1) {
              a.push(nodes[i]);
              nodes.splice(i, 1);
            }
          }
        }
      }
      if (a.length) {
        levels.push(a);
      }
    }
    topologyLayout.value = layout(levels, topologyStore.calls);
  }

  async function initLegendMetrics() {
    const ids = topologyStore.nodes.map((d: Node) => d.id);
    const names = props.config.legend.map((d: any) => d.name);
    if (names.length && ids.length) {
      const param = await useQueryTopologyMetrics(names, ids);
      const res = await topologyStore.getLegendMetrics(param);
      if (res.errors) {
        ElMessage.error(res.errors);
      }
    }
  }
  function getNodeStatus(d: any) {
    const legend = settings.value.legend;
    if (!legend) {
      return "#72c59f";
    }
    if (!legend.length) {
      return "#72c59f";
    }
    let c = true;
    for (const l of legend) {
      if (l.condition === "<") {
        c = c && d[l.name] < Number(l.value);
      } else {
        c = c && d[l.name] > Number(l.value);
      }
    }
    return c && d.isReal ? "#f18586" : "#72c59f";
  }
  function showNodeTip(event: MouseEvent, data: Node) {
    const nodeMetrics: string[] = settings.value.nodeMetrics || [];
    const nodeMetricConfig = settings.value.nodeMetricConfig || [];
    const html = nodeMetrics.map((m, index) => {
      const metric =
        topologyStore.nodeMetricValue[m].values.find((val: { id: string; value: unknown }) => val.id === data.id) || {};
      const opt: MetricConfigOpt = nodeMetricConfig[index] || {};
      const v = aggregation(metric.value, opt);
      return ` <div class="mb-5"><span class="grey">${opt.label || m}: </span>${v} ${opt.unit || ""}</div>`;
    });
    const tipHtml = [` <div class="mb-5"><span class="grey">name: </span>${data.name}</div>`, ...html].join(" ");

    tooltip.value
      .style("top", event.offsetY + "px")
      .style("left", event.offsetX + "px")
      .style("visibility", "visible")
      .html(tipHtml);
  }
  function showLinkTip(event: MouseEvent, data: Call) {
    const linkClientMetrics: string[] = settings.value.linkClientMetrics || [];
    const linkServerMetricConfig: MetricConfigOpt[] = settings.value.linkServerMetricConfig || [];
    const linkClientMetricConfig: MetricConfigOpt[] = settings.value.linkClientMetricConfig || [];
    const linkServerMetrics: string[] = settings.value.linkServerMetrics || [];
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
    if (d.layer === String(dashboardStore.layerId)) {
      return;
    }
    items.value = [
      { id: "inspect", title: "Inspect", func: handleInspect },
      { id: "alarm", title: "Alarm", func: handleGoAlarm },
    ];
  }
  function handleLinkClick(event: MouseEvent, d: Call) {
    event.stopPropagation();
    if (d.sourceObj.layer !== dashboardStore.layerId || d.targetObj.layer !== dashboardStore.layerId) {
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
  async function handleInspect() {
    svg.value.selectAll(".topo-svg-graph").remove();
    const id = topologyStore.node.id;
    topologyStore.setNode(null);
    topologyStore.setLink(null);
    loading.value = true;
    const resp = await topologyStore.getDepthServiceTopology([id], Number(depth.value));
    loading.value = false;
    if (resp && resp.errors) {
      ElMessage.error(resp.errors);
    }
  }
  function handleGoEndpoint(name: string) {
    const path = `/dashboard/${dashboardStore.layerId}/${EntityType[2].value}/${topologyStore.node.id}/${name}`;
    const routeUrl = router.resolve({ path });

    window.open(routeUrl.href, "_blank");
    dashboardStore.setEntity(origin);
  }
  function handleGoInstance(name: string) {
    const path = `/dashboard/${dashboardStore.layerId}/${EntityType[3].value}/${topologyStore.node.id}/${name}`;
    const routeUrl = router.resolve({ path });

    window.open(routeUrl.href, "_blank");
    dashboardStore.setEntity(origin);
  }
  function handleGoDashboard(name: string) {
    const path = `/dashboard/${dashboardStore.layerId}/${EntityType[0].value}/${topologyStore.node.id}/${name}`;
    const routeUrl = router.resolve({ path });

    window.open(routeUrl.href, "_blank");
    dashboardStore.setEntity(origin);
  }
  function handleGoAlarm() {
    const path = `/alarm`;
    const routeUrl = router.resolve({ path });

    window.open(routeUrl.href, "_blank");
  }
  async function backToTopology() {
    svg.value.selectAll(".topo-svg-graph").remove();
    loading.value = true;
    const resp = await getTopology();
    loading.value = false;

    if (resp && resp.errors) {
      ElMessage.error(resp.errors);
    }
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
  function setNodeTools(nodeDashboard: any) {
    items.value = [
      { id: "inspect", title: "Inspect", func: handleInspect },
      { id: "alarm", title: "Alarm", func: handleGoAlarm },
    ];
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
    () => {
      freshNodes();
    },
  );
  watch(
    () => appStore.durationTime,
    () => {
      if (dashboardStore.entity === EntityType[1].value) {
        freshNodes();
      }
    },
  );
</script>
<style lang="scss">
  .node {
    stroke-linecap: round;
  }

  .link {
    fill: none;
  }

  .topo-svg {
    width: 100%;
    height: calc(100% - 5px);
    cursor: move;
  }

  .micro-topo-chart {
    position: relative;
    height: calc(100% - 30px);
    overflow: auto;
    margin-top: 30px;

    .legend {
      position: absolute;
      top: 10px;
      left: 50px;
      color: #666;

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
      background-color: #2b3037;
      overflow: auto;
      padding: 0 15px;
      border-radius: 3px;
      color: #ccc;
      transition: all 0.5ms linear;
    }

    .label {
      color: #666;
      display: inline-block;
      margin-right: 5px;
    }

    .operations-list {
      position: absolute;
      color: #333;
      cursor: pointer;
      background-color: #fff;
      border-radius: 5px;
      padding: 10px 0;
      border: 1px solid #999;
      box-shadow: #ddd 1px 2px 10px;

      span {
        display: block;
        height: 30px;
        line-height: 30px;
        text-align: left;
        padding: 0 15px;
      }

      span:hover {
        color: #409eff;
        background-color: #eee;
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
      background: rgba(0, 0, 0, 0.3);
      color: #fff;
      display: inline-block;
      padding: 2px 4px;
      border-radius: 3px;
    }

    .topo-line {
      stroke-linecap: round;
      stroke-width: 1px;
      stroke-dasharray: 20 15;
      fill: none;
      animation: topo-dash 0.5s linear infinite;
    }

    .topo-line-anchor,
    .topo-node {
      cursor: pointer;
    }

    .topo-text {
      font-family: "Lato", "Source Han Sans CN", "Microsoft YaHei", sans-serif;
      fill: #ddd;
      font-size: 11px;
      opacity: 0.8;
    }
  }
  @keyframes topo-dash {
    from {
      stroke-dashoffset: 20;
    }

    to {
      stroke-dashoffset: 0;
    }
  }

  .el-loading-spinner {
    top: 30%;
  }

  #tooltip {
    position: absolute;
    visibility: hidden;
    padding: 5px;
    border: 1px solid #000;
    border-radius: 3px;
    background-color: #fff;
  }
</style>
