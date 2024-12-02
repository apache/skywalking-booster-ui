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
  <div class="trace-wrapper flex-v">
    <el-popover placement="bottom" trigger="click" :width="100" v-if="dashboardStore.editMode">
      <template #reference>
        <span class="delete cp">
          <Icon iconName="ellipsis_v" size="middle" class="operation" />
        </span>
      </template>
      <div class="tools" @click="removeWidget">
        <span>{{ t("delete") }}</span>
      </div>
    </el-popover>
    <div class="header">
      <Filter :needQuery="needQuery" :data="data" @get="getService" @search="popSegmentList" />
    </div>
    <div class="trace flex-h">
      <TraceList class="trace-list" :style="`width: ${currentWidth}px;`" />
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
      <TraceDetail :serviceId="serviceId" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { provide, ref, onMounted, onUnmounted } from "vue";
  import type { PropType } from "vue";
  import Filter from "../related/trace/Filter.vue";
  import TraceList from "../related/trace/TraceList.vue";
  import TraceDetail from "../related/trace/Detail.vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { mutationObserver } from "@/utils/mutation";

  /* global defineProps */
  const props = defineProps({
    data: {
      type: Object as PropType<any>,
      default: () => ({ graph: {} }),
    },
    activeIndex: { type: String, default: "" },
    needQuery: { type: Boolean, default: true },
  });
  provide("options", props.data);
  const defaultWidth = 280,
    minArrowLeftWidth = 120;
  const serviceId = ref<string>("");
  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const isLeft = ref<boolean>(true);
  const showIcon = ref<boolean>(false);
  const currentWidth = ref<number>(defaultWidth);
  const isDrag = ref<boolean>(false);

  function removeWidget() {
    dashboardStore.removeControls(props.data);
  }
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
  .trace-wrapper {
    width: 100%;
    height: 100%;
    font-size: $font-size-smaller;
    position: relative;
  }

  .delete {
    position: absolute;
    top: 5px;
    right: 3px;
  }

  .header {
    padding: 10px;
    font-size: $font-size-smaller;
    border-bottom: 1px solid $border-color;
    min-width: 1000px;
  }

  .tools {
    padding: 5px 0;
    color: #999;
    cursor: pointer;
    position: relative;
    text-align: center;

    &:hover {
      color: $active-color;
      background-color: $popper-hover-bg-color;
    }
  }

  .trace {
    min-height: calc(100% - 150px);
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
