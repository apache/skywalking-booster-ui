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
    v-if="!isNaN(singleVal)"
    class="chart-card"
    :style="{
      fontSize: `${config.fontSize}px`,
      justifyContent: config.textAlign || 'center',
    }"
  >
    {{ singleVal.toFixed(2) }}
    <span class="unit" v-show="config.showUnit && unit">
      {{ decodeURIComponent(unit) }}
    </span>
  </div>
  <div class="center no-data" v-else>{{ t("noData") }}</div>
</template>
<script lang="ts" setup>
import { computed, PropType } from "vue";
import { useI18n } from "vue-i18n";
import { CardConfig, MetricConfigOpt } from "@/types/dashboard";

/*global defineProps */
const props = defineProps({
  data: {
    type: Object as PropType<{ [key: string]: number }>,
    default: () => ({}),
  },
  config: {
    type: Object as PropType<CardConfig & { metricConfig?: MetricConfigOpt[] }>,
    default: () => ({
      fontSize: 12,
      showUnit: true,
      textAlign: "center",
      metricConfig: [],
    }),
  },
});
const { t } = useI18n();
const metricConfig = computed(() => props.config.metricConfig || []);
const key = computed(() => Object.keys(props.data)[0]);
const singleVal = computed(() => Number(props.data[key.value]));
const unit = computed(
  () =>
    metricConfig.value[0] &&
    encodeURIComponent(metricConfig.value[0].unit || "")
);
</script>
<style lang="scss" scoped>
.chart-card {
  color: #333;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.no-data {
  height: 100%;
  color: #666;
}

.unit {
  display: inline-block;
  margin-left: 2px;
}
</style>
