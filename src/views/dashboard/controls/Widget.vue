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
          {{ data.widget?.title || "" }}
        </span>
      </div>
      <div>
        <el-tooltip :content="data.widget?.tips">
          <span>
            <Icon
              iconName="info_outline"
              size="sm"
              class="operation"
              v-show="data.widget?.tips"
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
    <div class="body" v-if="data.graph?.type" v-loading="loading">
      <component
        :is="data.graph.type"
        :intervalTime="appStore.intervalTime"
        :data="state.source"
        :config="{
          ...data.graph,
          metrics: data.metrics,
          metricTypes: data.metricTypes,
          i: data.i,
          metricConfig: data.metricConfig,
        }"
        :needQuery="needQuery"
      />
    </div>
    <div v-else class="no-data">{{ t("noData") }}</div>
  </div>
</template>
<script lang="ts">
import { toRefs, reactive, defineComponent, ref, watch } from "vue";
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

const props = {
  data: {
    type: Object as PropType<LayoutConfig>,
    default: () => ({ widget: {} }),
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
    const isList = ListChartTypes.includes(props.data.graph.type || "");

    if ((props.needQuery || !dashboardStore.currentDashboard.id) && !isList) {
      queryMetrics();
    }

    async function queryMetrics() {
      const { metricTypes, metrics } = props.data;
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
        metrics: props.data.metrics,
        metricTypes: props.data.metricTypes,
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
    watch(
      () => [props.data.metricTypes, props.data.metrics, props.data.standard],
      () => {
        if (!dashboardStore.selectedGrid) {
          return;
        }
        if (props.data.i !== dashboardStore.selectedGrid.i) {
          return;
        }
        const isList = ListChartTypes.includes(props.data.graph.type || "");
        if (
          ListChartTypes.includes(dashboardStore.selectedGrid.graph.type) ||
          isList
        ) {
          return;
        }
        queryMetrics();
      }
    );
    watch(
      () => [selectorStore.currentService, selectorStore.currentDestService],
      () => {
        const isList = ListChartTypes.includes(props.data.graph.type || "");
        if (isList) {
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
        if (dashboardStore.entity === EntityType[0].value) {
          return;
        }
        queryMetrics();
      }
    );
    watch(
      () => appStore.durationTime,
      () => {
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
