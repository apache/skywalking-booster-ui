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
import { watch, ref, defineProps, Ref, onMounted, onBeforeUnmount } from "vue";
import type { PropType } from "vue";
import { useECharts } from "@/hooks/useEcharts";
/*global Nullable*/
const chartRef = ref<Nullable<HTMLDivElement>>(null);
const { setOptions, resize } = useECharts(chartRef as Ref<HTMLDivElement>);
const props = defineProps({
  clickEvent: { type: Function as PropType<(param: unknown) => void> },
  height: { type: String, default: "100%" },
  width: { type: String, default: "100%" },
  option: {
    type: Object as PropType<{ [key: string]: unknown }>,
    default: () => ({}),
  },
});

onMounted(() => {
  if (!chartRef.value) {
    return;
  }
  window.addEventListener("resize", resize);
});

watch(
  () => props.option,
  (opt) => {
    setOptions(opt);
  }
);

onBeforeUnmount(() => {
  if (!chartRef.value) {
    return;
  }
  window.removeEventListener("resize", resize);
});
</script>
