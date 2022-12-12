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
    <span class="label">{{ t("name") }}</span>
    <el-input
      class="input"
      v-model="name"
      size="small"
      placeholder="Please input name"
      @change="updateWidgetName({ name: encodeURIComponent(name) })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("title") }}</span>
    <el-input
      class="input"
      v-model="title"
      size="small"
      placeholder="Please input title"
      @change="updateWidgetConfig({ title: encodeURIComponent(title) })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("tooltipsContent") }}</span>
    <el-input
      class="input"
      v-model="tips"
      size="small"
      placeholder="Please input tips"
      @change="updateWidgetConfig({ tips: encodeURIComponent(tips) })"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { ElMessage } from "element-plus";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import getDashboard from "@/hooks/useDashboardsSession";
  import type { LayoutConfig } from "@/types/dashboard";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const widget = dashboardStore.selectedGrid.widget || {};
  const title = ref<string>(widget.title || "");
  const tips = ref<string>(widget.tips || "");
  const name = ref<string>(widget.name || "");

  function updateWidgetConfig(param: { [key: string]: string }) {
    const key = Object.keys(param)[0];
    if (!key) {
      return;
    }
    const { selectedGrid } = dashboardStore;
    const widget = {
      ...dashboardStore.selectedGrid.widget,
      [key]: decodeURIComponent(param[key]),
    };
    dashboardStore.selectWidget({ ...selectedGrid, widget });
  }
  function updateWidgetName(param: { [key: string]: string }) {
    const key = Object.keys(param)[0];
    const n = decodeURIComponent(param[key]);
    const pattern = /^[A-Za-z0-9-_\u4e00-\u9fa5]{1,300}$/;
    if (!pattern.test(n)) {
      ElMessage.error(t("nameTip"));
      return;
    }
    const { widgets } = getDashboard(dashboardStore.currentDashboard);
    const item = widgets.find((d: LayoutConfig) => d.widget && d.widget.name === n);
    if (item) {
      ElMessage.error(t("duplicateName"));
      return;
    }
    updateWidgetConfig(param);
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

  .item {
    margin-bottom: 10px;
  }
</style>
