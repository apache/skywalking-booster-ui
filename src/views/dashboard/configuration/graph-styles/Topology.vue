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
    <span class="label">{{ t("backgroundColors") }}</span>
    <Selector
      :value="backgroundColor"
      :options="colors"
      size="small"
      placeholder="Select a color"
      class="input"
      @change="changeConfig({ backgroundColor })"
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
      :options="colors"
      size="small"
      placeholder="Select a color"
      class="input"
      @change="changeConfig({ fontColor })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("iconTheme") }}</span>
    <el-switch
      v-model="iconTheme"
      active-text="Light"
      inactive-text="Dark"
      @change="changeConfig({ iconTheme })"
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
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import { useDashboardStore } from "@/store/modules/dashboard";

const { t } = useI18n();
const dashboardStore = useDashboardStore();
const { selectedGrid } = dashboardStore;
const iconTheme = ref(selectedGrid.graph.iconTheme || true);
const backgroundColor = ref(selectedGrid.graph.backgroundColor || "green");
const fontColor = ref(selectedGrid.graph.fontColor || "white");
const content = ref<string>("");
const fontSize = ref<number>(selectedGrid.graph.fontSize);
const colors = [
  {
    label: "Green",
    key: "#67C23A",
    value: "green",
  },
  { label: "Blue", key: "#409EFF", value: "blue" },
  { label: "Red", key: "#F56C6C", value: "red" },
  { label: "Grey", key: "#909399", value: "grey" },
  { label: "White", key: "#fff", value: "white" },
  { label: "Black", key: "#000", value: "black" },
  { label: "Orange", key: "#E6A23C", value: "orange" },
];

function changeConfig(param: { [key: string]: unknown }) {
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
