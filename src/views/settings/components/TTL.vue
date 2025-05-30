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
    <div class="flex-h item">
      <div class="label">{{ t("metricsTTL") }}</div>
      <div>
        <span>Day: </span>
        <span class="mr-10">{{ settingsStore.configTTL.metrics?.day ?? -1 }}</span>
        <span>Hour: </span>
        <span class="mr-10">{{ settingsStore.configTTL.metrics?.hour ?? -1 }}</span>
        <span>Minute: </span>
        <span class="mr-10">{{ settingsStore.configTTL.metrics?.minute ?? -1 }}</span>
      </div>
      <div>
        <span>Cold Day: </span>
        <span class="mr-10">{{ settingsStore.configTTL.metrics?.coldDay ?? -1 }}</span>
        <span>Cold Hour: </span>
        <span class="mr-10">{{ settingsStore.configTTL.metrics?.coldHour ?? -1 }}</span>
        <span>Cold Minute: </span>
        <span>{{ settingsStore.configTTL.metrics?.coldMinute ?? -1 }}</span>
      </div>
    </div>
    <div class="flex-h item">
      <div class="label">{{ t("recordsTTL") }}</div>
      <div>
        <span>Normal: </span>
        <span class="mr-10">{{ settingsStore.configTTL.records?.normal ?? -1 }}</span>
        <span>Hour: </span>
        <span class="mr-10">{{ settingsStore.configTTL.records?.trace ?? -1 }}</span>
        <span>Minute: </span>
        <span class="mr-10">{{ settingsStore.configTTL.records?.zipkinTrace ?? -1 }}</span>
        <span>Log: </span>
        <span class="mr-10">{{ settingsStore.configTTL.records?.log ?? -1 }}</span>
        <span>Browser Error Log: </span>
        <span class="mr-10">{{ settingsStore.configTTL.records?.browserErrorLog ?? -1 }}</span>
      </div>
      <div>
        <span>Cold Normal: </span>
        <span class="mr-10">{{ settingsStore.configTTL.metrics?.coldNormal ?? -1 }}</span>
        <span>Cold Trace: </span>
        <span class="mr-10">{{ settingsStore.configTTL.metrics?.coldTrace ?? -1 }}</span>
        <span>Cold Zipkin Trace: </span>
        <span class="mr-10">{{ settingsStore.configTTL.metrics?.coldZipkinTrace ?? -1 }}</span>
        <span>Cold Log: </span>
        <span class="mr-10">{{ settingsStore.configTTL.metrics?.coldLog ?? -1 }}</span>
        <span>Cold Browser Error Log: </span>
        <span>{{ settingsStore.configTTL.metrics?.coldBrowserErrorLog ?? -1 }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted } from "vue";
  import { useI18n } from "vue-i18n";
  import { useSettingsStore } from "@/store/modules/settings";

  const { t, locale } = useI18n();
  const settingsStore = useSettingsStore();

  onMounted(() => {
    settingsStore.getConfigTTL();
  });
</script>
<style lang="scss" scoped>
  .ttl {
    color: var(--sw-setting-color);
    font-size: 13px;

    .item {
      margin-top: 15px;
    }

    .label {
      width: 200px;
      display: inline-block;
      font-weight: 500;
      color: $font-color;
    }
  }
</style>
