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
  <div class="content">
    <div class="header">
      <span>{{ decodeURIComponent(title) }}</span>
      <div class="tips" v-show="tips">
        <el-tooltip :content="decodeURIComponent(tips) || ''">
          <span>
            <Icon iconName="info_outline" size="sm" />
          </span>
        </el-tooltip>
      </div>
    </div>
    <div class="widget-chart" :style="{ height: config.height - 60 + 'px' }">
      <component
        :is="graph.type"
        :intervalTime="appStoreWithOut.intervalTime"
        :data="source"
        :config="{
          i: 0,
          ...graph,
          metrics: config.metrics,
          metricTypes: config.metricTypes,
          metricConfig: config.metricConfig,
          metricMode: config.metricMode,
          expressions: config.expressions || [],
          typesOfMQE: typesOfMQE || [],
          subExpressions: config.subExpressions || [],
          subTypesOfMQE: config.subTypesOfMQE || [],
        }"
        :needQuery="true"
      />
      <div v-show="!config.type" class="no-data">
        {{ t("noData") }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { computed, ref, defineComponent, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { useRoute } from "vue-router";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useQueryProcessor, useSourceProcessor } from "@/hooks/useMetricsProcessor";
  import { useExpressionsQueryProcessor } from "@/hooks/useExpressionsProcessor";
  import graphs from "./graphs";
  import { EntityType } from "./data";
  import timeFormat from "@/utils/timeFormat";
  import { MetricModes } from "./data";

  export default defineComponent({
    name: "WidgetPage",
    components: {
      ...graphs,
    },
    setup() {
      const { t } = useI18n();
      const appStoreWithOut = useAppStoreWithOut();
      const selectorStore = useSelectorStore();
      const route = useRoute();
      const config = computed<any>(() => JSON.parse(decodeURIComponent(route.params.config as string) as string));
      const graph = computed(() => config.value.graph || {});
      const source = ref<unknown>({});
      const loading = ref<boolean>(false);
      const dashboardStore = useDashboardStore();
      const title = computed(() => (config.value.widget && config.value.widget.title) || "");
      const tips = computed(() => (config.value.widget && config.value.widget.tips) || "");
      const typesOfMQE = ref<string[]>([]);

      init();
      async function init() {
        dashboardStore.setLayer(route.params.layer);
        dashboardStore.setEntity(route.params.entity);
        const { auto, autoPeriod } = config.value;
        if (auto) {
          await setDuration();
          appStoreWithOut.setReloadTimer(setInterval(setDuration, autoPeriod * 1000));
        } else {
          const duration = JSON.parse(route.params.duration as string);
          appStoreWithOut.setDuration(duration);
        }
        await setSelector();
        await queryMetrics();
      }
      async function setDuration() {
        const dates: Date[] = [new Date(new Date().getTime() - config.value.auto), new Date()];

        appStoreWithOut.setDuration(timeFormat(dates));
      }
      async function setSelector() {
        const { serviceId, podId, processId, destServiceId, destPodId, destProcessId, entity } = route.params;
        if (serviceId) {
          await selectorStore.getService(serviceId);
        }
        if (
          [EntityType[4].value, EntityType[5].value, EntityType[6].value, EntityType[7].value].includes(
            entity as string,
          )
        ) {
          await selectorStore.getService(destServiceId, true);
        }
        if ([EntityType[3].value, EntityType[5].value, EntityType[7].value].includes(entity as string)) {
          await selectorStore.getInstance(podId);
        }
        if ([EntityType[2].value, EntityType[6].value].includes(entity as string)) {
          await selectorStore.getEndpoint(podId);
        }
        if (EntityType[6].value === entity) {
          await selectorStore.getEndpoint(destPodId, true);
        }
        if ([EntityType[5].value, EntityType[7].value].includes(entity as string)) {
          await selectorStore.getInstance(destPodId, true);
        }
        if (EntityType[7].value === entity) {
          selectorStore.getProcess(processId);
          selectorStore.getProcess(destProcessId, true);
        }
      }
      async function queryMetrics() {
        const isExpression = config.value.metricMode === MetricModes.Expression;
        if (isExpression) {
          loading.value = true;
          const params = await useExpressionsQueryProcessor({
            metrics: config.value.expressions || [],
            metricConfig: config.value.metricConfig || [],
            subExpressions: config.value.subExpressions || [],
          });

          loading.value = false;
          source.value = params.source || {};
          typesOfMQE.value = params.typesOfMQE;
          return;
        }
        const params = await useQueryProcessor({ ...config.value });
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
        source.value = await useSourceProcessor(json, d);
      }
      watch(
        () => appStoreWithOut.durationTime,
        () => {
          queryMetrics();
        },
      );
      return {
        t,
        graph,
        source,
        appStoreWithOut,
        config,
        title,
        tips,
        typesOfMQE,
      };
    },
  });
</script>
<style lang="scss" scoped>
  .content {
    min-width: 100px;
    border: 1px solid $border-color-primary;
    background-color: $theme-background;
    position: relative;
  }

  .widget-chart {
    background-color: $theme-background;
    box-shadow: 0 1px 4px 0 #00000029;
    border-radius: 3px;
    padding: 5px;
    width: 100%;
  }

  .no-data {
    font-size: $font-size-normal;
    text-align: center;
    line-height: 400px;
  }

  .header {
    height: 25px;
    line-height: 25px;
    text-align: center;
    background-color: aliceblue;
    font-size: $font-size-smaller;
    position: relative;
  }

  .tips {
    position: absolute;
    right: 5px;
    top: 0;
  }
</style>
