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
    :style="`width: ${config.width || '100%'}; max-height:${
      isRight ? '100%' : 130
    }`"
    v-if="source.length"
    class="legend"
  >
    <div class="col-item">
      <span></span>
      <span v-for="h in headers" :key="h.value">{{ h.label }}</span>
    </div>
    <div class="col-item" v-for="(item, index) in source" :key="index">
      <span>
        <Icon iconName="circle" :style="`color: ${colors[index]};`" />
        <i style="font-style: normal">{{ item.name }}</i>
      </span>
      <span v-for="h in headers" :key="h.value">{{ item[h.value] }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { PropType } from "vue";
import { LegendOptions } from "@/types/dashboard";
import useLegendProcess from "@/hooks/useLegendProcessor";

/*global defineProps */
const props = defineProps({
  data: {
    type: Object as PropType<{ [key: string]: number[] }>,
    default: () => ({}),
  },
  config: {
    type: Object as PropType<LegendOptions>,
    default: () => ({}),
  },
});
const { aggregations, chartColors, isRight } = useLegendProcess(props.config);
const { source, headers } = aggregations(props.data);
const keys = Object.keys(props.data || {}).filter(
  (i: any) => Array.isArray(props.data[i]) && props.data[i].length
);
const colors = chartColors(keys);
</script>
