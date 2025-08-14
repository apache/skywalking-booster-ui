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
    <span class="label">{{ t("iframeSrc") }}</span>
    <el-input class="input" v-model="url" size="small" @change="handleUrlChange" :class="{ error: urlError }" />
    <div v-if="urlError" class="error-message">{{ urlError }}</div>
  </div>
  <div class="footer">
    <el-button size="small" @click="cancelConfig">
      {{ t("cancel") }}
    </el-button>
    <el-button size="small" type="primary" @click="applyConfig" :disabled="!!urlError">
      {{ t("apply") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
  import { ref } from "vue";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { validateAndSanitizeUrl } from "@/utils/validateAndSanitizeUrl";
  import type { LayoutConfig } from "@/types/dashboard";

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

  function applyConfig() {
    if (urlError.value) {
      return; // Don't apply if there's a validation error
    }
    dashboardStore.setConfigPanel(false);
    dashboardStore.setConfigs(dashboardStore.selectedGrid as LayoutConfig);
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
