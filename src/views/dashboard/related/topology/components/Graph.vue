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
        <Selector
          class="inputs"
          :value="depth"
          :options="DepthList"
          @change="changeDepth"
        />
      </span>
      <span
        class="switch-icon ml-5"
        title="Settings"
        @click="setConfig"
        v-if="dashboardStore.editMode"
      >
        <Icon size="middle" iconName="settings" />
      </span>
      <span
        class="switch-icon ml-5"
        title="Back to overview topology"
        @click="backToTopology"
      >
        <Icon size="middle" iconName="keyboard_backspace" />
      </span>
    </div>
    <div
      class="operations-list"
      v-if="topologyStore.node"
      :style="{
        top: operationsPos.y + 'px',
        left: operationsPos.x + 'px',
      }"
    >
      <span
        v-for="(item, index) of items"
        :key="index"
        @click="item.func(item.dashboard)"
      >
        {{ item.title }}
      </span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { PropType } from "vue";
import {
  ref,
  onMounted,
  onBeforeUnmount,
  reactive,
  watch,
  computed,
} from "vue";
import { useI18n } from "vue-i18n";
import * as d3 from "d3";
import d3tip from "d3-tip";
import zoom from "../../components/utils/zoom";
import { simulationInit, simulationSkip } from "./utils/simulation";
import nodeElement from "./utils/nodeElement";
import { linkElement, anchorElement, arrowMarker } from "./utils/linkElement";
import { Node, Call } from "@/types/topology";
import { useSelectorStore } from "@/store/modules/selectors";
import { useTopologyStore } from "@/store/modules/topology";
import { useDashboardStore } from "@/store/modules/dashboard";
import { EntityType, DepthList } from "../../../data";
import router from "@/router";
import { ElMessage } from "element-plus";
import Settings from "./Settings.vue";
import { Option } from "@/types/app";
import { Service } from "@/types/selector";
import { useAppStoreWithOut } from "@/store/modules/app";
import getDashboard from "@/hooks/useDashboardsSession";
import { MetricConfigOpt } from "@/types/dashboard";
import { aggregation } from "@/hooks/useProcessor";
import icons from "@/assets/img/icons";
import { useQueryTopologyMetrics } from "@/hooks/useProcessor";

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
const simulation = ref<any>(null);
const svg = ref<Nullable<any>>(null);
const chart = ref<Nullable<HTMLDivElement>>(null);
const tip = ref<Nullable<HTMLDivElement>>(null);
const graph = ref<any>(null);
const node = ref<any>(null);
const link = ref<any>(null);
const anchor = ref<any>(null);
const arrow = ref<any>(null);
const showSetting = ref<boolean>(false);
const settings = ref<any>(props.config);
const operationsPos = reactive<{ x: number; y: number }>({ x: NaN, y: NaN });
const items = ref<
  { id: string; title: string; func: any; dashboard?: string }[]
>([]);
const graphConfig = computed(() => props.config.graph || {});
const depth = ref<number>(graphConfig.value.depth || 2);

