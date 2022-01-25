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
      v-model="state.unit"
      size="mini"
      placeholder="Please input Unit"
      @change="changeStandardOpt({ unit: state.unit })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("sortOrder") }}</span>
    <Selector
      :value="state.sortOrder"
      :options="SortOrder"
      size="mini"
      placeholder="Select a sort order"
      class="selector"
      @change="changeStandardOpt({ sortOrder: state.sortOrder })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("max") }}</span>
    <el-input
      class="input"
      v-model="state.max"
      size="mini"
      placeholder="auto"
      @change="changeStandardOpt({ max: state.max })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("min") }}</span>
    <el-input
      class="input"
      v-model="state.min"
      size="mini"
      placeholder="auto"
      @change="changeStandardOpt({ min: state.min })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("plus") }}</span>
    <el-input
      class="input"
      v-model="state.plus"
      size="mini"
      placeholder="none"
      @change="changeStandardOpt({ plus: state.plus })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("minus") }}</span>
    <el-input
      class="input"
      v-model="state.minus"
      size="mini"
      placeholder="none"
      @change="changeStandardOpt({ minus: state.minus })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("multiply") }}</span>
    <el-input
      class="input"
      v-model="state.multiply"
      size="mini"
      placeholder="none"
      @change="changeStandardOpt({ multiply: state.multiply })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("divide") }}</span>
    <el-input
      class="input"
      v-model="state.divide"
      size="mini"
      placeholder="none"
      @change="changeStandardOpt({ divide: state.divide })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("convertToMilliseconds") }}</span>
    <el-input
      class="input"
      v-model="state.milliseconds"
      size="mini"
      placeholder="none"
      @change="changeStandardOpt({ milliseconds: state.milliseconds })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("convertToSeconds") }}</span>
    <el-input
      class="input"
      v-model="state.seconds"
      size="mini"
      placeholder="none"
      @change="changeStandardOpt({ seconds: state.seconds })"
    />
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import { useI18n } from "vue-i18n";
import { SortOrder } from "../data";
import { useDashboardStore } from "@/store/modules/dashboard";

const dashboardStore = useDashboardStore();
const { selectedGrid } = dashboardStore;
const { t } = useI18n();
const state = reactive({
  unit: selectedGrid.standard.unit,
  max: "",
  min: "",
  plus: "",
  minus: "",
  multiply: "",
  divide: "",
  milliseconds: "",
  seconds: "",
  sortOrder: selectedGrid.standard.sortOrder,
});

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
