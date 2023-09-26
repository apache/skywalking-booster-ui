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
  <div class="trace-tree-charts flex-v">
    <div>
      <span
        class="time-charts-item mr-5"
        v-for="(i, index) in list"
        :key="index"
        :style="`color:${computedScale(index)}`"
      >
        <Icon iconName="issue-open-m" class="mr-5" size="sm" />
        <span>{{ i }}</span>
      </span>
    </div>
    <div style="padding: 10px 0">
      <a class="trace-tree-btn mr-10" @click="charts.tree.setDefault()">
        {{ t("default") }}
      </a>
      <a class="trace-tree-btn mr-10" @click="charts.tree.getTopSlow()">
        {{ t("topSlow") }}
      </a>
      <a class="trace-tree-btn mr-10" @click="charts.tree.getTopChild()">
        {{ t("topChildren") }}
      </a>
    </div>
    <div class="trace-tree">
      <Graph ref="charts" :data="data" :traceId="traceId" type="Tree" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import * as d3 from "d3";
  import Graph from "./D3Graph/Index.vue";
  import type { PropType } from "vue";
  import type { Span } from "@/types/trace";
  import { useI18n } from "vue-i18n";
  import { ref, computed } from "vue";

  /* global defineProps */
  const props = defineProps({
    data: { type: Array as PropType<Span[]>, default: () => [] },
    traceId: { type: String, default: "" },
  });
  const { t } = useI18n();
  const list = computed(() => Array.from(new Set(props.data.map((i: Span) => i.serviceCode))));
  const charts = ref<any>(null);

  function computedScale(i: number) {
    const sequentialScale = d3
      .scaleSequential()
      .domain([0, list.value.length + 1])
      .interpolator(d3.interpolateCool);
    return sequentialScale(i);
  }
</script>
<style lang="scss" scoped>
  .trace-tree {
    height: 100%;
    overflow: auto;
  }

  .trace-tree-btn {
    display: inline-block;
    border-radius: 4px;
    padding: 0 7px;
    background-color: #40454e;
    color: #eee;
    font-size: 11px;
  }

  .trace-tree-charts {
    overflow: auto;
    padding: 10px;
    position: relative;
    height: 100%;
    width: 100%;
  }

  .time-charts-item {
    display: inline-block;
    padding: 2px 8px;
    border: 1px solid;
    font-size: 11px;
    border-radius: 4px;
  }
</style>