onMounted(async () => {
  loading.value = true;
  const json = await selectorStore.fetchServices(dashboardStore.layerId);
  if (json.errors) {
    ElMessage.error(json.errors);
    return;
  }
  const resp = await getTopology();
  loading.value = false;
  if (resp && resp.errors) {
    ElMessage.error(resp.errors);
  }
  topologyStore.getLinkClientMetrics(settings.value.linkClientMetrics || []);
  topologyStore.getLinkServerMetrics(settings.value.linkServerMetrics || []);
  topologyStore.queryNodeMetrics(settings.value.nodeMetrics || []);
  const dom = document.querySelector(".topology")?.getBoundingClientRect() || {
    height: 40,
    width: 0,
  };
  height.value = dom.height - 40;
  width.value = dom.width;
  window.addEventListener("resize", resize);
  svg.value = d3.select(chart.value).append("svg").attr("class", "topo-svg");
  await initLegendMetrics();
  await init();
  update();
  setNodeTools(settings.value.nodeDashboard);
});
async function init() {
  tip.value = (d3tip as any)().attr("class", "d3-tip").offset([-8, 0]);
  graph.value = svg.value
    .append("g")
    .attr("class", "topo-svg-graph")
    .attr("transform", `translate(-100, -100)`);
  graph.value.call(tip.value);
  simulation.value = simulationInit(
    d3,
    topologyStore.nodes,
    topologyStore.calls,
    ticked
  );
  node.value = graph.value.append("g").selectAll(".topo-node");
  link.value = graph.value.append("g").selectAll(".topo-line");
  anchor.value = graph.value.append("g").selectAll(".topo-line-anchor");
  arrow.value = graph.value.append("g").selectAll(".topo-line-arrow");
  svg.value.call(zoom(d3, graph.value, [-100, -100]));
  svg.value.on("click", (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    topologyStore.setNode(null);
    topologyStore.setLink(null);
    dashboardStore.selectWidget(props.config);
  });
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
function ticked() {
  link.value.attr(
    "d",
    (d: Call | any) =>
      `M${d.source.x} ${d.source.y} Q ${(d.source.x + d.target.x) / 2} ${
        (d.target.y + d.source.y) / 2 - d.loopFactor * 90
      } ${d.target.x} ${d.target.y}`
  );
  anchor.value.attr(
    "transform",
    (d: Call | any) =>
      `translate(${(d.source.x + d.target.x) / 2}, ${
        (d.target.y + d.source.y) / 2 - d.loopFactor * 45
      })`
  );
  node.value.attr(
    "transform",
    (d: Node | any) => `translate(${d.x - 22},${d.y - 22})`
  );
}
function dragstart(d: any) {
  node.value._groups[0].forEach((g: any) => {
    g.__data__.fx = g.__data__.x;
    g.__data__.fy = g.__data__.y;
  });
  if (!d.active) {
    simulation.value.alphaTarget(0.1).restart();
  }
  d.subject.fx = d.subject.x;
  d.subject.fy = d.subject.y;
  d.sourceEvent.stopPropagation();
}
function dragged(d: any) {
  d.subject.fx = d.x;
  d.subject.fy = d.y;
}
function dragended(d: any) {
  if (!d.active) {
    simulation.value.alphaTarget(0);
  }
}
function handleNodeClick(d: Node & { x: number; y: number }) {
  topologyStore.setNode(d);
  topologyStore.setLink(null);
  operationsPos.x = d.x - 100;
  operationsPos.y = d.y - 70;
  if (d.layer === String(dashboardStore.layerId)) {
    return;
  }
  items.value = [
    { id: "inspect", title: "Inspect", func: handleInspect },
    { id: "alarm", title: "Alarm", func: handleGoAlarm },
  ];
}
function handleLinkClick(event: any, d: Call) {
  if (
    d.source.layer !== dashboardStore.layerId ||
    d.target.layer !== dashboardStore.layerId
  ) {
    return;
  }
  event.stopPropagation();
  topologyStore.setNode(null);
  topologyStore.setLink(d);
  if (!settings.value.linkDashboard) {
    return;
  }
  const origin = dashboardStore.entity;
  const e =
    dashboardStore.entity === EntityType[1].value
      ? EntityType[0].value
      : dashboardStore.entity;
  const { dashboard } = getDashboard({
    name: settings.value.linkDashboard,
    layer: dashboardStore.layerId,
    entity: `${e}Relation`,
  });
  if (!dashboard) {
    ElMessage.error(
      `The dashboard named ${settings.value.linkDashboard} doesn't exist`
    );
    return;
  }
  dashboardStore.setEntity(dashboard.entity);
  const path = `/dashboard/related/${dashboard.layer}/${e}Relation/${d.source.id}/${d.target.id}/${dashboard.name}`;
  const routeUrl = router.resolve({ path });
  window.open(routeUrl.href, "_blank");
  dashboardStore.setEntity(origin);
}
function update() {
  // node element
  if (!node.value || !link.value) {
    return;
  }
  node.value = node.value.data(topologyStore.nodes, (d: Node) => d.id);
  node.value.exit().remove();
  node.value = nodeElement(
    d3,
    node.value.enter(),
    {
      dragstart: dragstart,
      dragged: dragged,
      dragended: dragended,
      handleNodeClick: handleNodeClick,
      tipHtml: (data: Node) => {
        const nodeMetrics: string[] = settings.value.nodeMetrics || [];
        const nodeMetricConfig = settings.value.nodeMetricConfig || [];
        const html = nodeMetrics.map((m, index) => {
          const metric =
            topologyStore.nodeMetricValue[m].values.find(
              (val: { id: string; value: unknown }) => val.id === data.id
            ) || {};
          const opt: MetricConfigOpt = nodeMetricConfig[index] || {};
          const v = aggregation(metric.value, opt);
          return ` <div class="mb-5"><span class="grey">${
            opt.label || m
          }: </span>${v} ${opt.unit || ""}</div>`;
        });
        return [
          ` <div class="mb-5"><span class="grey">name: </span>${data.name}</div>`,
          ...html,
        ].join(" ");
      },
    },
    tip.value,
    settings.value.legend
  ).merge(node.value);
  // line element
  link.value = link.value.data(topologyStore.calls, (d: Call) => d.id);
  link.value.exit().remove();
  link.value = linkElement(link.value.enter()).merge(link.value);
  // anchorElement
  anchor.value = anchor.value.data(topologyStore.calls, (d: Call) => d.id);
  anchor.value.exit().remove();
  anchor.value = anchorElement(
    anchor.value.enter(),
    {
      handleLinkClick: handleLinkClick,
      tipHtml: (data: Call) => {
        const linkClientMetrics: string[] =
          settings.value.linkClientMetrics || [];
        const linkServerMetricConfig: MetricConfigOpt[] =
          settings.value.linkServerMetricConfig || [];
        const linkClientMetricConfig: MetricConfigOpt[] =
          settings.value.linkClientMetricConfig || [];
        const linkServerMetrics: string[] =
          settings.value.linkServerMetrics || [];
        const htmlServer = linkServerMetrics.map((m, index) => {
          const metric = topologyStore.linkServerMetrics[m].values.find(
            (val: { id: string; value: unknown }) => val.id === data.id
          );
          if (metric) {
            const opt: MetricConfigOpt = linkServerMetricConfig[index] || {};
            const v = aggregation(metric.value, opt);
            return ` <div class="mb-5"><span class="grey">${
              opt.label || m
            }: </span>${v} ${opt.unit || ""}</div>`;
          }
        });
        const htmlClient = linkClientMetrics.map((m: string, index: number) => {
          const opt: MetricConfigOpt = linkClientMetricConfig[index] || {};
          const metric = topologyStore.linkClientMetrics[m].values.find(
            (val: { id: string; value: unknown }) => val.id === data.id
          );
          if (metric) {
            const v = aggregation(metric.value, opt);
            return ` <div class="mb-5"><span class="grey">${
              opt.label || m
            }: </span>${v} ${opt.unit || ""}</div>`;
          }
        });
        const html = [
          ...htmlServer,
          ...htmlClient,
          `<div><span class="grey">${t(
            "detectPoint"
          )}:</span>${data.detectPoints.join(" | ")}</div>`,
        ].join(" ");

        return html;
      },
    },
    tip.value
  ).merge(anchor.value);
  // arrow marker
  arrow.value = arrow.value.data(topologyStore.calls, (d: Call) => d.id);
  arrow.value.exit().remove();
  arrow.value = arrowMarker(arrow.value.enter()).merge(arrow.value);
  // force element
  simulation.value.nodes(topologyStore.nodes);
  simulation.value
    .force("link")
    .links(topologyStore.calls)
    .id((d: Call) => d.id);
  simulationSkip(d3, simulation.value, ticked);
  const loopMap: any = {};
  for (let i = 0; i < topologyStore.calls.length; i++) {
    const link: any = topologyStore.calls[i];
    link.loopFactor = 1;
    for (let j = 0; j < topologyStore.calls.length; j++) {
      if (i === j || loopMap[i]) {
        continue;
      }
      const otherLink = topologyStore.calls[j];
      if (
        link.source.id === otherLink.target.id &&
        link.target.id === otherLink.source.id
      ) {
        link.loopFactor = -1;
        loopMap[j] = 1;
        break;
      }
    }
  }
}
async function handleInspect() {
  svg.value.selectAll(".topo-svg-graph").remove();
  const id = topologyStore.node.id;
  topologyStore.setNode(null);
  topologyStore.setLink(null);
  loading.value = true;
  const resp = await topologyStore.getDepthServiceTopology(
    [id],
    Number(depth.value)
  );
  loading.value = false;
  if (resp && resp.errors) {
    ElMessage.error(resp.errors);
  }
  await init();
  update();
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
  await init();
  update();
  topologyStore.setNode(null);
  topologyStore.setLink(null);
}
async function getTopology() {
  const ids = selectorStore.services.map((d: Service) => d.id);
  const serviceIds =
    dashboardStore.entity === EntityType[0].value
      ? [selectorStore.currentService.id]
      : ids;
  const resp = await topologyStore.getDepthServiceTopology(
    serviceIds,
    Number(depth.value)
  );
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
  svg.value.attr("height", height.value).attr("width", width.value);
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
async function freshNodes() {
  if (!svg.value) {
    return;
  }
  svg.value.selectAll(".topo-svg-graph").remove();
  await init();
  update();
}

async function changeDepth(opt: Option[] | any) {
  depth.value = opt[0].value;
  await getTopology();
  freshNodes();
}
onBeforeUnmount(() => {
  window.removeEventListener("resize", resize);
});
watch(
  () => [selectorStore.currentService, selectorStore.currentDestService],
  () => {
    freshNodes();
  }
);
watch(
  () => appStore.durationTime,
  () => {
    if (dashboardStore.entity === EntityType[1].value) {
      freshNodes();
    }
  }
);
</script>
<style lang="scss">
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
    left: 15px;
    color: #ccc;

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
    color: #ccc;
    display: inline-block;
    margin-right: 5px;
  }

  .operations-list {
    position: absolute;
    color: #333;
    cursor: pointer;
    background-color: #fff;
    border-radius: 3px;
    padding: 10px 0;

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
    background-color: #252a2f99;
    color: #ddd;
    display: inline-block;
    padding: 5px 8px 8px;
    border-radius: 3px;
  }

  .topo-line {
    stroke-linecap: round;
    stroke-width: 3px;
    stroke-dasharray: 13 7;
    fill: none;
    animation: topo-dash 0.5s linear infinite;
  }

  .topo-line-anchor {
    cursor: pointer;
  }

  .topo-text {
    font-family: "Lato", "Source Han Sans CN", "Microsoft YaHei", sans-serif;
    fill: #ddd;
    font-size: 11px;
    opacity: 0.8;
  }
}

.d3-tip {
  line-height: 1;
  padding: 8px;
  color: #eee;
  border-radius: 4px;
  font-size: 12px;
  z-index: 9999;
  background: #252a2f;
}

.d3-tip:after {
  box-sizing: border-box;
  display: block;
  font-size: 10px;
  width: 100%;
  line-height: 0.8;
  color: #252a2f;
  content: "\25BC";
  position: absolute;
  text-align: center;
}

.d3-tip.n:after {
  margin: -2px 0 0 0;
  top: 100%;
  left: 0;
}
@keyframes topo-dash {
  from {
    stroke-dashoffset: 20;
  }

  to {
    stroke-dashoffset: 0;
  }
}
</style>
