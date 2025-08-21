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
    <div class="config-label flex-h mr-20">{{ t("showDepth") }}</div>
    <el-switch v-model="showDepth" active-text="Yes" inactive-text="No" @change="changeConfig({ showDepth })" />
  </div>
  <div class="config-item flex-h" v-show="showDepth">
    <div class="config-label flex-h mr-20">{{ t("defaultDepth") }}</div>
    <Selector class="input" size="small" :value="depth" :options="DepthList" @change="changeDepth($event)" />
  </div>
  <ConfigurationFooter />
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { DepthList } from "../data";
  import type { Option } from "@/types/app";
  import type { TopologyConfig, LayoutConfig } from "@/types/dashboard";
  import ConfigurationFooter from "./components/ConfigurationFooter.vue";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const graph = (dashboardStore.selectedGrid?.graph as TopologyConfig) || {};
  const showDepth = ref<boolean>(graph?.showDepth || false);
  const depth = ref<number>(graph?.depth || 2);

  function changeConfig(param: { [key: string]: unknown }) {
    const { selectedGrid } = dashboardStore;
    const graph = {
      ...selectedGrid?.graph,
      ...param,
    };
    dashboardStore.selectWidget({ ...selectedGrid, graph } as LayoutConfig);
  }
  function changeDepth(opt: Option[] | any) {
    const val = opt[0].value;
    changeConfig({ depth: val });
  }
</script>
<style lang="scss" scoped>
  .input {
    width: 300px;
  }
</style>
