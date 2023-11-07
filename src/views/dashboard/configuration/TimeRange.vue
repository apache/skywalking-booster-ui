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
    <span class="label">{{ t("text") }}</span>
    <el-input class="input" v-model="text" size="small" @change="changeConfig({ text })" />
  </div>
  <div class="item">
    <span class="label">{{ t("textAlign") }}</span>
    <Selector
      :value="textAlign"
      :options="AlignStyle"
      size="small"
      placeholder="Select a color"
      class="input"
      @change="changeConfig({ textAlign: $event[0].value })"
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
  <div class="footer">
    <el-button size="small" @click="cancelConfig">
      {{ t("cancel") }}
    </el-button>
    <el-button size="small" type="primary" @click="applyConfig">
      {{ t("apply") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
  import { ref } from "vue";
  import { useDashboardStore } from "@/store/modules/dashboard";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const originConfig = dashboardStore.selectedGrid;
  const graph = originConfig.graph || {};
  const backgroundColor = ref(graph.backgroundColor || "green");
  const fontColor = ref(graph.fontColor || "white");
  const fontSize = ref<number>(graph.fontSize || 12);
  const textAlign = ref(graph.textAlign || "left");
  const text = ref<string>(graph.text || "");
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
  const AlignStyle = [
    {
      label: "Left",
      value: "left",
    },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
  ];
  function changeConfig(param: { [key: string]: unknown }) {
    const { selectedGrid } = dashboardStore;
    const graph = {
      ...selectedGrid.graph,
      ...param,
    };
    dashboardStore.selectWidget({ ...selectedGrid, graph });
  }
  function applyConfig() {
    dashboardStore.setConfigPanel(false);
    dashboardStore.setConfigs(dashboardStore.selectedGrid);
  }

  function cancelConfig() {
    dashboardStore.selectWidget(originConfig);
    dashboardStore.setConfigPanel(false);
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

  .footer {
    position: fixed;
    bottom: 0;
    right: 0;
    border-top: 1px solid $border-color-primary;
    padding: 10px;
    text-align: right;
    width: 100%;
    background-color: $theme-background;
  }
</style>
