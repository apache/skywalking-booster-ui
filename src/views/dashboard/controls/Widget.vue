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
      <div>{{ data.widget?.title || "" }}</div>
      <div>
        <el-tooltip :content="data.widget?.tips">
          <Icon
            iconName="info_outline"
            size="sm"
            class="operation"
            v-show="data.widget?.tips"
          />
        </el-tooltip>
        <el-popover
          placement="bottom"
          trigger="click"
          :style="{ width: '100px' }"
        >
          <template #reference>
            <Icon iconName="ellipsis_v" size="middle" class="operation" />
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
        :intervalTime="appStoreWithOut.intervalTime"
        :data="state.source"
        :config="data.graph"
        :standard="data.standard"
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
import graphs from "../graphs";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

const props = {
  data: {
    type: Object as PropType<LayoutConfig>,
    default: () => ({ widget: {} }),
  },
  activeIndex: { type: String, default: "" },
};
export default defineComponent({
  name: "Widget",
  components: { ...graphs },
  props,
  setup(props) {
    const { t } = useI18n();
    const loading = ref<boolean>(false);
    const state = reactive({
      source: {},
    });
    const { data } = toRefs(props);
    const appStoreWithOut = useAppStoreWithOut();
    const dashboardStore = useDashboardStore();
    queryMetrics();
    async function queryMetrics() {
      loading.value = true;
      const json = await dashboardStore.fetchMetricValue(props.data);
      loading.value = false;
      if (!json) {
        return;
      }
      if (json.error) {
        ElMessage.error(json.error);
        return;
      }
      const metricVal = json.data.readMetricsValues.values.values.map(
        (d: any) => d.value
      );
      const m = props.data.metrics && props.data.metrics[0];
      if (!m) {
        return;
      }
      state.source = {
        [m]: metricVal,
      };
    }

    function removeWidget() {
      dashboardStore.removeControls(props.data);
    }
    function editConfig() {
      console.log(props.data);
      dashboardStore.setConfigPanel(true);
      dashboardStore.selectWidget(props.data);
      if (props.activeIndex) {
        dashboardStore.activeGridItem(props.activeIndex);
      } else {
        dashboardStore.activeGridItem(props.data.i);
      }
    }
    watch(
      () => [props.data.queryMetricType, props.data.metrics],
      (data, old) => {
        if (data[0] === old[0] && data[1] === old[1]) {
          return;
        }
        queryMetrics();
      }
    );
    return {
      state,
      appStoreWithOut,
      removeWidget,
      editConfig,
      data,
      loading,
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
</style>
