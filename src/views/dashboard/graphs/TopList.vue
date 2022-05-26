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
  <div class="top-list" v-if="available">
    <div class="chart-slow-i" v-for="(i, index) in data[key]" :key="index">
      <div class="ell tools flex-h">
        <div class="desc">
          <span class="calls mr-10">{{ i.value }}</span>
          <span class="cp mr-20">
            {{ i.name }}
          </span>
        </div>
        <div class="copy">
          <Icon
            iconName="review-list"
            size="middle"
            class="cp"
            @click="handleClick(i.name)"
          />
        </div>
      </div>
      <el-progress
        :stroke-width="6"
        :percentage="(i.value / maxValue) * 100"
        :color="TextColors[config.color || 'purple']"
        :show-text="false"
      />
    </div>
  </div>
  <div class="center no-data" v-else>No Data</div>
</template>
<script lang="ts" setup>
import type { PropType } from "vue";
import { computed } from "vue";
import copy from "@/utils/copy";
import { TextColors } from "@/views/dashboard/data";
/*global defineProps */
const props = defineProps({
  data: {
    type: Object as PropType<{
      [key: string]: { name: string; value: number; traceIds: string[] }[];
    }>,
    default: () => ({}),
  },
  config: {
    type: Object as PropType<{ color: string }>,
    default: () => ({ color: "purple" }),
  },
  intervalTime: { type: Array as PropType<string[]>, default: () => [] },
});
const key = computed(() => Object.keys(props.data)[0] || "");
const available = computed(
  () =>
    Array.isArray(props.data[key.value]) &&
    props.data[key.value][0] &&
    props.data[key.value][0].value
);
const maxValue = computed(() => {
  if (!(props.data[key.value] && props.data[key.value].length)) {
    return 0;
  }
  const temp: number[] = props.data[key.value].map((i: any) => i.value);
  return Math.max.apply(null, temp);
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

.tools {
  justify-content: space-between;
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
}

.desc {
  flex-grow: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy {
  width: 30px;
}

.calls {
  font-size: 12px;
  padding: 0 5px;
  display: inline-block;
  background-color: #40454e;
  color: #eee;
  border-radius: 4px;
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

.no-data {
  height: 100%;
  color: #666;
  box-sizing: border-box;
  display: -webkit-box;
  -webkit-box-orient: horizontal;
  -webkit-box-pack: center;
  -webkit-box-align: center;
}
</style>
