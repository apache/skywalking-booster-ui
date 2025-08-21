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
  <div class="config-item flex-h">
    <div class="config-label flex-h mr-20">{{ t("text") }}</div>
    <el-input class="input" v-model="text" size="small" @change="changeConfig({ text })" />
  </div>
  <div class="config-item flex-h">
    <div class="config-label flex-h mr-20">{{ t("textAlign") }}</div>
    <Selector
      :value="textAlign"
      :options="AlignStyle"
      size="small"
      placeholder="Select a color"
      class="input"
      @change="changeConfig({ textAlign: $event[0].value })"
    />
  </div>
  <div class="config-item flex-h">
    <div class="config-label flex-h mr-20">{{ t("backgroundColors") }}</div>
    <Selector
      :value="backgroundColor"
      :options="Colors"
      size="small"
      placeholder="Select a color"
      class="input"
      @change="changeConfig({ backgroundColor: $event[0].value })"
    />
  </div>
  <div class="config-item flex-h">
    <div class="config-label flex-h mr-20">{{ t("fontSize") }}</div>
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
  <div class="config-item flex-h">
    <div class="config-label flex-h mr-20">{{ t("fontColors") }}</div>
    <Selector
      :value="fontColor"
      :options="Colors"
      size="small"
      placeholder="Select a color"
      class="input"
      @change="changeConfig({ fontColor: $event[0].value })"
    />
  </div>
  <ConfigurationFooter />
</template>
<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
  import { ref } from "vue";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import type { TimeRangeConfig, LayoutConfig } from "@/types/dashboard";
  import ConfigurationFooter from "./components/ConfigurationFooter.vue";
  import "./style.scss";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const originConfig = dashboardStore.selectedGrid;
  const graph = (originConfig?.graph as TimeRangeConfig) || {};
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
      ...selectedGrid?.graph,
      ...param,
    };
    dashboardStore.selectWidget({ ...selectedGrid, graph } as LayoutConfig);
  }
</script>
<style lang="scss" scoped>
  .slider {
    width: 500px;
    margin-top: -3px;
  }

  .input {
    width: 500px;
  }
</style>
