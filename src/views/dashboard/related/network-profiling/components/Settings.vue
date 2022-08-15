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
  <div class="label">{{ t("linkDashboard") }}</div>
  <Selector
    :value="linkDashboard"
    :options="linkDashboards"
    size="small"
    placeholder="Please input a dashboard name for calls"
    @change="changeLinkDashboard"
    class="inputs"
    :clearable="true"
  />
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { DashboardItem } from "@/types/dashboard";
import { useDashboardStore } from "@/store/modules/dashboard";
import { EntityType } from "@/views/dashboard/data";
/*global defineEmits */
const emits = defineEmits(["update"]);
const { t } = useI18n();
const dashboardStore = useDashboardStore();
const linkDashboards = ref<
  (DashboardItem & { label: string; value: string })[]
>([]);
const { selectedGrid } = dashboardStore;
const linkDashboard = ref<string>(selectedGrid.linkDashboard || "");

onMounted(() => {
  getDashboards();
});

function getDashboards() {
  const list = JSON.parse(sessionStorage.getItem("dashboards") || "[]");
  linkDashboards.value = list.reduce(
    (
      prev: (DashboardItem & { label: string; value: string })[],
      d: DashboardItem
    ) => {
      if (
        d.layer === dashboardStore.layerId &&
        d.entity === EntityType[7].value
      ) {
        prev.push({ ...d, label: d.name, value: d.name });
      }
      return prev;
    },
    []
  );
}

function changeLinkDashboard(opt: { value: string }[]) {
  linkDashboard.value = opt[0].value;
  const param = {
    ...dashboardStore.selectedGrid,
    linkDashboard: linkDashboard.value,
  };
  dashboardStore.selectWidget(param);
  dashboardStore.setConfigs(param);
  emits("update", param);
}
</script>
<style lang="scss" scoped>
.label {
  font-size: 12px;
  margin-top: 10px;
}

.inputs {
  margin-top: 8px;
  width: 270px;
}
</style>
