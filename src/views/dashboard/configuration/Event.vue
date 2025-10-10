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
    <div class="config-label flex-h mr-20">{{ t("enableAssociate") }}</div>
    <el-switch v-model="eventAssociate" active-text="Yes" inactive-text="No" @change="updateConfig" />
  </div>
  <div class="config-item flex-h">
    <div class="config-label flex-h mr-20">{{ t("eventDefaultCollapse") }}</div>
    <el-switch v-model="eventDefaultCollapse" active-text="Yes" inactive-text="No" @change="updateConfig" />
  </div>
  <ConfigurationFooter />
</template>
<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
  import { ref } from "vue";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import type { LayoutConfig } from "@/types/dashboard";
  import ConfigurationFooter from "./components/ConfigurationFooter.vue";
  import "./style.scss";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const eventAssociate = ref(dashboardStore.selectedGrid?.eventAssociate || false);
  const eventDefaultCollapse = ref(
    dashboardStore.selectedGrid?.eventDefaultCollapse === undefined
      ? true
      : dashboardStore.selectedGrid?.eventDefaultCollapse,
  );

  function updateConfig() {
    const { selectedGrid } = dashboardStore;

    dashboardStore.selectWidget({
      ...selectedGrid,
      eventAssociate: eventAssociate.value,
      eventDefaultCollapse: eventDefaultCollapse.value,
    } as LayoutConfig);
  }
</script>
