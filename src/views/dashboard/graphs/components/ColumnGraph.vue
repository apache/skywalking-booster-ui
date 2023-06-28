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
  <el-table-column
    v-for="(metric, index) in colMetrics"
    :label="`${decodeURIComponent(getLabel(metric, index))} ${decodeURIComponent(getUnit(index))}`"
    :key="metric + index"
    min-width="150"
  >
    <template #default="scope">
      <div class="chart">
        <Line
          v-if="useListConfig(config, index).isLinear && config.metricMode !== MetricModes.Expression"
          :data="{
            [metric]: scope.row[metric] && scope.row[metric].values,
          }"
          :intervalTime="intervalTime"
          :config="{
            showXAxis: false,
            showYAxis: false,
            smallTips: true,
            showlabels: false,
          }"
        />
        <span
          class="item flex-h"
          v-else-if="useListConfig(config, index).isAvg || config.metricMode === MetricModes.Expression"
        >
          <el-popover placement="left" :width="400" trigger="click">
            <template #reference>
              <span class="trend">
                <Icon iconName="timeline" size="middle" />
              </span>
            </template>
            <div class="view-line">
              <Line
                :data="{
                  [decodeURIComponent(getLabel(colSubMetrics[index], index, true)) || metric]:
                    scope.row[colSubMetrics[index] || metric] && scope.row[colSubMetrics[index] || metric].values,
                }"
                :intervalTime="intervalTime"
                :config="{
                  showXAxis: true,
                  showYAxis: true,
                  smallTips: false,
                  showlabels: true,
                }"
              />
            </div>
          </el-popover>
          <span class="value">
            <Card
              :data="{
                [metric]: scope.row[metric] && scope.row[metric].avg,
              }"
              :config="{ textAlign: 'left' }"
            />
          </span>
        </span>
        <Card v-else :data="{ [metric]: scope.row[metric] }" :config="{ textAlign: 'left' }" />
      </div>
    </template>
  </el-table-column>
</template>

<script lang="ts" setup>
  import type { PropType } from "vue";
  import type { MetricConfigOpt } from "@/types/dashboard";
  import { useListConfig } from "@/hooks/useListConfig";
  import Line from "../Line.vue";
  import Card from "../Card.vue";
  import { MetricQueryTypes } from "@/hooks/data";
  import { ExpressionResultType, MetricModes } from "@/views/dashboard/data";

  /*global defineProps */
  const props = defineProps({
    colMetrics: { type: Array as PropType<string[]>, default: () => [] },
    colSubMetrics: { type: Array as PropType<string[]>, default: () => [] },
    config: {
      type: Object as PropType<{
        i: string;
        metricTypes: string[];
        metricConfig: MetricConfigOpt[];
        metricMode: string;
      }>,
      default: () => ({}),
    },
    intervalTime: { type: Array as PropType<string[]>, default: () => [] },
  });

  function getUnit(index: number) {
    const i = Number(index);
    const u = props.config.metricConfig && props.config.metricConfig[i] && props.config.metricConfig[i].unit;
    if (u) {
      return `(${encodeURIComponent(u)})`;
    }
    return encodeURIComponent("");
  }
  function getLabel(metric: string, index: number, isDetail?: boolean) {
    const i = Number(index);
    let label = "";
    if (isDetail) {
      label =
        (props.config.metricConfig && props.config.metricConfig[i] && props.config.metricConfig[i].detailLabel) || "";
    } else {
      label = (props.config.metricConfig && props.config.metricConfig[i] && props.config.metricConfig[i].label) || "";
    }
    if (label) {
      if (
        (
          [
            MetricQueryTypes.ReadLabeledMetricsValues,
            ExpressionResultType.TIME_SERIES_VALUES,
            ExpressionResultType.SINGLE_VALUE,
          ] as string[]
        ).includes(props.config.metricTypes[i])
      ) {
        const name = (label || "").split(",").map((item: string) => item.replace(/^\s*|\s*$/g, ""))[
          props.config.metricConfig[i].index || 0
        ];
        return encodeURIComponent(name || "");
      }
      return encodeURIComponent(label);
    }
    return encodeURIComponent(metric || "");
  }
</script>
<style lang="scss" scoped>
  .chart {
    height: 40px;
  }

  .view-line {
    width: 380px;
    height: 200px;
  }

  .item {
    display: inline-block;
    width: 100%;
    height: 100%;
  }

  .trend {
    width: 30px;
    display: inline-block;
    height: 100%;
    cursor: pointer;
    color: $active-color;
  }

  .value {
    display: inline-block;
    flex-grow: 2;
    height: 100%;
    width: calc(100% - 30px);
  }
</style>
