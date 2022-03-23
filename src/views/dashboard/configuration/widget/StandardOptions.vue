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
  <div class="item">
    <span class="label">{{ t("unit") }}</span>
    <el-input
      class="input"
      v-model="selectedGrid.standard.unit"
      size="small"
      placeholder="Please input Unit"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("sortOrder") }}</span>
    <Selector
      :value="sortOrder"
      :options="SortOrder"
      size="small"
      placeholder="Select a sort order"
      class="selector"
      @change="changeStandardOpt({ sortOrder })"
    />
  </div>
  <div class="item" v-show="percentile">
    <span class="label">{{ t("labels") }}</span>
    <el-input
      class="input"
      v-model="selectedGrid.standard.metricLabels"
      size="small"
      placeholder="auto"
      @change="changeStandardOpt"
    />
  </div>
  <div class="item" v-show="percentile">
    <span class="label">{{ t("labelsIndex") }}</span>
    <el-input
      class="input"
      v-model="selectedGrid.standard.labelsIndex"
      size="small"
      placeholder="auto"
      @change="changeStandardOpt"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("plus") }}</span>
    <el-input-number
      class="input"
      v-model="selectedGrid.standard.plus"
      :min="0"
      size="small"
      placeholder="Please input"
      @change="changeStandardOpt"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("minus") }}</span>
    <el-input-number
      class="input"
      v-model="selectedGrid.standard.minus"
      :min="0"
      size="small"
      placeholder="Please input"
      @change="changeStandardOpt"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("multiply") }}</span>
    <el-input-number
      class="input"
      v-model="selectedGrid.standard.multiply"
      :min="1"
      size="small"
      placeholder="Please input"
      @change="changeStandardOpt"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("divide") }}</span>
    <el-input-number
      class="input"
      v-model="selectedGrid.standard.divide"
      size="small"
      placeholder="Please input"
      :min="1"
      @change="changeStandardOpt"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("convertToMilliseconds") }}</span>
    <el-input-number
      class="input"
      :min="0"
      v-model="selectedGrid.standard.milliseconds"
      size="small"
      placeholder="Please input"
      @change="changeStandardOpt"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("convertToSeconds") }}</span>
    <el-input-number
      class="input"
      :min="0"
      v-model="selectedGrid.standard.seconds"
      size="small"
      placeholder="Please input"
      @change="changeStandardOpt"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { SortOrder } from "../../data";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useQueryProcessor, useSourceProcessor } from "@/hooks/useProcessor";
import { ElMessage } from "element-plus";

/*global defineEmits */
const { t } = useI18n();
const emit = defineEmits(["update", "loading"]);
const dashboardStore = useDashboardStore();
const { selectedGrid } = dashboardStore;
const percentile = ref<boolean>(
  selectedGrid.metricTypes.includes("readLabeledMetricsValues")
);
const sortOrder = ref<string>(selectedGrid.standard.sortOrder || "DES");

function changeStandardOpt(param?: any) {
  let standard = dashboardStore.selectedGrid.standard;
  if (param) {
    standard = {
      ...dashboardStore.selectedGrid.standard,
      ...param,
    };
    dashboardStore.selectWidget({ ...dashboardStore.selectedGrid, standard });
  }
  queryMetrics();
}
async function queryMetrics() {
  const params = useQueryProcessor(dashboardStore.selectedGrid);
  if (!params) {
    emit("update", {});
    return;
  }

  emit("loading", true);
  const json = await dashboardStore.fetchMetricValue(params);
  emit("loading", false);
  if (json.errors) {
    ElMessage.error(json.errors);
    return;
  }
  const source = useSourceProcessor(json, dashboardStore.selectedGrid);
  emit("update", source);
}
</script>
<style lang="scss" scoped>
.label {
  font-size: 13px;
  font-weight: 500;
  display: block;
  margin-bottom: 5px;
}

.input {
  width: 500px;
}

.item {
  margin-bottom: 10px;
}

.selector {
  width: 500px;
}
</style>
