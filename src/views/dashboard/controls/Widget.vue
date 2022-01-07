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
      <div>{{ data.widget.title || "" }}</div>
      <div class="operations">
        <Icon
          class="mr-5"
          size="sm"
          iconName="createmode_editedit"
          @click="setConfig"
        />
        <Icon size="sm" iconName="clearclose" @click="removeWidget" />
      </div>
    </div>
    <div class="body" :style="{ height: '200px', width: '400px' }">
      <component
        :is="data.graph.type"
        :intervalTime="appStoreWithOut.intervalTime"
        :data="state.source"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { toRefs, reactive, defineComponent } from "vue";
import type { PropType } from "vue";
import { LayoutConfig } from "@/types/dashboard";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import graphs from "../graphs";
import { ElMessage } from "element-plus";
import Loading from "@/utils/loading";
import { useI18n } from "vue-i18n";

const props = {
  data: {
    type: Object as PropType<LayoutConfig>,
    default: () => ({ widget: {} }),
  },
};
export default defineComponent({
  name: "Widget",
  components: { ...graphs },
  props,
  setup(props) {
    const { t } = useI18n();
    const { loading } = Loading();
    const state = reactive({
      source: {},
    });
    const { data } = toRefs(props);
    const appStoreWithOut = useAppStoreWithOut();
    const dashboardStore = useDashboardStore();
    queryMetrics();
    async function queryMetrics() {
      const loadingInstance = loading({
        text: t("loading"),
        fullscreen: false,
      });
      const json = await dashboardStore.fetchMetricValue(props.data);

      loadingInstance.close();
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
      dashboardStore.removeWidget(data);
    }
    function setConfig() {
      dashboardStore.setConfigPanel(true);
      dashboardStore.selectWidget(data);
    }
    return {
      state,
      appStoreWithOut,
      removeWidget,
      setConfig,
      data,
    };
  },
});
</script>
<style lang="scss" scoped>
.widget {
  font-size: 12px;
}

.header {
  height: 30px;
  padding: 5px;
  width: 100%;
  border-bottom: 1px solid #eee;
  justify-content: space-between;
}

.operations {
  color: #aaa;
  cursor: pointer;
}

.body {
  padding: 5px;
  height: 200px;
  width: 100%;
}
</style>
