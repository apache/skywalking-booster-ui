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
  <div class="widget">
    <div class="header flex-h">
      <div>
        <span>
          {{ widget.title || "" }}
        </span>
      </div>
      <div>
        <el-tooltip :content="widget.tips || ''">
          <span>
            <Icon iconName="info_outline" size="sm" class="operation" v-show="widget.tips" />
          </span>
        </el-tooltip>
        <el-popover placement="bottom" trigger="click" :width="100">
          <template #reference>
            <span>
              <Icon iconName="ellipsis_v" size="middle" class="operation" />
            </span>
          </template>
          <div class="tools" @click="editConfig" v-if="dashboardStore.editMode">
            <span>{{ t("edit") }}</span>
          </div>
          <div class="tools" @click="removeWidget" v-if="dashboardStore.editMode">
            <span>{{ t("delete") }}</span>
          </div>
          <div class="tools" @click="generateLink">
            <span>{{ t("generateLink") }}</span>
          </div>
        </el-popover>
      </div>
    </div>
    <div class="body" v-if="graph.type" v-loading="loading">
      <component
        :is="graph.type"
        :intervalTime="appStore.intervalTime"
        :data="state.source"
        :config="{
          ...data.graph,
          i: data.i,
          id: data.id,
          metricConfig: data.metricConfig || [],
          filters: data.filters || {},
          relatedTrace: data.relatedTrace || {},
          associate: data.associate || [],
          expressions: data.expressions || [],
          typesOfMQE: typesOfMQE || [],
          subExpressions: data.subExpressions || [],
          subTypesOfMQE: data.subTypesOfMQE || [],
          valueRelatedDashboard: data.valueRelatedDashboard,
        }"
        :needQuery="needQuery"
        @click="clickHandle"
      />
    </div>
    <div v-else class="no-data">{{ t("noGraph") }}</div>
  </div>
</template>
<script lang="ts">
  import { toRefs, reactive, defineComponent, ref, watch, computed } from "vue";
  import type { PropType } from "vue";
  import type { LayoutConfig } from "@/types/dashboard";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import graphs from "../graphs";
  import { useI18n } from "vue-i18n";
  import { useDashboardQueryProcessor } from "@/hooks/useExpressionsProcessor";
  import { ListChartTypes } from "../data";
  import type { EventParams } from "@/types/dashboard";
  import getDashboard from "@/hooks/useDashboardsSession";

  const props = {
    data: {
      type: Object as PropType<LayoutConfig>,
      default: () => ({ widget: {}, graph: {} }),
    },
    metricsValues: {
      type: Object as PropType<{ [key: string]: { source: { [key: string]: unknown }; typesOfMQE: string[] } }>,
      default: () => ({}),
    },
    activeIndex: { type: String, default: "" },
    needQuery: { type: Boolean, default: false },
  };

  export default defineComponent({
    name: "Widget",
    components: { ...graphs },
    props,
    setup(props) {
      const { t } = useI18n();
      const loading = ref<boolean>(false);
      const state = reactive<{ source: { [key: string]: unknown } }>({
        source: {},
      });
      const { data } = toRefs(props);
      const appStore = useAppStoreWithOut();
      const dashboardStore = useDashboardStore();
      const graph = computed(() => props.data.graph || {});
      const widget = computed(() => props.data.widget || {});
      const typesOfMQE = ref<string[]>([]);

      async function queryMetrics() {
        loading.value = true;
        const config = {
          metrics: props.data.expressions || [],
          metricConfig: props.data.metricConfig || [],
          id: props.data.i,
        };
        const metrics: { [key: string]: { source: { [key: string]: unknown }; typesOfMQE: string[] } } =
          (await useDashboardQueryProcessor([config])) || {};
        const params = metrics[data.value.i];
        loading.value = false;
        state.source = params.source || {};
        typesOfMQE.value = params.typesOfMQE;
      }

      function removeWidget() {
        dashboardStore.removeControls(props.data);
      }
      function editConfig() {
        dashboardStore.setConfigPanel(true);
        dashboardStore.selectWidget(props.data);
        if (props.activeIndex) {
          dashboardStore.activeGridItem(props.activeIndex);
        } else {
          dashboardStore.activeGridItem(props.data.i);
        }
      }
      function clickHandle(params: EventParams | any) {
        const { widgets } = getDashboard(dashboardStore.currentDashboard);
        const associate = (props.data.associate && props.data.associate) || [];

        for (const item of associate) {
          const widget = widgets.find((d: LayoutConfig) => d.id === item.widgetId);
          if (widget) {
            widget.filters = {
              dataIndex: params.dataIndex,
              sourceId: props.data.id || "",
            };

            dashboardStore.setWidget(widget);
          }
        }
      }
      function generateLink() {
        dashboardStore.setWidgetLink(true);
        dashboardStore.selectWidget(props.data);
      }
      watch(
        () => props.data,
        () => {
          if (!dashboardStore.selectedGrid) {
            return;
          }
          if (props.data.i !== dashboardStore.selectedGrid.i) {
            return;
          }
          const chart = dashboardStore.selectedGrid.graph || {};
          if (ListChartTypes.includes(chart.type)) {
            return;
          }
          queryMetrics();
        },
      );
      watch(
        () => props.metricsValues,
        () => {
          const params = props.metricsValues[data.value.i];
          if (params) {
            state.source = params.source || {};
            typesOfMQE.value = params.typesOfMQE;
          }
        },
      );

      return {
        state,
        appStore,
        removeWidget,
        generateLink,
        editConfig,
        data,
        loading,
        dashboardStore,
        t,
        graph,
        widget,
        typesOfMQE,
        clickHandle,
      };
    },
  });
</script>
<style lang="scss" scoped>
  .widget {
    font-size: $font-size-smaller;
    height: 100%;
  }

  .header {
    height: 30px;
    padding: 5px;
    width: 100%;
    border-bottom: 1px solid $border-color-primary;
    justify-content: space-between;
  }

  .operation {
    cursor: pointer;
  }

  .tools {
    padding: 5px 0;
    color: #999;
    cursor: pointer;
    position: relative;
    text-align: center;

    &:hover {
      color: $active-color;
      background-color: $popper-hover-bg-color;
    }
  }

  .body {
    padding: 5px 10px;
    width: 100%;
    height: calc(100% - 30px);
  }

  .no-data {
    font-size: $font-size-normal;
    color: #888;
    width: 100%;
    text-align: center;
    padding-top: 20px;
  }

  .unit {
    display: inline-block;
    margin-left: 5px;
  }
</style>
