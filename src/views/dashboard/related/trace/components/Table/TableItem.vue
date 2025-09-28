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
  <div v-if="type === TraceGraphType.STATISTICS">
    <div class="trace-item">
      <div :class="['method']">
        <el-tooltip :content="data.groupRef?.endpointName" placement="top" :show-after="300">
          <span>
            {{ data.groupRef?.endpointName }}
          </span>
        </el-tooltip>
      </div>
      <div :class="['type']">
        <el-tooltip :content="data.groupRef?.type" placement="top" :show-after="300">
          <span>
            {{ data.groupRef?.type }}
          </span>
        </el-tooltip>
      </div>
      <div class="max-time">
        {{ data.maxTime }}
      </div>
      <div class="min-time">
        {{ data.minTime }}
      </div>
      <div class="sum-time">
        {{ data.sumTime }}
      </div>
      <div class="avg-time">
        {{ parseInt(data.avgTime || "0") }}
      </div>
      <div class="count">
        {{ data.count }}
      </div>
    </div>
  </div>
  <div v-else>
    <div
      :class="[
        'trace-item',
        'level' + ((data.level || 0) - 1),
        { 'trace-item-error': data.isError },
        { profiled: data.profiled === false },
        `trace-item-${data.key}`,
      ]"
      :data-text="data.profiled === false ? 'No Thread Dump' : ''"
      @click="hideActionBox"
    >
      <div
        :class="['method', 'level' + ((data.level || 0) - 1)]"
        :style="{
          'text-indent': ((data.level || 0) - 1) * 10 + 'px',
          width: `${method}px`,
        }"
        @click="selectSpan"
        @click.stop
      >
        <Icon
          :style="!displayChildren ? 'transform: rotate(-90deg);' : ''"
          @click.stop="toggle"
          v-if="data.children && data.children.length"
          iconName="arrow-down"
          size="sm"
          class="mr-5"
          @click="hideActionBox"
        />
        <el-tooltip
          :content="data.type === 'Entry' ? 'Entry' : 'Exit'"
          placement="top"
          :show-after="300"
          v-if="['Entry', 'Exit'].includes(data.type)"
        >
          <span>
            <Icon :iconName="data.type === 'Entry' ? 'entry' : 'exit'" size="sm" class="mr-5" />
          </span>
        </el-tooltip>
        <el-tooltip v-if="isCrossThread" content="CROSS_THREAD" placement="top" :show-after="300">
          <span>
            <Icon iconName="cross" size="sm" class="mr-5" />
          </span>
        </el-tooltip>
        <el-tooltip :content="data.endpointName" placement="top" :show-after="300">
          <span class="link-span">
            {{ data.endpointName }}
          </span>
        </el-tooltip>
      </div>
      <div class="start-time">
        {{ dateFormat(data.startTime) }}
      </div>
      <div class="exec-ms">
        {{ data.endTime - data.startTime ? data.endTime - data.startTime : "0" }}
      </div>
      <div class="exec-percent">
        <div class="outer-progress_bar" :style="{ width: outterPercent }">
          <div class="inner-progress_bar" :style="{ width: innerPercent }"></div>
        </div>
      </div>
      <div class="self">
        {{ data.dur ? data.dur + "" : "0" }}
      </div>
      <div class="api">
        <el-tooltip :show-after="300" :content="data.component || '-'" placement="top">
          <span>{{ data.component || "-" }}</span>
        </el-tooltip>
      </div>
      <div class="application">
        <el-tooltip :show-after="300" :content="data.serviceCode || '-'" placement="top">
          <span :style="{ color: getServiceColor(data.serviceCode || '') }">{{ data.serviceCode }}</span>
        </el-tooltip>
      </div>
      <div class="application" v-show="headerType === WidgetType.Profile" @click="viewSpan($event)">
        <span>{{ t("view") }}</span>
      </div>
      <div class="application" v-show="headerType !== WidgetType.Profile">
        <span>{{ data.attachedEvents && data.attachedEvents.length }}</span>
      </div>
    </div>
    <div v-show="data.children && data.children.length > 0 && displayChildren" class="children-trace">
      <table-item
        v-for="(child, index) in data.children"
        :method="method"
        :key="index"
        :data="child"
        :type="type"
        :headerType="headerType"
        @selectedSpan="selectItem"
      />
    </div>
    <el-dialog v-model="showDetail" :destroy-on-close="true" fullscreen @closed="showDetail = false">
      <SpanDetail :currentSpan="data" :traceId="traceId" />
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
  import { ref, computed, watch } from "vue";
  import SpanDetail from "../D3Graph/SpanDetail.vue";
  import { dateFormat } from "@/utils/dateFormat";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { useTraceStore } from "@/store/modules/trace";
  import { TraceGraphType } from "../VisGraph/constant";
  import { WidgetType } from "@/views/dashboard/data";
  import type { Span, Ref } from "@/types/trace";
  import { getServiceColor } from "@/utils/color";

  interface Props {
    data: Span;
    method: number;
    type: string;
    headerType: string;
    traceId?: string;
  }
  interface Emits {
    (e: "selectedSpan", value: Span): void;
  }
  const emits = defineEmits<Emits>();
  const props = defineProps<Props>();
  const appStore = useAppStoreWithOut();
  const traceStore = useTraceStore();
  const displayChildren = ref<boolean>(true);
  const showDetail = ref<boolean>(false);
  const { t } = useI18n();
  const selfTime = computed(() => (props.data.dur ? props.data.dur : 0));
  const execTime = computed(() =>
    props.data.endTime - props.data.startTime > 0 ? props.data.endTime - props.data.startTime : 0,
  );
  const outterPercent = computed(() => {
    if (props.data.level === 1) {
      return "100%";
    } else {
      const { data } = props;
      let result = (execTime.value / (data.totalExec || 0)) * 100;
      result = result > 100 ? 100 : result;
      const resultStr = result.toFixed(4) + "%";
      return resultStr === "0.0000%" ? "0.9%" : resultStr;
    }
  });
  const innerPercent = computed(() => {
    const result = (selfTime.value / execTime.value) * 100;
    const resultStr = result.toFixed(4) + "%";
    return resultStr === "0.0000%" ? "0.9%" : resultStr;
  });
  const isCrossThread = computed(() => {
    const key = props.data.refs?.findIndex((d: Ref) => d.type === "CROSS_THREAD") ?? -1;
    return key > -1 ? true : false;
  });
  function toggle() {
    displayChildren.value = !displayChildren.value;
  }
  function selectItem(span: Span) {
    emits("selectedSpan", span);
  }
  function showSelectSpan(dom: HTMLSpanElement) {
    if (!dom) {
      return;
    }
    const items: HTMLSpanElement[] = Array.from(document.querySelectorAll(".trace-item")) as HTMLSpanElement[];
    for (const item of items) {
      item.style.background = "transparent";
    }
    dom.style.background = "var(--sw-trace-table-selected)";
    const p = document.getElementsByClassName("profiled")[0] as HTMLSpanElement | null;
    if (p) {
      p.style.background = "var(--border-color-primary)";
    }
  }
  function selectSpan(event: MouseEvent) {
    emits("selectedSpan", props.data);
    const dom = event
      .composedPath()
      .find((d: EventTarget) => (d as HTMLElement).className.includes("trace-item")) as HTMLSpanElement;
    selectedItem(props.data);
    if (props.headerType === WidgetType.Profile) {
      showSelectSpan(dom);
      return;
    }
    viewSpanDetail(dom);
    if (props.type === TraceGraphType.STATISTICS) {
      return;
    }
    const item: HTMLSpanElement | null = document.querySelector("#trace-action-box");
    const tableBox = document.querySelector(".trace-table-charts")?.getBoundingClientRect();
    if (!tableBox || !item) {
      return;
    }
    const offsetX = event.x - tableBox.x;
    const offsetY = event.y - tableBox.y;
    item.style.display = "block";
    item.style.top = `${offsetY + 20}px`;
    item.style.left = `${offsetX + 10}px`;
  }
  function viewSpan(event: MouseEvent) {
    showDetail.value = true;
    const dom = event
      .composedPath()
      .find((d: EventTarget) => (d as HTMLElement).className.includes("trace-item")) as HTMLSpanElement;
    selectedItem(props.data);
    viewSpanDetail(dom);
  }
  function selectedItem(span: Span) {
    traceStore.setSelectedSpan(span);
    emits("selectedSpan", span);
  }
  function viewSpanDetail(dom: HTMLSpanElement) {
    showSelectSpan(dom);
    if (props.type === TraceGraphType.STATISTICS) {
      showDetail.value = true;
    }
  }
  function hideActionBox() {
    const item: HTMLSpanElement | null = document.querySelector("#trace-action-box");
    if (item) {
      item.style.display = "none";
    }
  }
  watch(
    () => appStore.theme,
    () => {
      const items: HTMLSpanElement[] = Array.from(document.querySelectorAll(".trace-item")) as HTMLSpanElement[];
      for (const item of items) {
        item.style.background = "transparent";
      }
      const p = document.getElementsByClassName("profiled")[0] as HTMLSpanElement | null;
      if (p) {
        p.style.background = "var(--border-color-primary)";
      }
    },
  );
