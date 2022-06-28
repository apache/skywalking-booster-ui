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
    <span class="label">{{ t("widget") }}</span>
    <Selector
      :value="widgetId"
      :options="widgets"
      size="small"
      placeholder="Select a metric"
      @change="updateWidgetConfig({ associateWidget: $event[0].value })"
      class="selectors"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useDashboardStore } from "@/store/modules/dashboard";

const { t } = useI18n();
const dashboardStore = useDashboardStore();
const associate = dashboardStore.selectedGrid.associate || {};
const widgetId = ref<string>(associate.widgetId || "");
const widgets = computed(() => {
  const all = [];
  for (const item of dashboardStore.layout) {
    if (item.type === "Tab") {
      if (item.children && item.children.length) {
        for (const child of item.children) {
          if (child.children && child.children.length) {
            const items = child.children.map(
              (d: { i: string; index: string } | any) => {
                d.value = d.id;
                d.label = (d.widget && d.widget.title) || d.type || "";
                return d;
              }
            );
            all.push(...items);
          }
        }
      }
    } else {
      item.value = item.id;
      item.label = (item.widget && item.widget.title) || item.type || "";
      all.push(item);
    }
  }
  return all;
});
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
