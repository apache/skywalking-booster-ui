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
    <div class="config-label flex-h mr-20">{{ t("iframeSrc") }}</div>
    <el-input class="input" v-model="url" size="small" @change="handleUrlChange" :class="{ error: urlError }" />
    <div v-if="urlError" class="error-message">{{ urlError }}</div>
  </div>
  <ConfigurationFooter />
</template>
<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
  import { ref } from "vue";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { validateAndSanitizeUrl } from "@/utils/validateAndSanitizeUrl";
  import type { LayoutConfig } from "@/types/dashboard";
  import ConfigurationFooter from "./components/ConfigurationFooter.vue";
  import "./style.scss";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const originConfig = dashboardStore.selectedGrid;
  const widget = originConfig?.widget || {};
  const url = ref(widget.url || "");
  const urlError = ref("");

  function handleUrlChange() {
    const validation = validateAndSanitizeUrl(url.value);
    urlError.value = validation.error;

    if (validation.isValid) {
      changeConfig({ url: validation.sanitizedUrl });
    }
  }

  function changeConfig(param: { [key: string]: string }) {
    const key = Object.keys(param)[0];
    if (!key) {
      return;
    }

    const { selectedGrid } = dashboardStore;
    const widget = {
      ...dashboardStore.selectedGrid?.widget,
      [key]: param[key], // Use the sanitized URL directly, no need for decodeURIComponent
    };
    dashboardStore.selectWidget({ ...selectedGrid, widget } as LayoutConfig);
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

  .url-input.error {
    :deep(.el-input__inner) {
      border-color: $error-color;
    }
  }

  .error-message {
    color: $error-color;
    font-size: 12px;
    margin-top: 4px;
  }
</style>
