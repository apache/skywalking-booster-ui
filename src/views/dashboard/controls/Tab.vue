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
  <div class="flex-h tab-header">
    <div class="tabs scroll_bar_style" @click="handleClick">
      <template v-for="(child, idx) in data.children || []">
        <span
          :key="idx"
          :class="{ active: activeTabIndex === idx }"
          @click="clickTabs($event, idx)"
          v-if="child.enable !== false"
        >
          <input
            @click="editTabName($event, idx)"
            v-model="child.name"
            placeholder="Please input"
            class="tab-name"
            :readonly="isNaN(editTabIndex) && !canEditTabName"
            :class="{ view: !canEditTabName }"
            :style="{ width: getStringWidth(child.name) + 'px' }"
          />
          <Icon
            v-show="activeTabIndex === idx"
            size="sm"
            iconName="cancel"
            @click="deleteTabItem($event, idx)"
            v-if="dashboardStore.editMode && canEditTabName"
          />
        </span>
      </template>
      <template v-for="(child, idx) in data.children || []">
        <span
          :key="idx"
          :style="{ width: getStringWidth(child.name) + 'px' }"
          v-if="child.enable === false"
          class="tab-diabled"
        >
          {{ child.name }}
        </span>
      </template>
      <span class="tab-icons">
        <el-tooltip content="Copy Link" placement="bottom">
          <i @click="copyLink">
            <Icon size="middle" iconName="copy" class="tab-icon" />
          </i>
        </el-tooltip>
      </span>
      <span class="tab-icons" v-if="dashboardStore.editMode">
        <el-tooltip content="Add tab items" placement="bottom">
          <i @click="addTabItem">
            <Icon size="middle" iconName="add_fill" class="tab-icon" />
          </i>
        </el-tooltip>
      </span>
    </div>
    <div class="operations" v-if="dashboardStore.editMode">
      <el-dropdown placement="bottom" trigger="click" :width="200">
        <span class="icon-operation">
          <Icon class="icon-tool" iconName="ellipsis_v" size="middle" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="editConfig">
              <span>{{ t("edit") }}</span>
            </el-dropdown-item>
            <el-dropdown-item @click="canEditTabName = true">
              <span class="edit-tab">{{ t("editTab") }}</span>
            </el-dropdown-item>
            <el-dropdown-item @click="removeTab">
              <span>{{ t("delete") }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
  <div class="tab-layout" @click="handleClick">
    <grid-layout
      v-if="dashboardStore.currentTabItems.length"
      v-model:layout="dashboardStore.currentTabItems"
      :col-num="24"
      :row-height="10"
      :is-draggable="dashboardStore.editMode"
      :is-resizable="dashboardStore.editMode"
      @layout-updated="layoutUpdatedEvent"
    >
      <grid-item
        v-for="item in dashboardStore.currentTabItems"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        :key="item.id"
        @click="clickTabGrid($event, item)"
        :class="{ active: activeTabWidget === item.i }"
        :drag-ignore-from="dragIgnoreFrom"
      >
        <component
          :is="item.type"
          :data="item"
          :activeIndex="`${data.i}-${activeTabIndex}-${item.i}`"
          :needQuery="needQuery"
        />
      </grid-item>
    </grid-layout>
    <div class="no-data-tips" v-else>{{ t("noWidget") }}</div>
  </div>
</template>
<script lang="ts">
  import { ref, watch, defineComponent, toRefs, onUnmounted } from "vue";
  import { useI18n } from "vue-i18n";
  import { useRoute } from "vue-router";
  import type { PropType } from "vue";
  import type { LayoutConfig } from "@/types/dashboard";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import controls from "./tab";
  import { dragIgnoreFrom, WidgetType } from "../data";
  import copy from "@/utils/copy";
  import { useExpressionsQueryProcessor } from "@/hooks/useExpressionsProcessor";

  const props = {
    data: {
      type: Object as PropType<LayoutConfig>,
      default: () => ({ children: [] }),
    },
    active: { type: Boolean, default: false },
  };
  export default defineComponent({
    name: "Tab",
    components: {
      ...controls,
    },
    props,
    setup(props) {
      const { t } = useI18n();
      const dashboardStore = useDashboardStore();
      const route = useRoute();
      const activeTabIndex = ref<number>(Number(route.params.activeTabIndex) || 0);
      const activeTabWidget = ref<string>("");
      const editTabIndex = ref<number>(NaN); // edit tab item name
      const canEditTabName = ref<boolean>(false);
      const needQuery = ref<boolean>(false);
      const l = dashboardStore.layout.findIndex((d: LayoutConfig) => d.i === props.data.i);

      dashboardStore.setActiveTabIndex(activeTabIndex.value);
      if (dashboardStore.layout[l].children.length) {
        const tab = dashboardStore.layout[l].children[activeTabIndex.value];
        dashboardStore.setCurrentTabItems(
          tab.enable === false ? [] : dashboardStore.layout[l].children[activeTabIndex.value].children,
        );
        dashboardStore.setActiveTabIndex(activeTabIndex.value, props.data.i);
      }
      queryExpressions();

      function clickTabs(e: Event, idx: number) {
        e.stopPropagation();
        activeTabIndex.value = idx;
        dashboardStore.activeGridItem(props.data.i);
        dashboardStore.selectWidget(props.data);
        dashboardStore.setActiveTabIndex(idx);
        const l = dashboardStore.layout.findIndex((d: LayoutConfig) => d.i === props.data.i);
        dashboardStore.setCurrentTabItems(dashboardStore.layout[l].children[activeTabIndex.value].children);
        needQuery.value = true;
        if (route.params.activeTabIndex) {
          let p = location.href.split("/tab/")[0];
          p = p + "/tab/" + activeTabIndex.value;
          history.replaceState({}, "", p);
        }
      }
      function removeTab(e: Event) {
        e.stopPropagation();
        dashboardStore.removeTab(props.data);
      }
      function deleteTabItem(e: Event, idx: number) {
        e.stopPropagation();
        dashboardStore.removeTabItem(props.data, idx);
        const kids = dashboardStore.layout[l].children[0];
        const arr = (kids && kids.children) || [];
        dashboardStore.setCurrentTabItems(arr);
        dashboardStore.activeGridItem(0);
        activeTabIndex.value = 0;
        needQuery.value = true;
      }
      function addTabItem() {
        dashboardStore.addTabItem(props.data);
      }
      function editTabName(el: Event, index: number) {
        if (!canEditTabName.value) {
          editTabIndex.value = NaN;
          return;
        }
        editTabIndex.value = index;
      }
      function handleClick(el: any) {
        el.stopPropagation();
        needQuery.value = true;
        if (["tab-name", "edit-tab"].includes(el.target.className)) {
          return;
        }
        canEditTabName.value = false;
        editTabIndex.value = NaN;
      }
      function clickTabGrid(e: Event, item: LayoutConfig) {
        e.stopPropagation();
        activeTabWidget.value = item.i;
        dashboardStore.activeGridItem(`${props.data.i}-${activeTabIndex.value}-${item.i}`);
        handleClick(e);
      }
      function layoutUpdatedEvent() {
        const l = dashboardStore.layout.findIndex((d: LayoutConfig) => d.i === props.data.i);
        dashboardStore.setCurrentTabItems(dashboardStore.layout[l].children[activeTabIndex.value].children);
      }
      function getStringWidth(s: string) {
        const dom = document.createElement("span");
        dom.style.display = "inline-block";
        dom.textContent = s;
        document.body.appendChild(dom);
        const width = dom.clientWidth;

        document.body.removeChild(dom);
        return width + 10;
      }
      function copyLink() {
        let path = "";
        if (route.params.activeTabIndex === undefined) {
          path = location.href + "/tab/" + activeTabIndex.value;
        } else {
          const p = location.href.split("/tab/")[0];
          path = p + "/tab/" + activeTabIndex.value;
        }
        copy(path);
      }
      document.body.addEventListener("click", handleClick, false);

      function editConfig() {
        dashboardStore.setConfigPanel(true);
        dashboardStore.selectWidget(props.data);
      }

      async function queryExpressions() {
        const tabsProps = props.data;
        const metrics = [];
        for (const child of tabsProps.children || []) {
          child.expression && metrics.push(child.expression);
        }
        if (!metrics.length) {
          return;
        }
        const params: { [key: string]: any } = (await useExpressionsQueryProcessor({ metrics })) || {};
        for (const child of tabsProps.children || []) {
          if (params.source[child.expression || ""]) {
            child.enable =
              !!Number(params.source[child.expression || ""]) &&
              !!child.children.find((item: { type: string }) => item.type === WidgetType.Widget);
          } else {
            child.enable = true;
          }
        }

        dashboardStore.setConfigs(tabsProps);
        if (((props.data.children || [])[activeTabIndex.value] || {}).enable === false) {
          const index = (props.data.children || []).findIndex((tab: any) => tab.enable !== false) || 0;
          const items = ((props.data.children || [])[index] || {}).children;
          dashboardStore.setCurrentTabItems(items || []);
          dashboardStore.activeGridItem(0);
          activeTabIndex.value = index;
          dashboardStore.setActiveTabIndex(activeTabIndex.value);
          needQuery.value = true;
        }
      }

      onUnmounted(() => {
        document.body.removeEventListener("click", handleClick, false);
      });

      watch(
        () => (props.data.children || []).map((d: any) => d.expression),
        (old: string[], data: string[]) => {
          if (JSON.stringify(data) === JSON.stringify(old)) {
            return;
          }
          queryExpressions();
        },
      );
      watch(
        () => dashboardStore.activedGridItem,
        (data) => {
          if (!data) {
            activeTabWidget.value = "";
            return;
          }
          const i = data.split("-");
          if (i[0] === props.data.i && activeTabIndex.value === Number(i[1])) {
            activeTabWidget.value = i[2];
          } else {
            activeTabWidget.value = "";
          }
        },
      );
      watch(
        () => dashboardStore.currentTabIndex,
        () => {
          activeTabIndex.value = dashboardStore.currentTabIndex;
          dashboardStore.activeGridItem(props.data.i);
          dashboardStore.selectWidget(props.data);
          const l = dashboardStore.layout.findIndex((d: LayoutConfig) => d.i === props.data.i);
          dashboardStore.setCurrentTabItems(dashboardStore.layout[l].children[activeTabIndex.value].children);
          needQuery.value = true;
          if (route.params.activeTabIndex) {
            let p = location.href.split("/tab/")[0];
            p = p + "/tab/" + activeTabIndex.value;
            history.replaceState({}, "", p);
          }
        },
      );
      return {
        handleClick,
        layoutUpdatedEvent,
        clickTabGrid,
        editTabName,
        addTabItem,
        deleteTabItem,
        removeTab,
        clickTabs,
        copyLink,
        getStringWidth,
        editConfig,
        ...toRefs(props),
        activeTabWidget,
        dashboardStore,
        activeTabIndex,
        editTabIndex,
        needQuery,
        canEditTabName,
        t,
        dragIgnoreFrom,
      };
    },
  });
</script>
<style lang="scss" scoped>
  .tabs {
    height: 40px;
    color: var(--sw-icon-btn-color);
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    overflow-y: hidden;
    padding: 0 10px;
    display: inline-flex;

    span {
      display: inline-block;
      height: 40px;
      line-height: 40px;
      cursor: pointer;
      text-align: center;
    }

    .tab-name {
      max-width: 150px;
      height: 20px;
      line-height: 20px;
      outline: none;
      color: $font-color;
      font-style: normal;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 20px;
      background-color: $theme-background;
    }

    .tab-diabled {
      max-width: 150px;
      outline: none;
      color: $disabled-color;
      font-style: normal;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 20px;
      background-color: $theme-background;
      cursor: not-allowed;
    }

    .tab-icons {
      i {
        margin-right: 3px;
      }
    }

    .view {
      cursor: pointer;
    }

    input.tab-name {
      border: 0;
    }

    span.active {
      border-bottom: 1px solid $active-color;

      .tab-name {
        color: $active-color;
      }
    }
  }

  .operations {
    color: #aaa;
    cursor: pointer;
    height: 40px;
    line-height: 40px;
    padding-right: 10px;
  }

  .icon-operation {
    display: inline-block;
    margin-top: 8px;
  }

  .tab-header {
    justify-content: space-between;
    width: 100%;
    border-bottom: 1px solid $border-color-primary;
  }

  .vue-grid-layout {
    background: $layout-background;
    height: auto !important;
  }

  .vue-grid-item:not(.vue-grid-placeholder) {
    background: $theme-background;
    box-shadow: 0 0 3px 0 $box-shadow-color;
    border-radius: 3px;
  }

  .tab-layout {
    height: calc(100% - 55px);
    overflow: auto;
  }

  .tab-icon {
    color: var(--sw-icon-btn-color);
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
