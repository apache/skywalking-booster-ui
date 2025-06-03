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
  <div class="ttl">
    <div class="label">{{ t("metricsTTL") }}</div>
    <TTLTable :data="settingsStore.configTTL.metrics" :metricsRows="MetricsTTLRow" />
    <div class="label">{{ t("recordsTTL") }}</div>
    <TTLTable :data="settingsStore.configTTL.records" :metricsRows="RecordsTTLRow" />
  </div>
</template>
<script lang="ts" setup>
  import { onMounted } from "vue";
  import { useI18n } from "vue-i18n";
  import { useSettingsStore } from "@/store/modules/settings";
  import TTLTable from "./TTLTable.vue";
  import { MetricsTTLRow, RecordsTTLRow } from "../data";

  const { t } = useI18n();
  const settingsStore = useSettingsStore();

  onMounted(() => {
    settingsStore.getConfigTTL();
  });
</script>
<style lang="scss" scoped>
  .ttl {
    color: var(--sw-setting-color);
    font-size: 13px;

    .label {
      margin: 15px 0;
      display: inline-block;
      font-weight: 600;
      color: $font-color;
    }
  }
</style>
