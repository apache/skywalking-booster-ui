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
  <g>
    <rect
      v-if="mouseDownX !== undefined && currentX !== undefined"
      :x="`${Math.min(mouseDownX, currentX)}%`"
      y="0"
      :width="`${Math.abs(mouseDownX - currentX)}%`"
      height="100%"
      fill="var(--el-color-primary-light-5)"
      fill-opacity="0.2"
      pointer-events="none"
    />
    <rect
      ref="rootEl"
      x="0"
      y="0"
      width="100%"
      height="100%"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseHoverMove"
      @mouseleave="handleMouseHoverLeave"
      fill-opacity="0"
      cursor="col-resize"
    />
    <line
      v-if="hoverX"
      :x1="`${hoverX}%`"
      :y1="0"
      :x2="`${hoverX}%`"
      y2="100%"
      stroke="var(--el-color-primary-light-5)"
      stroke-width="1"
      pointer-events="none"
    />
  </g>
</template>
<script lang="ts" setup>
  import { onBeforeUnmount, ref } from "vue";

  interface Props {
    minTimestamp: number;
    maxTimestamp: number;
  }

  interface Emits {
    (e: "setSelectedMaxTimestamp", value: number): void;
    (e: "setSelectedMinTimestamp", value: number): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();
  const rootEl = ref<SVGRectElement | null>(null);
  const mouseDownX = ref<number | undefined>(undefined);
  const currentX = ref<number | undefined>(undefined);
  const hoverX = ref<number | undefined>(undefined);
  const mouseDownXRef = ref<number | undefined>(undefined);
  const isDragging = ref(false);

  function handleMouseMove(e: MouseEvent) {
    if (!rootEl.value) {
      return;
    }
    const x = calculateX(rootEl.value.getBoundingClientRect(), e.pageX);
    currentX.value = x;
  }
  function handleMouseUp(e: MouseEvent) {
    if (!isDragging.value || !rootEl.value || mouseDownXRef.value === undefined) {
      return;
    }

    const x = calculateX(rootEl.value.getBoundingClientRect(), e.pageX);
    const adjustedX = Math.abs(x - mouseDownXRef.value) < 1 ? x + 1 : x;

    const t1 = (mouseDownXRef.value / 100) * (props.maxTimestamp - props.minTimestamp) + props.minTimestamp;
    const t2 = (adjustedX / 100) * (props.maxTimestamp - props.minTimestamp) + props.minTimestamp;
    const newMinTimestmap = Math.min(t1, t2);
    const newMaxTimestamp = Math.max(t1, t2);

    emit("setSelectedMinTimestamp", newMinTimestmap);
    emit("setSelectedMaxTimestamp", newMaxTimestamp);

    currentX.value = undefined;
    mouseDownX.value = undefined;
    mouseDownXRef.value = undefined;
    isDragging.value = false;

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }

  const calculateX = (parentRect: DOMRect, x: number) => {
    const value = ((x - parentRect.left) / (parentRect.right - parentRect.left)) * 100;
    if (value <= 0) {
      return 0;
    }
    if (value >= 100) {
      return 100;
    }
    return value;
  };

  function handleMouseDown(e: MouseEvent) {
    if (!rootEl.value) {
      return;
    }
    const x = calculateX(rootEl.value.getBoundingClientRect(), e.pageX);
    currentX.value = x;
    mouseDownX.value = x;
    mouseDownXRef.value = x;
    isDragging.value = true;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  function handleMouseHoverMove(e: MouseEvent) {
    if (e.buttons !== 0 || !rootEl.value) {
      return;
    }
    const x = calculateX(rootEl.value.getBoundingClientRect(), e.pageX);
    hoverX.value = x;
  }

  function handleMouseHoverLeave() {
    hoverX.value = undefined;
  }

  onBeforeUnmount(() => {
    // Clean up any remaining document event listeners
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    isDragging.value = false;
  });
</script>
