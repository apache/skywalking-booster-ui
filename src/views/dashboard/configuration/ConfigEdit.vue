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
    <div class="graph">
      <div class="header">Title</div>
      <div class="render-chart">
        <component
          :is="states.chartType"
          :intervalTime="appStoreWithOut.intervalTime"
          :data="states.source"
        />
      </div>
      <span v-show="!states.source">{{ t("noData") }}</span>
    </div>
    <div class="collapse" :style="{ height: configHeight + 'px' }">
      <el-collapse
        v-model="states.activeNames"
        :style="{ '--el-collapse-header-font-size': '15px' }"
      >
        <el-collapse-item :title="t('metricName')" name="1">
          <div>
            <Selector
              :value="states.metrics"
              :options="metricOpts"
              :multiple="true"
              size="mini"
              placeholder="Select a metric"
              @change="changeMetrics"
              class="selectors"
            />
            <Selector
              v-show="states.valueType"
              :value="states.valueType"
              :options="states.valueTypes"
              size="mini"
              placeholder="Select a metric"
              @change="changeValueType"
              class="selectors"
            />
          </div>
        </el-collapse-item>
        <el-collapse-item :title="t('selectVisualization')" name="2">
          <div class="chart-types">
            <span
              v-for="(type, index) in ChartTypes"
              :key="index"
              @click="changeChartType(type)"
              :class="{ active: type.value === states.chartType }"
            >
              {{ type.label }}
            </span>
          </div>
        </el-collapse-item>
        <el-collapse-item :title="t('graphStyles')" name="3">
          <component :is="`${states.chartType}Config`" />
        </el-collapse-item>
        <el-collapse-item :title="t('widgetOptions')" name="4">
          <WidgetOptions />
        </el-collapse-item>
        <el-collapse-item :title="t('standardOptions')" name="5">
          <StandardOptions />
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="footer">
      <el-button size="mini">
        {{ t("cancel") }}
      </el-button>
      <el-button size="mini" type="primary">
        {{ t("apply") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { reactive, defineComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import { ElMessage, ElButton, ElCollapse, ElCollapseItem } from "element-plus";
import { ValuesTypes, MetricQueryTypes, ChartTypes } from "../data";
import { Option } from "@/types/app";
import Loading from "@/utils/loading";
import graphs from "../graphs";
import controls from "../controls";
import configs from "./graph-styles";
import WidgetOptions from "./WidgetOptions.vue";
import StandardOptions from "./StandardOptions.vue";

export default defineComponent({
  name: "ConfigEdit",
  components: {
    ...graphs,
    ...controls,
    ...configs,
    WidgetOptions,
    StandardOptions,
    ElButton,
    ElCollapse,
    ElCollapseItem,
  },
  setup() {
    const { t } = useI18n();
    const dashboardStore = useDashboardStore();
    const appStoreWithOut = useAppStoreWithOut();
    const { loading } = Loading();
    const states = reactive<{
      metrics?: string[] | string;
      valueTypes: Option[];
      valueType: string;
      metricQueryType: string;
      chartType: string;
      activeNames: string;
      source: any;
    }>({
      metrics: "",
      valueTypes: [],
      valueType: "",
      metricQueryType: "",
      chartType: "Line",
      activeNames: "1",
      source: {},
    });
    async function changeMetrics(val: Option[]) {
      if (!val.length) {
        states.valueTypes = [];
        states.valueType = "";
        return;
      }
      const loadingInstance = loading({ text: t("loading"), fullscreen: true });
      const resp = await dashboardStore.fetchMetricType(val[0].value);
      loadingInstance.close();
      if (resp.error) {
        ElMessage.error(resp.data.error);
        return;
      }
      const { typeOfMetrics } = resp.data;
      states.valueTypes = ValuesTypes[typeOfMetrics];
      states.valueType = ValuesTypes[typeOfMetrics][0].value;
    }
    function changeValueType(val: Option[]) {
      states.valueType = String(val[0].value);
      states.metricQueryType = (MetricQueryTypes as any)[states.valueType];
    }
    function changeChartType(item: Option) {
      states.chartType = String(item.value);
    }
    const metricOpts = [
      { value: "service_apdex", label: "service_apdex" },
      { value: "service_sla", label: "service_sla" },
      { value: "service_cpm", label: "service_cpm" },
      { value: "service_resp_time", label: "service_resp_time" },
      { value: "service_percentile", label: "service_percentile" },
      {
        value: "service_mq_consume_latency",
        label: "service_mq_consume_latency",
      },
      { value: "service_mq_consume_count", label: "service_mq_consume_count" },
    ];
    const configHeight = document.documentElement.clientHeight - 520;
    async function queryMetrics() {
      const json = await dashboardStore.fetchMetricValue(
        dashboardStore.selectedWidget
      );

      if (json.error) {
        return;
      }
      const metricVal = json.data.readMetricsValues.values.values.map(
        (d: any) => d.value
      );
      const m =
        dashboardStore.selectedWidget.metrics &&
        dashboardStore.selectedWidget.metrics[0];
      if (!m) {
        return;
      }
      states.source = {
        [m]: metricVal,
      };
    }
    queryMetrics();
    return {
      states,
      changeChartType,
      changeValueType,
      changeMetrics,
      t,
      appStoreWithOut,
      ChartTypes,
      metricOpts,
      configHeight,
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
  border: 1px solid #eee;
  background-color: #fff;
}

.header {
  padding: 3px 0;
  text-align: center;
  // border-bottom: 1px solid #eee;
  background-color: aliceblue;
}

.render-chart {
  padding: 5px;
  height: 350px;
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

.chart-types {
  span {
    display: inline-block;
    padding: 5px 10px;
    border: 1px solid #ccc;
    background-color: #fff;
    border-right: 0;
    cursor: pointer;
  }

  span:nth-last-child(1) {
    border-right: 1px solid #ccc;
  }
}

span.active {
  background-color: #409eff;
  color: #fff;
}

.footer {
  position: fixed;
  bottom: 0;
  right: 0;
  border-top: 1px solid #eee;
  padding: 10px;
  text-align: right;
  width: 100%;
  background-color: #fff;
}

.collapse {
  margin-top: 10px;
  overflow: auto;
}
</style>
