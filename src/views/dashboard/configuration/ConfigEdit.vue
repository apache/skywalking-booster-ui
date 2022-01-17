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
      <div class="header">
        <span>{{ states.widget.title }}</span>
        <div class="tips" v-show="states.widget.tips">
          <el-tooltip :content="states.widget.tips">
            <Icon iconName="info_outline" size="sm" />
          </el-tooltip>
        </div>
      </div>
      <div class="render-chart">
        <component
          :is="states.graph.type"
          :intervalTime="appStoreWithOut.intervalTime"
          :data="states.source"
          :config="states.graph"
        />
        <div v-show="!states.graph.type" class="no-data">{{ t("noData") }}</div>
      </div>
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
              v-if="states.valueType"
              :value="states.valueType"
              :options="states.valueTypes"
              size="mini"
              placeholder="Select a metric"
              @change="changeValueType"
              class="selectors"
              v-loading="loading"
            />
          </div>
        </el-collapse-item>
        <el-collapse-item :title="t('selectVisualization')" name="2">
          <div class="chart-types">
            <span
              v-for="(type, index) in states.visType"
              :key="index"
              @click="changeChartType(type)"
              :class="{ active: type.value === states.graph.type }"
            >
              {{ type.label }}
            </span>
          </div>
        </el-collapse-item>
        <el-collapse-item :title="t('graphStyles')" name="3">
          <component
            :is="`${states.graph.type}Config`"
            :config="states.graph"
            @update="updateGraphOptions"
          />
        </el-collapse-item>
        <el-collapse-item :title="t('widgetOptions')" name="4">
          <WidgetOptions
            :config="states.widget"
            @update="updateWidgetOptions"
          />
        </el-collapse-item>
        <el-collapse-item :title="t('standardOptions')" name="5">
          <StandardOptions
            :config="states.standard"
            @update="updateStandardOptions"
          />
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="footer">
      <el-button size="mini">
        {{ t("cancel") }}
      </el-button>
      <el-button size="mini" type="primary" @click="applyConfig">
        {{ t("apply") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { reactive, defineComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import { ElMessage } from "element-plus";
import {
  ValuesTypes,
  MetricQueryTypes,
  ChartTypes,
  DefaultGraphConfig,
  PodsChartTypes,
} from "../data";
import { Option } from "@/types/app";
import { WidgetConfig, GraphConfig, StandardConfig } from "@/types/dashboard";
import graphs from "../graphs";
import configs from "./graph-styles";
import WidgetOptions from "./WidgetOptions.vue";
import StandardOptions from "./StandardOptions.vue";

export default defineComponent({
  name: "ConfigEdit",
  components: {
    ...graphs,
    ...configs,
    WidgetOptions,
    StandardOptions,
  },
  setup() {
    const loading = ref<boolean>(false);
    const { t } = useI18n();
    const dashboardStore = useDashboardStore();
    const appStoreWithOut = useAppStoreWithOut();
    const { selectedGrid } = dashboardStore;
    const params = useRoute().params;
    const states = reactive<{
      metrics: string[];
      valueTypes: Option[];
      valueType: string;
      metricQueryType: string;
      activeNames: string;
      source: any;
      index: string;
      graph: GraphConfig;
      widget: WidgetConfig | any;
      standard: StandardConfig;
      visType: Option[];
    }>({
      metrics: selectedGrid.metrics || [],
      valueTypes: [],
      valueType: "",
      metricQueryType: "",
      activeNames: "1",
      source: {},
      index: selectedGrid.i,
      graph: selectedGrid.graph,
      widget: selectedGrid.widget,
      standard: selectedGrid.standard,
      visType: [],
    });
    if (states.metrics[0]) {
      queryMetricType(states.metrics[0]);
    }

    if (PodsChartTypes.includes(String(params.entity))) {
      states.visType = ChartTypes.filter(
        (d: Option) => !PodsChartTypes.includes(d.value)
      );
    } else {
      states.visType = ChartTypes;
    }

    async function changeMetrics(arr: Option[]) {
      if (!arr.length) {
        states.valueTypes = [];
        states.valueType = "";
        return;
      }
      states.metrics = arr.map((d: Option) => String(d.value));
      if (arr[0].value) {
        queryMetricType(String(arr[0].value));
      }
    }

    async function queryMetricType(metric: string) {
      loading.value = true;
      const resp = await dashboardStore.fetchMetricType(metric);
      loading.value = false;
      if (resp.error) {
        ElMessage.error(resp.data.error);
        return;
      }
      const { typeOfMetrics } = resp.data;
      states.valueTypes = ValuesTypes[typeOfMetrics];
      states.valueType = ValuesTypes[typeOfMetrics][0].value;
      queryMetrics();
    }

    function changeValueType(val: Option[]) {
      states.valueType = String(val[0].value);
      states.metricQueryType = (MetricQueryTypes as any)[states.valueType];
      queryMetrics();
    }

    function changeChartType(item: Option) {
      states.graph = {
        ...DefaultGraphConfig[item.value],
      };
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

    function updateWidgetOptions(param: { [key: string]: unknown }) {
      states.widget = {
        ...states.widget,
        ...param,
      };
    }

    function updateGraphOptions(param: { [key: string]: unknown }) {
      states.graph = {
        ...states.graph,
        ...param,
      };
    }

    function updateStandardOptions(param: { [key: string]: unknown }) {
      states.standard = {
        ...states.standard,
        ...param,
      };
    }

    async function queryMetrics() {
      const json = await dashboardStore.fetchMetricValue(
        dashboardStore.selectedGrid
      );
      if (!json) {
        return;
      }

      if (json.errors) {
        return;
      }
      const metricVal = json.data.readMetricsValues.values.values.map(
        (d: { value: number }) => d.value + 1
      );
      const m = states.metrics[0];
      if (!m) {
        return;
      }
      states.source = {
        [m]: metricVal,
      };
    }

    queryMetrics();

    function applyConfig() {
      const opts = {
        ...dashboardStore.selectedGrid,
        metrics: states.metrics,
        queryMetricType: states.valueType,
        widget: states.widget,
        graph: states.graph,
        standard: states.standard,
      };
      dashboardStore.setConfigs(opts);
      dashboardStore.setConfigPanel(false);
    }

    return {
      states,
      changeChartType,
      changeValueType,
      changeMetrics,
      t,
      appStoreWithOut,
      ChartTypes,
      metricOpts,
      updateWidgetOptions,
      configHeight,
      updateGraphOptions,
      updateStandardOptions,
      applyConfig,
      loading,
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
  height: 25px;
  line-height: 25px;
  text-align: center;
  background-color: aliceblue;
  font-size: 12px;
  position: relative;
}

.tips {
  position: absolute;
  right: 5px;
  top: 0;
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

.no-data {
  font-size: 14px;
  text-align: center;
  line-height: 350px;
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