</script>
<style lang="scss" scoped>
  @import url("./table.scss");

  .event-tag {
    width: 12px;
    height: 12px;
    border-radius: 12px;
    border: 1px solid #e66;
    color: #e66;
    display: inline-block;
  }

  .trace-item.level0 {
    &:hover {
      background: rgb(0 0 0 / 4%);
    }
  }

  .profiled {
    background-color: var(--sw-table-header);
    position: relative;
  }

  .profiled::before {
    content: attr(data-text);
    position: absolute;
    top: 30px;
    left: 220px;
    width: 100px;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid $disabled-color;
    background-color: $font-color;
    color: $text-color;
    text-align: center;
    box-shadow: var(--box-shadow-color) 0 2px 3px;
    display: none;
  }

  .profiled::after {
    content: "";
    position: absolute;
    left: 250px;
    top: 20px;
    border: 6px solid $font-color;
    border-color: transparent transparent $font-color;
    display: none;
  }

  .profiled:hover::before,
  .profiled:hover::after {
    display: block;
    z-index: 999;
  }

  .trace-item-error {
    color: #e54c17;
  }

  .trace-item {
    display: flex;
    flex-direction: row;
    white-space: nowrap;
    position: relative;
    width: 100%;
    padding: 2px 0;
  }

  .trace-item.selected {
    background-color: var(--sw-list-selected);
  }

  .trace-item:not(.level0):hover {
    background-color: var(--sw-list-hover);
  }

  .trace-item > div {
    padding: 0 5px;
    display: inline-block;
    border: 1px solid transparent;
    border-right: 1px dotted silver;
    overflow: hidden;
    line-height: 30px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .trace-item > div.method {
    padding-left: 10px;
    cursor: pointer;
  }

  .trace-item div.exec-percent {
    width: calc(100% - 1050px);
    height: 30px;
    padding: 0 8px;

    .outer-progress_bar {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: rgb(63 177 227);
      position: relative;
      margin-top: 11px;
      border: none;
    }

    .inner-progress_bar {
      position: absolute;
      background: rgb(110 64 170);
      height: 4px;
      border-radius: 2px;
      left: 0;
      border: none;
      top: 1px;
    }
  }

  .link-span {
    text-decoration: underline;
  }
</style>
