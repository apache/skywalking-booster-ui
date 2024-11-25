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
  <grid-layout
    v-if="dashboardStore.layout.length"
    v-model:layout="dashboardStore.layout"
    :col-num="24"
    :row-height="10"
    :is-draggable="dashboardStore.editMode"
    :is-resizable="dashboardStore.editMode"
    v-loading.fullscreen.lock="loading"
    element-loading-text="Loading..."
    element-loading-background="rgba(122, 122, 122, 0.8)"
  >
    <grid-item
      v-for="item in dashboardStore.layout"
      :x="item.x"
      :y="item.y"
      :w="item.w"
      :h="item.h"
      :i="item.i"
      :key="item.id"
      @click="clickGrid(item, $event)"
      :class="{ active: dashboardStore.activedGridItem === item.i }"
      :drag-ignore-from="dragIgnoreFrom"
    >
      <component :is="item.type" :data="item" :metricsValues="metricsValues" />
    </grid-item>
  </grid-layout>
  <div class="no-data-tips" v-else>{{ t("noWidget") }}</div>
</template>
<script lang="ts">
  import { defineComponent, onBeforeUnmount, watch, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useSelectorStore } from "@/store/modules/selectors";
  import type { LayoutConfig } from "@/types/dashboard";
  import controls from "../controls/index";
  import { dragIgnoreFrom, ListChartTypes, WidgetType } from "../data";
  import { useDashboardQueryProcessor } from "@/hooks/useExpressionsProcessor";
  import { EntityType } from "../data";

  export default defineComponent({
    name: "Layout",
    components: { ...controls },
    setup() {
      const { t } = useI18n();
      const appStore = useAppStoreWithOut();
      const dashboardStore = useDashboardStore();
      const selectorStore = useSelectorStore();
      const metricsValues = ref();
      const loading = ref<boolean>(false);

      function clickGrid(item: LayoutConfig, event: Event) {
        dashboardStore.activeGridItem(item.i);
        dashboardStore.selectWidget(item);
        if (
          item.type === WidgetType.Tab &&
          !["operations", "tab-layout"].includes((event.target as HTMLDivElement)?.className) &&
          (event.target as HTMLDivElement)?.classList[2] !== "icon-tool" &&
          (event.target as HTMLDivElement)?.nodeName !== "use"
        ) {
          dashboardStore.setActiveTabIndex(0);
        }
      }
      async function queryMetrics() {
        const widgets: LayoutConfig[] = [];
        for (const item of dashboardStore.layout) {
          if (item.type === WidgetType.Widget) {
            if (!ListChartTypes.includes(item.graph?.type || "")) {
              widgets.push(item);
            }
          }
          if (item.type === WidgetType.Tab) {
            const index = isNaN(item.activedTabIndex) ? 0 : item.activedTabIndex;
            widgets.push(
              ...item.children[index].children.filter(
                (d: LayoutConfig) => d.type === WidgetType.Widget && !ListChartTypes.includes(d.graph?.type || ""),
              ),
            );
          }
        }
        const configList = widgets.map((d: LayoutConfig) => ({
          metrics: d.expressions || [],
          metricConfig: d.metricConfig || [],
          id: d.i,
        }));
        if (!widgets.length) {
          return {};
        }
        loading.value = true;
        metricsValues.value = (await useDashboardQueryProcessor(configList)) || {};
        loading.value = false;
      }
      async function queryTabsMetrics() {
        const configList = dashboardStore.currentTabItems
          .filter(
            (item: LayoutConfig) => item.type === WidgetType.Widget && !ListChartTypes.includes(item.graph?.type || ""),
          )
          .map((d: LayoutConfig) => ({
            metrics: d.expressions || [],
            metricConfig: d.metricConfig || [],
            id: d.i,
          }));
        if (!configList.length) {
          return {};
        }
        loading.value = true;
        metricsValues.value = (await useDashboardQueryProcessor(configList)) || {};
        loading.value = false;
      }

      onBeforeUnmount(() => {
        dashboardStore.setLayout([]);
        selectorStore.setCurrentService(null);
        selectorStore.setCurrentPod(null);
        dashboardStore.setEntity("");
        dashboardStore.setConfigPanel(false);
      });

      watch(
        () => [selectorStore.currentService, selectorStore.currentDestService],
        () => {
          if ([EntityType[0].value, EntityType[4].value].includes(dashboardStore.entity)) {
            queryMetrics();
          }
        },
      );
      watch(
        () => [selectorStore.currentPod, selectorStore.currentDestPod],
        () => {
          if ([EntityType[0].value, EntityType[7].value, EntityType[8].value].includes(dashboardStore.entity)) {
            return;
          }
          queryMetrics();
        },
      );
      watch(
        () => [selectorStore.currentProcess, selectorStore.currentDestProcess],
        () => {
          if ([EntityType[7].value, EntityType[8].value].includes(dashboardStore.entity)) {
            queryMetrics();
          }
        },
      );
      watch(
        () => [appStore.durationTime, dashboardStore.layout],
        () => {
          if (dashboardStore.entity === EntityType[1].value) {
            queryMetrics();
          }
        },
      );
      watch(
        () => dashboardStore.currentTabItems,
        () => {
          queryTabsMetrics();
        },
      );
      return {
        dashboardStore,
        clickGrid,
        t,
        dragIgnoreFrom,
        metricsValues,
        loading,
      };
    },
  });
</script>
<style lang="scss" scoped>
  .vue-grid-layout {
    background: $layout-background;
    height: auto !important;
  }

  .vue-grid-item:not(.vue-grid-placeholder) {
    background-color: $theme-background;
    box-shadow: 0 0 3px 0 $box-shadow-color;
    border-radius: 3px;
  }

  .vue-grid-item.active {
    border: 1px solid var(--sw-grid-item-active);
  }

  .no-data-tips {
    width: 100%;
    text-align: center;
    font-size: $font-size-normal;
    padding-top: 30px;
    color: #888;
  }
</style>
