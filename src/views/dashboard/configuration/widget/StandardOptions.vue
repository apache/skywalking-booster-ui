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
    />
  </div>
  <div class="item" v-show="percentile">
    <span class="label">{{ t("labelsIndex") }}</span>
    <el-input
      class="input"
      v-model="selectedGrid.standard.labelsIndex"
      size="small"
      placeholder="auto"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("plus") }}</span>
    <el-input
      class="input"
      v-model="selectedGrid.standard.plus"
      size="small"
      placeholder="none"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("minus") }}</span>
    <el-input
      class="input"
      v-model="selectedGrid.standard.minus"
      size="small"
      placeholder="none"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("multiply") }}</span>
    <el-input
      class="input"
      v-model="selectedGrid.standard.multiply"
      size="small"
      placeholder="none"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("divide") }}</span>
    <el-input
      class="input"
      v-model="selectedGrid.standard.divide"
      size="small"
      placeholder="none"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("convertToMilliseconds") }}</span>
    <el-input
      class="input"
      v-model="selectedGrid.standard.milliseconds"
      size="small"
      placeholder="none"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("convertToSeconds") }}</span>
    <el-input
      class="input"
      v-model="selectedGrid.standard.seconds"
      size="small"
      placeholder="none"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { SortOrder } from "../../data";
import { useDashboardStore } from "@/store/modules/dashboard";

const dashboardStore = useDashboardStore();
const { selectedGrid } = dashboardStore;
const { t } = useI18n();
const percentile = ref<boolean>(
  selectedGrid.metricTypes.includes("readLabeledMetricsValues")
);
const sortOrder = ref<string>(selectedGrid.standard.sortOrder || "DES");

function changeStandardOpt(param: { [key: string]: unknown }) {
  const standard = {
    ...selectedGrid.standard,
    ...param,
  };
  dashboardStore.selectWidget({ ...selectedGrid, standard });
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
