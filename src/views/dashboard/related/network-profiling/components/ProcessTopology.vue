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
  <div ref="chart" class="process-topo">
    <svg class="process-svg" :width="width" :height="height" @click="clickTopology">
      <g class="svg-graph" :transform="`translate(${diff[0]}, ${diff[1]})`">
        <g class="hex-polygon">
          <path :d="getHexPolygonVertices()" stroke="#D5DDF6" stroke-width="2" fill="none" />
          <text :x="0" :y="radius - 15" :fill="appStore.theme === Themes.Dark ? '#eee' : '#000'" text-anchor="middle">
            {{ selectorStore.currentPod && selectorStore.currentPod.label }}
          </text>
        </g>
        <g class="nodes">
          <g
            v-for="(node, index) in nodeList"
            :key="index"
            class="node"
            @mouseover="showNodeTip(node, $event)"
            @mouseout="hideNodeTip"
            @mousedown="startMoveNode($event, node)"
            @mouseup="stopMoveNode($event)"
          >
            <image
              :href="icons.CUBE"
              style="cursor: 'move'"
              width="35"
              height="35"
              :x="(node.x || 0) - 15"
              :y="(node.y || 0) - 15"
            />
            <text
              :x="node.x"
              :y="(node.y || 0) + 28"
              :fill="appStore.theme === Themes.Dark ? '#eee' : '#000'"
              text-anchor="middle"
            >
              {{ node.name.length > 10 ? `${node.name.substring(0, 10)}...` : node.name }}
            </text>
          </g>
        </g>
        <g class="calls">
          <path
            v-for="(call, index) in networkProfilingStore.calls"
            :key="index"
            class="topo-call"
            marker-end="url(#arrow)"
            stroke="#97B0F8"
            :d="linkPath(call)"
          />
        </g>
        <g class="anchors">
          <image
            v-for="(call, index) in networkProfilingStore.calls"
            :key="index"
            class="topo-line-anchor"
            :href="getAnchor(call)"
            width="15"
            height="15"
            :x="getMidpoint(call)[0] - 8"
            :y="getMidpoint(call)[1] - 13"
            @click="handleLinkClick($event, call)"
            @mouseover="showLinkTip(call, $event)"
            @mouseout="hideLinkTip"
          />
        </g>
        <g class="arrows">
          <defs v-for="(_, index) in networkProfilingStore.calls" :key="index">
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
              <path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#97B0F8" />
            </marker>
          </defs>
        </g>
      </g>
    </svg>
    <div id="tooltip"></div>
  </div>
  <el-popover placement="bottom" :width="295" trigger="click">
    <template #reference>
      <div class="switch-icon-edit ml-5" title="Settings" @click="setConfig">
        <Icon size="middle" iconName="setting_empty" />
      </div>
    </template>
    <Settings @update="updateSettings" />
  </el-popover>
  <TimeLine @get="getDates" />
