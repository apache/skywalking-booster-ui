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
  <div class="charts">
    <div>
      <span class="charts-item mr-5" v-for="(i, index) in list" :key="index" :style="`color:${computedScale(index)}`">
        <Icon iconName="issue-open-m" class="mr-5" size="sm" />
        <span>{{ i }}</span>
      </span>
      <el-button class="btn" size="small" type="primary" @click="downloadTrace">
        {{ t("exportImage") }}
      </el-button>
    </div>
    <div class="list">
      <Graph :data="data" :traceId="traceId" type="List" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import * as d3 from "d3";
  import type { Span } from "@/types/trace";
  import Graph from "./D3Graph/Index.vue";

  /* global defineProps, Recordable*/
  const props = defineProps({
    data: { type: Array as PropType<Span[]>, default: () => [] },
    traceId: { type: String, default: "" },
  });
  const { t } = useI18n();
  const list = computed(() => Array.from(new Set(props.data.map((i: Span) => i.serviceCode))));

  function computedScale(i: number) {
    const sequentialScale = d3
      .scaleSequential()
      .domain([0, list.value.length + 1])
      .interpolator(d3.interpolateCool);
    return sequentialScale(i);
  }

  function downloadTrace() {
    const serializer = new XMLSerializer();
    const svgNode: any = d3.select(".trace-list-dowanload").node();
    const source = `<?xml version="1.0" standalone="no"?>\r\n${serializer.serializeToString(svgNode)}`;
    const canvas = document.createElement("canvas");
    const context: any = canvas.getContext("2d");
    canvas.width = (d3.select(".trace-list-dowanload") as Recordable)._groups[0][0].clientWidth;
    canvas.height = (d3.select(".trace-list-dowanload") as Recordable)._groups[0][0].clientHeight;
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
    image.onload = () => {
      context.drawImage(image, 0, 0);
      const tagA = document.createElement("a");
      tagA.download = "trace-list.png";
      tagA.href = canvas.toDataURL("image/png");
      tagA.click();
    };
  }
</script>
<style lang="scss" scoped>
  .charts {
    overflow: auto;
    padding: 10px;
    height: 100%;
    width: 100%;
  }

  .charts-item {
    display: inline-block;
    padding: 2px 8px;
    border: 1px solid;
    font-size: 11px;
    border-radius: 4px;
  }

  .btn {
    float: right;
  }

  .list {
    height: calc(100% - 150px);
  }

  .event-tag {
    color: red;
  }
</style>
