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
      :is="graph.type"
      :intervalTime="appStoreWithOut.intervalTime"
      :data="source"
      :config="{
        i: 0,
        ...graph,
        metrics: widget.metricNames,
        metricTypes: widget.metricTypes,
        metricConfig: widget.metricConfig,
      }"
      :needQuery="true"
    />
    <div v-show="!widget.type" class="no-data">
      {{ t("noData") }}
    </div>
  </div>
</template>
<script lang="ts">
  import { computed, ref, defineComponent } from "vue";
  import { useI18n } from "vue-i18n";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { useRoute } from "vue-router";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useQueryProcessor, useSourceProcessor, useGetMetricEntity } from "@/hooks/useMetricsProcessor";
  import graphs from "./graphs";
  import { EntityType, QueryOrders, Status } from "./data";

  export default defineComponent({
    name: "WidgetEdit",
    components: {
      ...graphs,
    },
    setup() {
      const { t } = useI18n();
      const appStoreWithOut = useAppStoreWithOut();
      const selectorStore = useSelectorStore();
      const widget = computed<any>(() => JSON.parse(useRoute().params.config as string));
      const graph = computed(() => widget.value.graph || {});
      const source = ref<unknown>({});
      const loading = ref<boolean>(false);
      const dashboardStore = useDashboardStore();

      init();
      async function init() {
        dashboardStore.setEntity(widget.value.entity);
        await setSelector();
        await queryMetrics();
      }
      async function setSelector() {
        if (widget.value.serviceId) {
          await selectorStore.getService(widget.value.serviceId);
        }
        if (widget.value.serviceInstanceId) {
          await selectorStore.getInstance(widget.value.serviceInstanceId);
        }
        if (widget.value.serviceInstanceId) {
          await selectorStore.getEndpoint(widget.value.endpointId);
        }
      }
      async function queryMetrics() {
        const metricTypes = widget.value.metricTypes || [];
        const metrics = widget.value.metricNames || [];
        const catalog = await useGetMetricEntity(metrics[0], metricTypes[0]);
        const params = await useQueryProcessor({ ...widget.value.data, catalog });
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
          metrics: widget.value.metricNames || [],
          metricTypes: widget.value.metricTypes || [],
          metricConfig: widget.value.metricConfig || [],
        };
        source.value = useSourceProcessor(json, d);
      }
      return {
        t,
        graph,
        source,
        appStoreWithOut,
        widget,
      };
    },
  });
</script>
<style lang="scss" scoped>
  .render-chart {
    padding: 5px;
    height: 400px;
    width: 100%;
  }

  .no-data {
    font-size: 14px;
    text-align: center;
    line-height: 400px;
  }
</style>
