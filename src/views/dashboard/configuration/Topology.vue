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
    <span class="label">{{ t("showDepth") }}</span>
    <el-switch v-model="showDepth" active-text="Yes" inactive-text="No" @change="changeConfig({ showDepth })" />
  </div>
  <div class="item" v-show="showDepth">
    <span class="label">{{ t("defaultDepth") }}</span>
    <Selector class="input" size="small" :value="depth" :options="DepthList" @change="changeDepth($event)" />
  </div>
  <div class="footer">
    <el-button size="small">
      {{ t("cancel") }}
    </el-button>
    <el-button size="small" type="primary" @click="applyConfig">
      {{ t("apply") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { DepthList } from "../data";
  import type { Option } from "@/types/app";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const graph = dashboardStore.selectedGrid.graph || {};
  const showDepth = ref<boolean>(graph.showDepth);
  const depth = ref<number>(graph.depth || 2);

  function applyConfig() {
    dashboardStore.setConfigs(dashboardStore.selectedGrid);
    dashboardStore.setConfigPanel(false);
  }
  function changeConfig(param: { [key: string]: unknown }) {
    const { selectedGrid } = dashboardStore;
    const graph = {
      ...selectedGrid.graph,
      ...param,
    };
    dashboardStore.selectWidget({ ...selectedGrid, graph });
  }
  function changeDepth(opt: Option[] | any) {
    const val = opt[0].value;
    changeConfig({ depth: val });
  }
</script>
<style lang="scss" scoped>
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

  .label {
    font-size: 13px;
    font-weight: 500;
    display: block;
    margin-bottom: 5px;
  }

  .item {
    margin: 10px 0;
  }
</style>
