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
  <div class="render-chart">
    <component
      :is="config.graph"
      :intervalTime="appStoreWithOut.intervalTime"
      :data="source"
      :config="{
        i: 0,
        metrics: config.metrics,
        metricTypes: config.metricTypes,
        metricConfig: config.metricConfig,
      }"
      :needQuery="true"
    />
    <div v-show="!config.type" class="no-data">
      {{ t("noData") }}
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { useRoute } from "vue-router";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useQueryProcessor, useSourceProcessor, useGetMetricEntity } from "@/hooks/useMetricsProcessor";

  const { t } = useI18n();
  const appStoreWithOut = useAppStoreWithOut();
  const config = computed<any>(() => useRoute().params);
  const source = ref<any>({});
  const loading = ref<boolean>(false);
  const dashboardStore = useDashboardStore();

  queryMetrics();

  async function queryMetrics() {
    const metricTypes = config.value.metricTypes || [];
    const metrics = config.value.metrics || [];
    const catalog = await useGetMetricEntity(metrics[0], metricTypes[0]);
    const params = await useQueryProcessor({ ...config.value.data, catalog });

    if (!params) {
      source.value = {};
      return;
    }
    loading.value = true;
    const json = await dashboardStore.fetchMetricValue(params);
    loading.value = false;
    if (!json) {
      return;
    }
    const d = {
      metrics: config.value.metrics || [],
      metricTypes: config.value.metricTypes || [],
      metricConfig: config.value.metricConfig || [],
    };
    source.value = useSourceProcessor(json, d);
  }
</script>
