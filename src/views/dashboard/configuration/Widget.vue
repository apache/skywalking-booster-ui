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
  <div class="widget-config flex-v">
    <div class="graph" v-loading="loading">
      <div class="header">
        <span>{{ decodeURIComponent(title) }}</span>
        <div class="tips" v-show="widget.tips">
          <el-tooltip :content="decodeURIComponent(tips) || ''">
            <span>
              <Icon iconName="info_outline" size="sm" />
            </span>
          </el-tooltip>
        </div>
      </div>
      <div class="render-chart">
        <component
          :is="graph.type"
          :intervalTime="appStoreWithOut.intervalTime"
          :data="states.source"
          :config="{
            ...graph,
            legend: (dashboardStore.selectedGrid.graph || {}).legend,
            i: dashboardStore.selectedGrid.i,
            metrics: dashboardStore.selectedGrid.metrics,
            metricTypes: dashboardStore.selectedGrid.metricTypes,
            metricConfig: dashboardStore.selectedGrid.metricConfig,
            relatedTrace: dashboardStore.selectedGrid.relatedTrace,
            metricMode: dashboardStore.selectedGrid.metricMode,
            expressions: dashboardStore.selectedGrid.expressions || [],
            typesOfMQE: dashboardStore.selectedGrid.typesOfMQE || [],
            subExpressions: dashboardStore.selectedGrid.subExpressions || [],
            subTypesOfMQE: dashboardStore.selectedGrid.subTypesOfMQE || [],
          }"
          :needQuery="true"
          @expressionTips="getErrors"
        />
        <div v-show="!graph.type" class="no-data">
          {{ t("noData") }}
        </div>
      </div>
    </div>
    <div class="collapse" :style="{ height: configHeight + 'px' }">
      <el-collapse v-model="states.activeNames" :style="{ '--el-collapse-header-font-size': '15px' }">
        <el-collapse-item :title="t('selectVisualization')" name="1">
          <MetricOptions @update="getSource" @loading="setLoading" :errors="errors" :subErrors="subErrors" />
        </el-collapse-item>
        <el-collapse-item :title="t('graphStyles')" name="2">
          <component :is="`${graph.type}Config`" />
        </el-collapse-item>
        <el-collapse-item :title="t('widgetOptions')" name="3">
          <WidgetOptions />
        </el-collapse-item>
        <el-collapse-item :title="t('associateOptions')" name="4" v-if="hasAssociate">
          <AssociateOptions />
        </el-collapse-item>
        <el-collapse-item :title="t('relatedTraceOptions')" name="5" v-if="hasAssociate">
          <RelatedTraceOptions />
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="footer">
      <el-button size="small" @click="cancelConfig">
        {{ t("cancel") }}
      </el-button>
      <el-button size="small" type="primary" @click="applyConfig">
        {{ t("apply") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts">
  import { reactive, defineComponent, ref, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import type { Option } from "@/types/app";
  import graphs from "../graphs";
  import CustomOptions from "./widget/index";
  import { MetricModes } from "../data";

  export default defineComponent({
    name: "WidgetEdit",
    components: {
      ...graphs,
      ...CustomOptions,
    },
    setup() {
      const configHeight = document.documentElement.clientHeight - 540;
      const { t } = useI18n();
      const dashboardStore = useDashboardStore();
      const appStoreWithOut = useAppStoreWithOut();
      const loading = ref<boolean>(false);
      const errors = ref<string[]>([]);
      const subErrors = ref<string[]>([]);
      const states = reactive<{
        activeNames: string;
        source: unknown;
        index: string;
        visType: Option[];
      }>({
        activeNames: "1",
        source: {},
        index: dashboardStore.selectedGrid.i,
        visType: [],
      });
      const originConfig = dashboardStore.selectedGrid;
      const widget = computed(() => dashboardStore.selectedGrid.widget || {});
      const graph = computed(() => dashboardStore.selectedGrid.graph || {});
      const title = computed(() => encodeURIComponent(widget.value.title || ""));
      const tips = computed(() => encodeURIComponent(widget.value.tips || ""));
      const hasAssociate = computed(() =>
        ["Bar", "Line", "Area", "TopList"].includes(
          dashboardStore.selectedGrid.graph && dashboardStore.selectedGrid.graph.type,
        ),
      );

      function getSource(source: unknown) {
        states.source = source;
      }

      function getErrors(params: { tips: string[]; subTips: string[] }) {
        errors.value = params.tips;
        subErrors.value = params.subTips;
      }

      function setLoading(load: boolean) {
        loading.value = load;
      }

      function applyConfig() {
        dashboardStore.setConfigPanel(false);
        const { metricMode } = dashboardStore.selectedGrid;
        let p = {};
        if (metricMode === MetricModes.Expression) {
          p = {
            metrics: [],
            metricTypes: [],
          };
        } else {
          p = {
            expressions: [],
            typesOfMQE: [],
          };
        }
        dashboardStore.selectWidget({
          ...dashboardStore.selectedGrid,
          ...p,
        });
        dashboardStore.setConfigs(dashboardStore.selectedGrid);
      }

      function cancelConfig() {
        dashboardStore.selectWidget(originConfig);
        dashboardStore.setConfigPanel(false);
      }

      return {
        states,
        loading,
        t,
        appStoreWithOut,
        configHeight,
        dashboardStore,
        applyConfig,
        cancelConfig,
        getSource,
        getErrors,
        setLoading,
        widget,
        graph,
        title,
        tips,
        hasAssociate,
        errors,
        subErrors,
      };
    },
  });
</script>
<style lang="scss" scoped>
  .widget-config {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .graph {
    position: relative;
    min-width: 1280px;
    border: 1px solid $border-color-primary;
    background-color: $theme-background;
  }

  .header {
    height: 25px;
    line-height: 25px;
    text-align: center;
    background-color: var(--sw-config-header);
    font-size: $font-size-smaller;
    position: relative;
  }

  .tips {
    position: absolute;
    right: 5px;
    top: 0;
  }

  .render-chart {
    padding: 5px;
    height: 420px;
    width: 100%;
  }

  .selectors {
    width: 500px;
    margin-right: 10px;
  }

  .el-collapse-item__header {
    font-weight: bold;
  }

  .config {
    min-width: 1280px;
  }

  .no-data {
    font-size: $font-size-normal;
    text-align: center;
    line-height: 400px;
  }

  .footer {
    position: fixed;
    bottom: 0;
    right: 0;
    border-top: 1px solid $border-color-primary;
    padding: 10px;
    text-align: right;
    width: 100%;
    background-color: $theme-background;
  }

  .collapse {
    margin-top: 10px;
    overflow: auto;
  }

  .ds-name {
    margin-bottom: 10px;
  }

  .unit {
    display: inline-block;
    margin-left: 5px;
  }
</style>
