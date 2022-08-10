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
  <grid-layout
    v-model:layout="layout"
    :col-num="24"
    :row-height="10"
    :is-draggable="false"
    :is-resizable="false"
    v-if="layout.length"
  >
    <grid-item
      v-for="item in layout"
      :x="item.x"
      :y="item.y"
      :w="item.w"
      :h="item.h"
      :i="item.i"
      :key="item.i"
      @click="clickGrid(item)"
      :class="{ active: networkProfilingStore.activeMetricIndex === item.i }"
    >
      <metric-widget
        :data="item"
        :activeIndex="networkProfilingStore.activeMetricIndex"
      />
    </grid-item>
  </grid-layout>
  <div class="no-data-tips" v-else>{{ t("noWidget") }}</div>
</template>
<script lang="ts" setup>
import type { PropType } from "vue";
import { onBeforeUnmount, defineProps, ref } from "vue";
import { useI18n } from "vue-i18n";
import { LayoutConfig } from "@/types/dashboard";
import MetricWidget from "./MetricWidget.vue";
import { useNetworkProfilingStore } from "@/store/modules/network-profiling";

const props = defineProps({
  widgets: {
    type: Array as PropType<LayoutConfig[]>,
    default: () => [],
  },
});
const { t } = useI18n();
const networkProfilingStore = useNetworkProfilingStore();
const layout = ref<LayoutConfig[]>(props.widgets || []);

function clickGrid(item: LayoutConfig) {
  networkProfilingStore.setActiveItem(item.i);
  networkProfilingStore.setSelectedMetric(item);
}
onBeforeUnmount(() => {
  networkProfilingStore.setMetricsLayout([]);
});
</script>
