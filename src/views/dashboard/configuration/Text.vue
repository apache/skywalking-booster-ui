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
    <span class="label">{{ t("textUrl") }}</span>
    <el-input
      class="input"
      v-model="url"
      size="small"
      @change="changeConfig({ url })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("content") }}</span>
    <el-input
      class="input"
      v-model="content"
      size="small"
      @change="changeConfig({ content })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("backgroundColors") }}</span>
    <Selector
      :value="backgroundColor"
      :options="Colors"
      size="small"
      placeholder="Select a color"
      class="input"
      @change="changeConfig({ backgroundColor: $event[0].value })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("fontSize") }}</span>
    <el-slider
      class="slider"
      v-model="fontSize"
      show-input
      input-size="small"
      :min="12"
      :max="30"
      :step="1"
      @change="changeConfig({ fontSize })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("fontColors") }}</span>
    <Selector
      :value="fontColor"
      :options="Colors"
      size="small"
      placeholder="Select a color"
      class="input"
      @change="changeConfig({ fontColor: $event[0].value })"
    />
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import { useDashboardStore } from "@/store/modules/dashboard";
const { t } = useI18n();
const dashboardStore = useDashboardStore();
const { selectedGrid } = dashboardStore;
const url = ref(selectedGrid.graph.url || "");
const backgroundColor = ref(selectedGrid.graph.backgroundColor || "green");
const fontColor = ref(selectedGrid.graph.fontColor || "white");
const content = ref<string>(selectedGrid.graph.content || "");
const fontSize = ref<number>(selectedGrid.graph.fontSize || 12);
const Colors = [
  {
    label: "Green",
    value: "green",
  },
  { label: "Blue", value: "blue" },
  { label: "Red", value: "red" },
  { label: "Grey", value: "grey" },
  { label: "White", value: "white" },
  { label: "Black", value: "black" },
  { label: "Orange", value: "orange" },
];
function changeConfig(param: { [key: string]: unknown }) {
  const { selectedGrid } = dashboardStore;
  const graph = {
    ...selectedGrid.graph,
    ...param,
  };
  dashboardStore.selectWidget({ ...selectedGrid, graph });
}
</script>
<style lang="scss" scoped>
.slider {
  width: 500px;
  margin-top: -3px;
}

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
</style>
