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
      :value="color"
      :options="Colors"
      size="small"
      placeholder="Select a color"
      class="input"
      @change="updateConfig({ color: $event[0].value })"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const graph = dashboardStore.selectedGrid.graph || {};
  const color = ref(graph.color || "purple");
  const Colors = [
    { label: "Purple", value: "purple" },
    {
      label: "Green",
      value: "green",
    },
    { label: "Blue", value: "blue" },
    { label: "Red", value: "red" },
    { label: "Orange", value: "orange" },
  ];

  function updateConfig(param: { [key: string]: unknown }) {
    const graph = {
      ...dashboardStore.selectedGrid.graph,
      ...param,
    };
    dashboardStore.selectWidget({ ...dashboardStore.selectedGrid, graph });
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
</style>