</template>
<script lang="ts" setup>
  import type { PropType } from "vue";
  import { ref, onMounted, watch } from "vue";
  import * as d3 from "d3";
  import { useI18n } from "vue-i18n";
  import { ElMessage } from "element-plus";
  import router from "@/router";
  import { useNetworkProfilingStore } from "@/store/modules/network-profiling";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { linkPath, getAnchor, getMidpoint } from "./Graph/linkProcess";
  import type { Call } from "@/types/topology";
  import zoom from "../../components/utils/zoom";
  import type { ProcessNode } from "@/types/ebpf";
  import { useThrottleFn } from "@vueuse/core";
  import Settings from "./Settings.vue";
  import { EntityType } from "@/views/dashboard/data";
  import getDashboard from "@/hooks/useDashboardsSession";
  import { Layout } from "./Graph/layout";
  import TimeLine from "./TimeLine.vue";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import icons from "@/assets/img/icons";
  import { Themes } from "@/constants/data";

  /*global Nullable, defineProps */
  const props = defineProps({
    config: {
      type: Object as PropType<any>,
      default: () => ({ graph: {} }),
    },
  });
  const { t } = useI18n();
  const appStore = useAppStoreWithOut();
  const dashboardStore = useDashboardStore();
  const selectorStore = useSelectorStore();
  const networkProfilingStore = useNetworkProfilingStore();
  const height = ref<number>(100);
  const width = ref<number>(100);
  const chart = ref<Nullable<HTMLDivElement>>(null);
  const tooltip = ref<Nullable<any>>(null);
  const svg = ref<Nullable<any>>(null);
  const graph = ref<Nullable<any>>(null);
  const oldVal = ref<{ width: number; height: number }>({ width: 0, height: 0 });
  const config = ref<any>(props.config || {});
  const diff = ref<number[]>([220, 200]);
  const radius = 210;
  const dates = ref<Nullable<{ start: number; end: number }>>(null);
  const nodeList = ref<ProcessNode[]>([]);
  const currentNode = ref<Nullable<ProcessNode>>(null);
  const origin = [0, 0];

  onMounted(() => {
    init();
    oldVal.value = (chart.value && chart.value.getBoundingClientRect()) || {
      width: 0,
      height: 0,
    };
  });

  async function init() {
    if (!networkProfilingStore.nodes.length) {
      return;
    }
    svg.value = d3.select(".process-svg");
    graph.value = d3.select(".svg-graph");
    tooltip.value = d3.select("#tooltip");
    freshNodes();
    useThrottleFn(resize, 500)();
  }

  function drawGraph() {
    const dom = chart.value?.getBoundingClientRect() || {
      height: 20,
      width: 0,
    };
    height.value = (dom.height || 40) - 20;
    width.value = dom.width;
    diff.value[0] = (dom.width - radius * 2) / 2 + radius;
    svg.value.call(zoom(d3, graph.value, diff.value));
  }

  function clickTopology(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    networkProfilingStore.setNode(null);
    networkProfilingStore.setLink(null);
    dashboardStore.selectWidget(props.config);
  }

  function hexGrid(n = 1, radius = 1, origin = [0, 0]) {
    let x, y, yn, p;
    const gLayout = new Layout(radius, origin);
    const pos = [];
    for (x = -n; x <= n; x++) {
      y = Math.max(-n, -x - n); // 0
      yn = Math.min(n, -x + n); // 1
      for (y; y <= yn; y++) {
        p = gLayout.axialToPixel(x, y);
        pos.push(p);
      }
    }
    return pos;
  }

  function createPolygon(radius: number, sides = 6, offset = 0) {
    const poly: number[][] = [];
    let i, rad;
    for (i = 0; i < sides; i++) {
      rad = Math.PI * 2 * (i / sides);
      poly.push([Math.cos(rad + offset) * radius, Math.sin(rad + offset) * radius]);
    }
    return poly;
  }
  function getCirclePoint(radius: number, p = 1) {
    const data = [];
    for (let index = 0; index < 360; index = index + p) {
      if (index < 230 || index > 310) {
        let x = radius * Math.cos((Math.PI * 2 * index) / 360);
        let y = radius * Math.sin((Math.PI * 2 * index) / 360);
        data.push([x + origin[0], y + origin[1]]);
      }
    }
    return data;
  }

  function getHexPolygonVertices() {
    const p = {
      count: 1,
      radius, // layout hexagons radius 300
    };
    const polygon = createPolygon(p.radius, 6, 0);
    const vertices: any = []; // a hexagon vertices
    for (let v = 0; v < polygon.length; v++) {
      vertices.push([origin[0] + polygon[v][0], origin[1] + polygon[v][1]]);
    }
    const linePath = d3.line();
    linePath.curve(d3.curveLinearClosed);
    return linePath(vertices) || "";
  }
  function createLayout() {
    const dom: any = (chart.value && chart.value.getBoundingClientRect()) || {
      width: 0,
      height: 0,
    };
    if (isNaN(dom.width) || dom.width < 1) {
      return;
    }
    const p = {
      count: 1,
      radius, // layout hexagons radius 300
    };
    const nodeArr = networkProfilingStore.nodes.filter((d: ProcessNode) => d.isReal || d.name === "UNKNOWN_LOCAL");
    const count = nodeArr.length;
    // layout
    const centers = hexGrid(p.count, 68, origin); // cube centers
    const cubeCenters = [];
    if (count > 7) {
      for (let i = 0; i < centers.length; i++) {
        // const polygon = createPolygon(68, 6, 0);
        // const vertices: any = []; // a hexagon vertices
        // for (let v = 0; v < polygon.length; v++) {
        //   vertices.push([
        //     centers[i][0] + polygon[v][0],
        //     centers[i][1] + polygon[v][1],
        //   ]);
        // }
        // const linePath = d3.line();
        // linePath.curve(d3.curveLinearClosed);
        // graph.value
        //   .append("path")
        //   .attr("d", linePath(vertices))
        //   .attr("stroke", "#ccc")
        //   .attr("stroke-width", 1)
        //   .style("fill", "none");
        let c = hexGrid(1, 20, centers[i]);
        if (count < 15) {
          c = [c[0], c[5]];
        } else if (count < 22) {
          c = [c[0], c[2], c[5]];
        }
        cubeCenters.push(...c);
      }
      shuffleArray(cubeCenters);
    }
    // for (let i = 0; i < cubeCenters.length; i++) {
    //   const polygon = createPolygon(20, 6, 0);
    //   const vertices: any = []; // a hexagon vertices
    //   for (let v = 0; v < polygon.length; v++) {
    //     vertices.push([
    //       cubeCenters[i][0] + polygon[v][0],
    //       cubeCenters[i][1] + polygon[v][1],
    //     ]);
    //   }
    //   const linePath = d3.line();
    //   linePath.curve(d3.curveLinearClosed);
    //   graph.value
    //     .append("path")
    //     .attr("d", linePath(vertices))
    //     .attr("stroke", "#ccc")
    //     .attr("stroke-width", 1)
    //     .style("fill", "none");
    // }
    let cubes = count > 7 ? cubeCenters : centers;
    for (let v = 0; v < count; v++) {
      const x = cubes[v][0];
      const y = cubes[v][1];
      nodeArr[v].x = x;
      nodeArr[v].y = y;
    }
    const outNodes = networkProfilingStore.nodes.filter((d: ProcessNode) => !(d.isReal || d.name === "UNKNOWN_LOCAL"));
    const interval = 30;
    let r = 250;
    let pointArr = getCirclePoint(r, interval);
    for (let v = 0; v < outNodes.length; v++) {
      if (!pointArr[v]) {
        r = r + 80;
        pointArr = [...pointArr, ...getCirclePoint(r, interval)];
      }
      outNodes[v].x = pointArr[v][0];
      outNodes[v].y = pointArr[v][1];
    }
    nodeList.value = [...nodeArr, ...outNodes];
    const drag: any = d3.drag().on("drag", (d: ProcessNode) => {
      moveNode(d);
    });
    setTimeout(() => {
      d3.selectAll(".node").call(drag);
    }, 1000);
  }

  function shuffleArray(array: number[][]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  function handleLinkClick(event: any, d: Call) {
    event.stopPropagation();
    networkProfilingStore.setNode(null);
    networkProfilingStore.setLink(d);
    if (!config.value.linkDashboard) {
      return;
    }
    const { dashboard } = getDashboard({
      name: config.value.linkDashboard,
      layer: dashboardStore.layerId,
      entity: EntityType[7].value,
    });
    if (!dashboard) {
      ElMessage.error(`The dashboard named ${config.value.linkDashboard} doesn't exist`);
      return;
    }
    let times: any = {};
    if (dates.value) {
      times = dates.value;
    } else {
      const { taskStartTime, fixedTriggerDuration } = networkProfilingStore.selectedNetworkTask;
      const startTime =
        fixedTriggerDuration > 1800 ? taskStartTime + fixedTriggerDuration * 1000 - 30 * 60 * 1000 : taskStartTime;
      times = {
        start: startTime,
        end: taskStartTime + fixedTriggerDuration * 1000,
      };
    }
    const param = JSON.stringify({
      ...times,
      step: appStore.duration.step,
      utc: appStore.utc,
    });
    const path = `/dashboard/${dashboard.layer}/${EntityType[7].value}/${d.source.serviceId}/${d.source.serviceInstanceId}/${d.source.id}/${d.target.serviceId}/${d.target.serviceInstanceId}/${d.target.id}/${dashboard.name}/duration/${param}`;
    const routeUrl = router.resolve({ path });

    window.open(routeUrl.href, "_blank");
  }

  function updateSettings(param: unknown) {
    config.value = param;
  }

  function setConfig() {
    dashboardStore.selectWidget(props.config);
  }

  function getDates(times: any) {
    dates.value = times;
  }

  function resize() {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const cr = entry.contentRect;
      if (Math.abs(cr.width - oldVal.value.width) < 5 && Math.abs(cr.height - oldVal.value.height) < 5) {
        return;
      }
      freshNodes();
      oldVal.value = { width: cr.width, height: cr.height };
    });
    if (chart.value) {
      observer.observe(chart.value);
    }
  }

  async function freshNodes() {
    if (!networkProfilingStore.nodes.length) {
      return;
    }
    drawGraph();
    createLayout();
  }
  function startMoveNode(event: MouseEvent, d: ProcessNode) {
    event.stopPropagation();
    currentNode.value = d;
  }
  function stopMoveNode(event: MouseEvent) {
    event.stopPropagation();
    currentNode.value = null;
  }
  function moveNode(d: ProcessNode) {
    if (!currentNode.value) {
      return;
    }
    const inNode = currentNode.value.isReal || currentNode.value.name === "UNKNOWN_LOCAL";
    const diff = inNode ? -20 : 20;
    const inside = posInHex(d.x || 0, d.y || 0, diff);
    if (inNode) {
      if (!inside) {
        return;
      }
    } else {
      if (inside) {
        return;
      }
    }
    nodeList.value = nodeList.value.map((node: ProcessNode) => {
      if (currentNode.value && node.id === currentNode.value.id) {
        node.x = d.x;
        node.y = d.y;
      }
      return node;
    });
  }
  function posInHex(posX: number, posY: number, diff: number) {
    const halfSideLen = (radius + diff) / 2;
    const mathSqrt3 = Math.sqrt(3);
    const dx = Math.abs(origin[0] - posX);
    const dy = Math.abs(origin[1] - posY);

    if (dx < halfSideLen) {
      return dy <= halfSideLen * mathSqrt3;
    } else {
      const maxY = -mathSqrt3 * (dx - halfSideLen) + halfSideLen * mathSqrt3;
      return dy < maxY;
    }
  }

  function showNodeTip(d: ProcessNode, event: MouseEvent) {
    const tipHtml = ` <div class="mb-5"><span class="grey">name: </span>${d.name}</div>`;

    tooltip.value
      .style("top", event.offsetY + "px")
      .style("left", event.offsetX + "px")
      .style("visibility", "visible")
      .html(tipHtml);
  }

  function hideNodeTip() {
    tooltip.value.style("visibility", "hidden");
  }

  function showLinkTip(link: Call, event: MouseEvent) {
    const types = [...link.sourceComponents, ...link.targetComponents];
    let l = "TCP";
    if (types.includes("https")) {
      l = "HTTPS";
    }
    if (types.includes("http")) {
      l = "HTTP";
    }
    if (types.includes("tls")) {
      l = "TLS";
    }
    const tipHtml = `<div><span class="grey">${t("detectPoint")}: </span>${link.detectPoints.join(" | ")}</div>
        <div><span class="grey">Type: </span>${l}</div>`;

    tooltip.value
      .style("top", event.offsetY + "px")
      .style("left", event.offsetX + "px")
      .style("visibility", "visible")
      .html(tipHtml);
  }

  function hideLinkTip() {
    tooltip.value.style("visibility", "hidden");
  }

  watch(
    () => networkProfilingStore.nodes,
    () => {
      freshNodes();
    },
  );
</script>
<style lang="scss">
  .process-topo {
    width: 100%;
    height: 100%;
    min-height: 150px;
    min-width: 300px;
    overflow: auto;
  }

  .process-svg {
    width: 100%;
    height: calc(100% - 10px);
    cursor: move;
  }

  .topo-line-anchor {
    cursor: pointer;
  }

  .switch-icon-edit {
    cursor: pointer;
    transition: all 0.5ms linear;
    border: 1px solid $disabled-color;
    color: var(--text-color-placeholder);
    display: inline-block;
    padding: 5px;
    border-radius: 3px;
    position: absolute;
    top: 10px;
    right: 20px;
  }

  .range {
    right: 60px;
  }

  .topo-call {
    stroke-linecap: round;
    stroke-width: 2px;
    stroke-dasharray: 13 7;
    fill: none;
    animation: topo-dash 0.5s linear infinite;
  }

  @keyframes topo-dash {
    from {
      stroke-dashoffset: 20;
    }

    to {
      stroke-dashoffset: 0;
    }
  }

  .time-ranges {
    width: 100%;
    padding: 10px;
  }

  .query {
    margin-left: 510px;
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
