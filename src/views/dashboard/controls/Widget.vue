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
            <Icon
              iconName="info_outline"
              size="sm"
              class="operation"
              v-show="widget.tips"
            />
          </span>
        </el-tooltip>
        <el-popover
          placement="bottom"
          trigger="click"
          :width="100"
          v-if="dashboardStore.editMode"
        >
          <template #reference>
            <span>
              <Icon iconName="ellipsis_v" size="middle" class="operation" />
            </span>
          </template>
          <div class="tools" @click="editConfig">
            <span>{{ t("edit") }}</span>
          </div>
          <div class="tools" @click="removeWidget">
            <span>{{ t("delete") }}</span>
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
          metrics: data.metrics || [''],
          metricTypes: data.metricTypes || [''],
          i: data.i,
          id: data.id,
          metricConfig: data.metricConfig,
          filters: data.filters || {},
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
import { LayoutConfig } from "@/types/dashboard";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import graphs from "../graphs";
import { useI18n } from "vue-i18n";
import {
  useQueryProcessor,
  useSourceProcessor,
  useGetMetricEntity,
} from "@/hooks/useProcessor";
import { EntityType, ListChartTypes } from "../data";
import { EventParams } from "@/types/dashboard";
import getDashboard from "@/hooks/useDashboardsSession";

const props = {
  data: {
    type: Object as PropType<LayoutConfig>,
    default: () => ({ widget: {}, graph: {} }),
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
    const selectorStore = useSelectorStore();
    const graph = computed(() => props.data.graph || {});
    const widget = computed(() => props.data.widget || {});
    const isList = computed(() =>
      ListChartTypes.includes((props.data.graph && props.data.graph.type) || "")
    );

    if (
      (props.needQuery || !dashboardStore.currentDashboard.id) &&
      !isList.value
    ) {
      queryMetrics();
    }

    async function queryMetrics() {
      const metricTypes = props.data.metricTypes || [];
      const metrics = props.data.metrics || [];
      const catalog = await useGetMetricEntity(metrics[0], metricTypes[0]);
      const params = await useQueryProcessor({ ...props.data, catalog });

      if (!params) {
        state.source = {};
        return;
      }
      loading.value = true;
      const json = await dashboardStore.fetchMetricValue(params);
      loading.value = false;
      if (!json) {
        return;
      }
      const d = {
        metrics: props.data.metrics || [],
        metricTypes: props.data.metricTypes || [],
        metricConfig: props.data.metricConfig || [],
      };
      state.source = useSourceProcessor(json, d);
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
        const widget = widgets.find(
          (d: LayoutConfig) => d.id === item.widgetId
        );
        if (widget) {
          widget.filters = {
            dataIndex: params.dataIndex,
            sourceId: props.data.id || "",
          };

          dashboardStore.setWidget(widget);
        }
      }
    }
    watch(
      () => [props.data.metricTypes, props.data.metrics],
      () => {
        if (!dashboardStore.selectedGrid) {
          return;
        }
        if (props.data.i !== dashboardStore.selectedGrid.i) {
          return;
        }
        const chart = dashboardStore.selectedGrid.graph || {};
        if (ListChartTypes.includes(chart.type) || isList.value) {
          return;
        }
        queryMetrics();
      }
    );
    watch(
      () => [selectorStore.currentService, selectorStore.currentDestService],
      () => {
        if (isList.value) {
          return;
        }
        if (
          dashboardStore.entity === EntityType[0].value ||
          dashboardStore.entity === EntityType[4].value
        ) {
          queryMetrics();
        }
      }
    );
    watch(
      () => [selectorStore.currentPod, selectorStore.currentDestPod],
      () => {
        if (
          dashboardStore.entity === EntityType[0].value ||
          dashboardStore.entity === EntityType[7].value
        ) {
          return;
        }
        if (isList.value) {
          return;
        }
        queryMetrics();
      }
    );
    watch(
      () => [selectorStore.currentProcess, selectorStore.currentDestProcess],
      () => {
        if (dashboardStore.entity === EntityType[7].value) {
          queryMetrics();
        }
      }
    );
    watch(
      () => appStore.durationTime,
      () => {
        if (isList.value) {
          return;
        }
        if (dashboardStore.entity === EntityType[1].value) {
          queryMetrics();
        }
      }
    );

    return {
      state,
      appStore,
      removeWidget,
      editConfig,
      data,
      loading,
      dashboardStore,
      t,
      graph,
      widget,
      clickHandle,
    };
  },
});
</script>
<style lang="scss" scoped>
.widget {
  font-size: 12px;
  height: 100%;
}

.header {
  height: 30px;
  padding: 5px;
  width: 100%;
  border-bottom: 1px solid #eee;
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
    color: #409eff;
    background-color: #eee;
  }
}

.body {
  padding: 5px 10px;
  width: 100%;
  height: calc(100% - 30px);
}

.no-data {
  font-size: 14px;
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
