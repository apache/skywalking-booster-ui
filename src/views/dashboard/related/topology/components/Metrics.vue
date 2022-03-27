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
      <span class="label">{{ t("metrics") }}</span>
      <SelectSingle
        :value="currentMetric"
        :options="metrics"
        @change="changeMetric"
        class="selectors"
      />
    </div>
    <div class="item mb-10">
      <span class="label">{{ t("unit") }}</span>
      <el-input
        class="input"
        v-model="currentConfig.unit"
        size="small"
        placeholder="Please input unit"
        @change="changeConfigs({ unit: currentConfig.unit })"
      />
    </div>
    <div class="item mb-10">
      <span class="label">{{ t("labels") }}</span>
      <el-input
        class="input"
        v-model="currentConfig.label"
        size="small"
        placeholder="Please input a label"
        @change="changeConfigs({ label: currentConfig.label })"
      />
    </div>
    <div class="item mb-10">
      <span class="label">{{ t("aggregation") }}</span>
      <SelectSingle
        :value="currentConfig.calculation"
        :options="CalculationOpts"
        @change="changeConfigs({ calculation: $event })"
        class="selectors"
        :clearable="true"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { CalculationOpts } from "../../../data";
import { useDashboardStore } from "@/store/modules/dashboard";
import { MetricConfigOpt } from "@/types/dashboard";
import { Option } from "element-plus/es/components/select-v2/src/select.types";

/*global defineEmits, defineProps */
const props = defineProps({
  currentMetricConfig: {
    type: Object as PropType<MetricConfigOpt>,
    default: () => ({ unit: "" }),
  },
  type: { type: String, default: "" },
  metrics: { type: Array as PropType<string[]>, default: () => [] },
});
const { t } = useI18n();
const emit = defineEmits(["update"]);
const dashboardStore = useDashboardStore();
const m = props.metrics.map((d: string) => {
  return { label: d, value: d };
});
const metrics = ref<Option[]>(m.length ? m : [{ label: "", value: "" }]);
const currentMetric = ref<string>(metrics.value[0].value);
const currentConfig = ref<{ unit: string; calculation: string; label: string }>(
  {
    unit: "",
    calculation: "",
    label: "",
  }
);
const currentIndex = ref<number>(0);
const getMetricConfig = computed(() => {
  let config = [];
  switch (props.type) {
    case "linkServerMetricConfig":
      config = dashboardStore.selectedGrid.linkServerMetricConfig;
      break;
    case "linkClientMetricConfig":
      config = dashboardStore.selectedGrid.linkClientMetricConfig;
      break;
    case "nodeMetricConfig":
      config = dashboardStore.selectedGrid.nodeMetricConfig;
      break;
  }
  return config || [];
});

function changeConfigs(param: { [key: string]: string }) {
  const metricConfig = getMetricConfig.value || [];
  metricConfig[currentIndex.value] = {
    ...metricConfig[currentIndex.value],
    ...param,
  };
  currentConfig.value = metricConfig[currentIndex.value];
  emit("update", { [props.type]: metricConfig });
}
function changeMetric(val: string) {
  currentMetric.value = val;
  const index = metrics.value.findIndex((d: Option) => d.value === val);
  currentIndex.value = index || 0;
  const config = getMetricConfig.value || [];

  currentConfig.value = {
    unit: "",
    label: "",
    calculation: "",
    ...config[index],
  };
}
watch(
  () => props.type,
  () => {
    const m = props.metrics.map((d: string) => {
      return { label: d, value: d };
    });
    metrics.value = m.length ? m : [{ label: "", value: "" }];
    currentMetric.value = metrics.value[0].value;
    const config = getMetricConfig.value || [];
    currentIndex.value = 0;
    currentConfig.value = {
      unit: "",
      label: "",
      calculation: "",
      ...config[0],
    };
  }
);
</script>
<style lang="scss" scoped>
.config-panel {
  padding: 10px 5px;
  position: relative;
  min-height: 300px;
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
