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
  <div class="top-list">
    <div class="chart-slow-i" v-for="(i, index) in datas" :key="index">
      <Icon
        iconName="review-list"
        size="sm"
        @click="handleClick((i.traceIds && i.traceIds[0]) || i.name)"
      />
      <div class="mb-5 ell">
        <span class="calls sm mr-10">{{ i.value }}</span>
        <span class="cp link-hover">
          {{ i.name + getTraceId(i) }}
        </span>
      </div>
      <el-progress
        :stroke-width="10"
        :percentage="(i.value / maxValue) * 100"
        color="#bf99f8"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { PropType } from "vue";
import { computed } from "vue";
import copy from "@/utils/copy";
/*global defineProps */
const props = defineProps({
  data: {
    type: Object as PropType<{
      [key: string]: { name: string; value: number; traceIds: string[] }[];
    }>,
    default: () => ({}),
  },
  config: {
    type: Object as PropType<{ sortOrder: string }>,
    default: () => ({}),
  },
  intervalTime: { type: Array as PropType<string[]>, default: () => [] },
});
const key = computed(() => Object.keys(props.data)[0]);
const maxValue = computed(() => {
  if (!props.data[key.value].length) {
    return 0;
  }
  const temp: number[] = props.data[key.value].map((i: any) => i.value);
  return Math.max.apply(null, temp);
});
const getTraceId = (i: { [key: string]: (number | string)[] }): string => {
  return i.traceIds && i.traceIds[0] ? ` - ${i.traceIds[0]}` : "";
};
const datas = computed(() => {
  if (!props.data[key.value].length) {
    return [];
  }
  const { sortOrder } = props.config;
  const val: any = props.data[key.value];

  switch (sortOrder) {
    case "DES":
      val.sort((a: any, b: any) => b.value - a.value);
      break;
    case "ASC":
      val.sort((a: any, b: any) => a.value - b.value);
      break;
    default:
      val.sort((a: any, b: any) => b.value - a.value);
      break;
  }

  return val;
});
function handleClick(i: string) {
  copy(i);
}
</script>
<style lang="scss" scoped>
.top-list {
  height: 100%;
  overflow: auto;
  padding: 10px;
}

.progress-bar {
  font-size: 12px;
  color: #333;
}

.chart-slow-i {
  padding: 6px 0;
}

.chart-slow {
  height: 100%;

  .calls {
    padding: 0 5px;
    display: inline-block;
    background-color: #40454e;
    color: #eee;
    border-radius: 4px;
  }
}

.chart-slow-link {
  padding: 4px 10px 7px 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
  color: #333;
  background-color: #fff;
  will-change: opacity, background-color;
  transition: opacity 0.3s, background-color 0.3s;
}
</style>
