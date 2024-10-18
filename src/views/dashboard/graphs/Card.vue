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
    v-if="singleVal !== null && !isNaN(singleVal)"
    class="chart-card"
    :style="{
      fontSize: `${config.fontSize}px`,
      justifyContent: config.textAlign || 'center',
    }"
  >
    {{ getValue() }}
    <span class="unit" v-show="config.showUnit && unit">
      {{ decodeURIComponent(unit) }}
    </span>
  </div>
  <div v-else class="card-no-data" :class="config.textAlign === 'center' ? 'center' : ''">{{ t("noData") }}</div>
</template>
<script lang="ts" setup>
  import { computed } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import type { CardConfig, MetricConfigOpt } from "@/types/dashboard";
  import { ElMessage } from "element-plus";

  /*global defineProps */
  const props = defineProps({
    data: {
      type: Object as PropType<{ [key: string]: any }>,
      default: () => ({}),
    },
    config: {
      type: Object as PropType<CardConfig & { metricConfig?: MetricConfigOpt[] }>,
      default: () => ({
        fontSize: 12,
        showUnit: true,
        textAlign: "center",
        metricConfig: [],
        valueMappings: {},
      }),
    },
  });
  const { t } = useI18n();
  const metricConfig = computed(() => props.config.metricConfig || []);
  const valueMappings = computed(() => props.config.valueMappings || {});
  const key = computed(() => Object.keys(props.data)[0]);
  const singleVal = computed(() =>
    Array.isArray(props.data[key.value]) ? props.data[key.value][0] : props.data[key.value],
  );
  const unit = computed(() => metricConfig.value[0] && encodeURIComponent(metricConfig.value[0].unit || ""));

  function getValue() {
    if (valueMappings.value[singleVal.value]) {
      return valueMappings.value[singleVal.value];
    }
    const list = Object.keys(valueMappings.value);
    for (const i of list) {
      try {
        if (new RegExp(i).test(String(singleVal.value))) {
          return valueMappings.value[i] || singleVal.value;
        }
      } catch (e) {
        ElMessage.error("invalid regex string");
        return singleVal.value;
      }
    }
    return singleVal.value;
  }
</script>
<style lang="scss" scoped>
  .chart-card {
    color: $font-color;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .card-no-data {
    height: 100%;
    color: #666;
    display: flex;
    align-items: center;
    font-size: $font-size-normal;
  }

  .unit {
    display: inline-block;
    margin-left: 2px;
  }

  .center {
    justify-content: center;
  }
</style>
