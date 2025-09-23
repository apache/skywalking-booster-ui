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
  <div class="flex-h trace-type">
    <el-radio-group v-model="spansGraphType" size="small">
      <el-radio-button
        v-for="option in GraphTypeOptions"
        :key="option.value"
        :value="option.value"
        v-show="option.value !== GraphTypeOptions[4].value && traceStore.hasQueryTracesV2Support"
      >
        <Icon :iconName="option.icon" />
        {{ t(option.label) }}
      </el-radio-button>
    </el-radio-group>
  </div>
  <TraceQuery v-if="spansGraphType === GraphTypeOptions[4].value" style="height: calc(100% - 70px)" />
  <div v-if="spansGraphType !== GraphTypeOptions[4].value" class="search-bar">
    <Filter :needQuery="needQuery" :data="data" @get="getService" @search="popSegmentList" />
  </div>
  <div v-if="spansGraphType !== GraphTypeOptions[4].value" class="trace flex-h">
    <SegmentList class="trace-list" :style="`width: ${currentWidth}px;`" />
    <div
      @mouseover="showIcon = true"
      @mouseout="showIcon = false"
      @mousedown="mousedown($event)"
      @mouseup="mouseup($event)"
    >
      <div class="trace-line" />
      <span class="trace-icon" v-show="showIcon" @mousedown="triggerArrow" @mouseup="stopObserve($event)">
        <Icon class="trace-arrow" :icon-name="isLeft ? 'chevron-left' : 'chevron-right'" size="lg" />
      </span>
    </div>
    <SpanList :serviceId="serviceId" :spansGraphType="spansGraphType" />
  </div>
</template>
<script lang="ts" setup>
  import { provide, ref, onMounted, onUnmounted } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import { useTraceStore } from "@/store/modules/trace";
  import Filter from "./components/TraceList/Filter.vue";
  import SegmentList from "./components/TraceList/SegmentList.vue";
  import SpanList from "./components/TraceList/SpanList.vue";
  import type { LayoutConfig } from "@/types/dashboard";
  import { mutationObserver } from "@/utils/mutation";
  import TraceQuery from "./components/TraceQuery/Index.vue";
  /*global defineProps */
  const props = defineProps({
    data: {
      type: Object as PropType<LayoutConfig>,
      default: () => ({}),
    },
  });
  const { t } = useI18n();
  provide("options", props.data);
  const traceStore = useTraceStore();
  const serviceId = ref<string>("");
  const showIcon = ref<boolean>(false);
  const isLeft = ref<boolean>(true);
  const currentWidth = ref<number>(280);
  const needQuery = ref<boolean>(true);
  const isDrag = ref<boolean>(false);
  const defaultWidth = 280;
  const minArrowLeftWidth = 120;
  const GraphTypeOptions = [
    { value: "List", icon: "list-bulleted", label: "list" },
    { value: "Tree", icon: "issue-child", label: "tree" },
    { value: "Table", icon: "table", label: "table" },
    { value: "Statistics", icon: "statistics-bulleted", label: "statistics" },
    { value: "Query", icon: "search", label: "query" },
  ] as const;
  type SpansGraphType = typeof GraphTypeOptions[number]["value"];
  const spansGraphType = ref<SpansGraphType>(GraphTypeOptions[0].value);

  onMounted(async () => {
    await traceStore.getHasQueryTracesV2Support();
  });

  function getService(id: string) {
    serviceId.value = id;
  }

  // When click the arrow, the width of the segment list is determined by the direction it points to.
  function triggerArrow() {
    currentWidth.value = isLeft.value ? 0 : defaultWidth;
    isLeft.value = !isLeft.value;
    startObserve();
  }
  function popSegmentList() {
    if (currentWidth.value >= defaultWidth) {
      return;
    }
    currentWidth.value = defaultWidth;
    isLeft.value = true;
  }

  function startObserve() {
    mutationObserver.observe("trigger-resize", document.querySelector(".trace-list")!, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }
  function stopObserve(event: MouseEvent) {
    mutationObserver.disconnect("trigger-resize");
    event.stopPropagation();
  }

  const mousemove = (event: MouseEvent) => {
    if (!isDrag.value) {
      return;
    }
    const diffX = event.clientX;
    let leftWidth = document.querySelector(".trace-list")!.getBoundingClientRect();
    currentWidth.value = diffX - leftWidth.left;
    isLeft.value = currentWidth.value >= minArrowLeftWidth;
  };
  const mouseup = (event: MouseEvent) => {
    showIcon.value = false;
    isDrag.value = false;
    stopObserve(event);
  };
  const mousedown = (event: MouseEvent) => {
    if ((event.target as HTMLDivElement)?.className === "trace-line") {
      isDrag.value = true;
      startObserve();
      event.stopPropagation();
    }
  };
  onMounted(() => {
    document.addEventListener("mousedown", mousedown);
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  });
  onUnmounted(() => {
    document.removeEventListener("mousedown", mousedown);
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseup);
  });
</script>
<style lang="scss" scoped>
  .trace-type {
    padding: 10px 0 10px 10px;
    border-bottom: 1px solid $border-color-primary;

    /* Make radio buttons content align nicely with icons */
    :deep(.el-radio-button__inner) {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
  }

  .search-bar {
    padding: 10px;
    font-size: $font-size-smaller;
    border-bottom: 1px solid $border-color;
    min-width: 1000px;
  }

  .trace {
    min-height: calc(100% - 160px);
    width: 100%;
    overflow: auto;
    min-width: 1000px;
  }

  .trace-list {
    max-width: 480px;
  }

  .trace-line {
    position: relative;
    width: 2px;
    height: 100%;
    background-color: var(--sw-trace-line);
    cursor: ew-resize;

    &:hover {
      color: $active-color;
      background-color: $active-background;
    }
  }

  .trace-icon {
    position: absolute;
    cursor: pointer;
    top: calc(50% - 15px);
    text-align: center;
    width: 24px;
    height: 24px;
    transform: translateX(-11px);
    line-height: 24px;
    border-radius: 50%;
    background-color: $layout-background;
    box-shadow: 0 3px 5px rgb(45 60 80 / 20%);
  }

  .trace-arrow {
    padding-bottom: 1px;
    color: $active-color;
  }
</style>
