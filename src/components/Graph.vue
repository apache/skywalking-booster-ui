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
  <div ref="chartRef" :style="`height:${height};width:${width};`"></div>
</template>
<script lang="ts" setup>
import { watch, ref, Ref, onMounted, onBeforeUnmount, unref } from "vue";
import type { PropType } from "vue";
import { useECharts } from "@/hooks/useEcharts";
import { addResizeListener, removeResizeListener } from "@/utils/event";
import { useTimeoutFn } from "@/hooks/useTimeout";

/*global Nullable, defineProps, defineEmits*/
const emits = defineEmits(["select"]);
const chartRef = ref<Nullable<HTMLDivElement>>(null);
const { setOptions, resize, getInstance } = useECharts(
  chartRef as Ref<HTMLDivElement>
);
const props = defineProps({
  height: { type: String, default: "100%" },
  width: { type: String, default: "100%" },
  option: {
    type: Object as PropType<{ [key: string]: unknown }>,
    default: () => ({}),
  },
});

onMounted(async () => {
  await setOptions(props.option);
  addResizeListener(unref(chartRef), resize);
  useTimeoutFn(() => {
    const instance = getInstance();

    instance.on("click", (params: any) => {
      emits("select", params);
    });
  }, 1000);
});

watch(
  () => props.option,
  (newVal, oldVal) => {
    if (JSON.stringify(newVal) === JSON.stringify(oldVal)) {
      return;
    }
    setOptions(newVal);
  }
);

onBeforeUnmount(() => {
  removeResizeListener(unref(chartRef), resize);
});
</script>
