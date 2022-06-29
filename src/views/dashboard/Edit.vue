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
  <Tool v-if="dashboardStore.currentDashboard" />
  <div
    class="ds-main"
    v-if="dashboardStore.currentDashboard"
    @click="handleClick"
    :style="{ height: dashboardStore.editMode ? 'calc(100% - 45px)' : '100%' }"
  >
    <grid-layout />
    <el-dialog
      v-model="dashboardStore.showConfig"
      :title="t('editGraph')"
      fullscreen
      :destroy-on-close="true"
      @closed="dashboardStore.setConfigPanel(false)"
    >
      <component :is="dashboardStore.selectedGrid.type" />
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { ref, defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import GridLayout from "./panel/Layout.vue";
import Tool from "./panel/Tool.vue";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import Configuration from "./configuration";
import { LayoutConfig } from "@/types/dashboard";

export default defineComponent({
  name: "Dashboard",
  components: { ...Configuration, GridLayout, Tool },
  setup() {
    const dashboardStore = useDashboardStore();
    const appStore = useAppStoreWithOut();
    const { t } = useI18n();
    const p = useRoute().params;
    const layoutKey = ref<string>(`${p.layerId}_${p.entity}_${p.name}`);
    setTemplate();
    async function setTemplate() {
      await dashboardStore.setDashboards();

      if (!p.entity) {
        if (!dashboardStore.currentDashboard) {
          return;
        }
        const { layer, entity, name } = dashboardStore.currentDashboard;
        layoutKey.value = `${layer}_${entity}_${name}`;
      }
      const c: { configuration: string; id: string } = JSON.parse(
        sessionStorage.getItem(layoutKey.value) || "{}"
      );
      const layout: any = c.configuration || {};

      dashboardStore.setLayout(setWidgetsID(layout.children || []));
      appStore.setPageTitle(layout.name);
      if (p.entity) {
        dashboardStore.setCurrentDashboard({
          layer: p.layerId,
          entity: p.entity,
          name: p.name,
          id: c.id,
          isRoot: layout.isRoot,
        });
      }
    }
    function setWidgetsID(widgets: LayoutConfig[]) {
      for (const item of widgets) {
        item.id = item.i;
        if (item.type === "Tab") {
          if (item.children && item.children.length) {
            for (const [index, child] of item.children.entries()) {
              if (child.children && child.children.length) {
                child.children.map((d: { i: string; index: string } | any) => {
                  d.id = `${item.i}-${index}-${d.i}`;
                  return d;
                });
              }
            }
          }
        }
      }
      return widgets;
    }
    function handleClick(e: any) {
      e.stopPropagation();
      if (e.target.className === "ds-main") {
        dashboardStore.activeGridItem("");
        dashboardStore.selectWidget(null);
      }
    }

    return {
      t,
      handleClick,
      dashboardStore,
    };
  },
});
</script>
<style lang="scss" scoped>
.ds-main {
  overflow: auto;
}
</style>
