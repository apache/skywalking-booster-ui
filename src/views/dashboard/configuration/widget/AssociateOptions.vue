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
      :multiple="true"
      :value="widgetId"
      :options="widgets"
      size="small"
      placeholder="Select a widget"
      class="selectors"
      @change="updateWidgetConfig"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useDashboardStore } from "@/store/modules/dashboard";
import getDashboard from "@/hooks/useDashboardsSession";
import { LayoutConfig } from "@/types/dashboard";
import { Option } from "@/types/app";

const { t } = useI18n();
const dashboardStore = useDashboardStore();
const associate = dashboardStore.selectedGrid.associate || {};
const widgetId = ref<string[]>(associate.widgetId || []);
const widgets = computed(() => {
  const isLinear = ["Bar", "Line", "Area"].includes(
    dashboardStore.selectedGrid.graph && dashboardStore.selectedGrid.graph.type
  );
  const isRank = ["TopList"].includes(
    dashboardStore.selectedGrid.graph && dashboardStore.selectedGrid.graph.type
  );
  const { widgets } = getDashboard(dashboardStore.currentDashboard);
  const items = widgets.filter(
    (d: { value: string; label: string } & LayoutConfig) => {
      if (dashboardStore.selectedGrid.id !== d.id) {
        if (isLinear && d.widget && d.id) {
          d.value = d.id;
          d.label = d.widget.name || d.id;
          return d;
        }
        if (isRank && d.type !== "Widget" && d.widget && d.id) {
          d.value = d.id;
          d.label = d.widget.name || d.id;
          return d;
        }
      }
    }
  );
  return items;
});
function updateWidgetConfig(options: Option[]) {
  const opt = options.map((d: Option) => {
    return { widgetId: d.value };
  });
  const widget = {
    ...dashboardStore.selectedGrid,
    associate: opt,
  };
  dashboardStore.selectWidget({ ...widget });
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

.selectors {
  width: 500px;
}
</style>
