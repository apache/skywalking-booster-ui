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
  <div class="config-panel">
    <div class="item mb-10">
      <span class="label">{{ t("unit") }}</span>
      <el-input
        class="input"
        v-model="currentMetric.unit"
        size="small"
        placeholder="Please input unit"
        @change="
          updateConfig(index, {
            unit: encodeURIComponent(currentMetric.unit || ''),
          })
        "
      />
    </div>
    <div class="item mb-10" v-if="hasLabel">
      <span class="label">{{ t("labels") }}</span>
      <el-input
        class="input"
        v-model="currentMetric.label"
        size="small"
        placeholder="Please input a name"
        @change="
          updateConfig(index, {
            label: encodeURIComponent(currentMetric.label || ''),
          })
        "
      />
    </div>
    <div class="item mb-10" v-if="metricType === 'readLabeledMetricsValues'">
      <span class="label">{{ t("labelsIndex") }}</span>
      <el-input
        class="input"
        v-model="currentMetric.labelsIndex"
        size="small"
        placeholder="auto"
        @change="
          updateConfig(index, {
            labelsIndex: encodeURIComponent(currentMetric.labelsIndex),
          })
        "
      />
    </div>
    <div class="item mb-10">
      <span class="label">{{ t("aggregation") }}</span>
      <SelectSingle
        :value="currentMetric.calculation"
        :options="CalculationOpts"
        @change="changeConfigs(index, { calculation: $event })"
        class="selectors"
        :clearable="true"
      />
    </div>
    <div class="item mb-10" v-show="isTopn">
      <span class="label">{{ t("sortOrder") }}</span>
      <SelectSingle
        :value="currentMetric.sortOrder || 'DES'"
        :options="SortOrder"
        class="selectors"
        @change="changeConfigs(index, { sortOrder: $event })"
      />
    </div>
    <div class="item" v-show="isTopn">
      <span class="label">{{ t("maxItemNum") }}</span>
      <el-input
        class="selectors"
        v-model="currentMetric.topN"
        size="small"
        placeholder="none"
        type="number"
        :min="1"
        :max="100"
        @change="changeConfigs(index, { topN: currentMetric.topN || 10 })"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { SortOrder, CalculationOpts } from "../../../data";
import { useDashboardStore } from "@/store/modules/dashboard";
import { MetricConfigOpt } from "@/types/dashboard";
import { ListChartTypes } from "../../../data";

/*global defineEmits, defineProps */
const props = defineProps({
  currentMetricConfig: {
    type: Object as PropType<MetricConfigOpt>,
    default: () => ({ unit: "" }),
  },
  index: { type: Number, default: 0 },
});
const { t } = useI18n();
const emit = defineEmits(["update"]);
const dashboardStore = useDashboardStore();
const currentMetric = ref<MetricConfigOpt>({
  ...props.currentMetricConfig,
  topN: props.currentMetricConfig.topN || 10,
});
const metricTypes = dashboardStore.selectedGrid.metricTypes || [];
const metricType = ref<string>(metricTypes[props.index]);
const hasLabel = computed(() => {
  const graph = dashboardStore.selectedGrid.graph || {};
  return (
    ListChartTypes.includes(graph.type) ||
    metricType.value === "readLabeledMetricsValues"
  );
});
const isTopn = computed(() =>
  ["sortMetrics", "readSampledRecords"].includes(metricTypes[props.index])
);
function updateConfig(index: number, param: { [key: string]: string }) {
  const key = Object.keys(param)[0];
  if (!key) {
    return;
  }
  changeConfigs(index, { [key]: decodeURIComponent(param[key]) });
}
function changeConfigs(
  index: number,
  param: { [key: string]: string | number }
) {
  const metricConfig = dashboardStore.selectedGrid.metricConfig || [];

  metricConfig[index] = { ...metricConfig[index], ...param };
  dashboardStore.selectWidget({
    ...dashboardStore.selectedGrid,
    metricConfig,
  });
  emit("update");
}
watch(
  () => props.currentMetricConfig,
  () => {
    currentMetric.value = {
      ...props.currentMetricConfig,
      topN: props.currentMetricConfig.topN || 10,
    };
  }
);
</script>
<style lang="scss" scoped>
.config-panel {
  padding: 10px 5px;
  position: relative;
}

.label {
  width: 150px;
  display: inline-block;
  font-size: 12px;
}

.close {
  position: absolute;
  top: -8px;
  right: -15px;
}

.selectors {
  width: 365px;
}
</style>
