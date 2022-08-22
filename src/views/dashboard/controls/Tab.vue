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
      <span
        v-for="(child, idx) in data.children || []"
        :key="idx"
        :class="{ active: activeTabIndex === idx }"
        @click="clickTabs($event, idx)"
      >
        <input
          @click="editTabName($event, idx)"
          v-model="child.name"
          placeholder="Please input"
          class="tab-name"
          :readonly="isNaN(editTabIndex) && !canEditTabName"
          :class="{ view: !canEditTabName }"
        />
        <Icon
          v-show="activeTabIndex === idx"
          size="sm"
          iconName="cancel"
          @click="deleteTabItem($event, idx)"
          v-if="dashboardStore.editMode && canEditTabName"
        />
      </span>
      <span class="tab-icons">
        <el-tooltip content="Copy Link" placement="bottom">
          <i @click="copyLink">
            <Icon size="middle" iconName="review-list" class="tab-icon" />
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
          <Icon iconName="ellipsis_v" size="middle" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
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
import { ref, watch, defineComponent, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import type { PropType } from "vue";
import { LayoutConfig } from "@/types/dashboard";
import { useDashboardStore } from "@/store/modules/dashboard";
import controls from "./tab";
import { dragIgnoreFrom } from "../data";
import copy from "@/utils/copy";

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
    const activeTabIndex = ref<number>(
      Number(route.params.activeTabIndex) || 0
    );
    const activeTabWidget = ref<string>("");
    const editTabIndex = ref<number>(NaN); // edit tab item name
    const canEditTabName = ref<boolean>(false);
    const needQuery = ref<boolean>(false);

    dashboardStore.setActiveTabIndex(activeTabIndex);
    const l = dashboardStore.layout.findIndex(
      (d: LayoutConfig) => d.i === props.data.i
    );
    if (dashboardStore.layout[l].children.length) {
      dashboardStore.setCurrentTabItems(
        dashboardStore.layout[l].children[activeTabIndex.value].children
      );
      dashboardStore.setActiveTabIndex(activeTabIndex.value, props.data.i);
    }

    function clickTabs(e: Event, idx: number) {
      e.stopPropagation();
      activeTabIndex.value = idx;
      dashboardStore.activeGridItem(props.data.i);
      dashboardStore.selectWidget(props.data);
      dashboardStore.setActiveTabIndex(idx);
      const l = dashboardStore.layout.findIndex(
        (d: LayoutConfig) => d.i === props.data.i
      );
      dashboardStore.setCurrentTabItems(
        dashboardStore.layout[l].children[activeTabIndex.value].children
      );
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
      dashboardStore.activeGridItem(
        `${props.data.i}-${activeTabIndex.value}-${item.i}`
      );
      handleClick(e);
    }
    function layoutUpdatedEvent() {
      const l = dashboardStore.layout.findIndex(
        (d: LayoutConfig) => d.i === props.data.i
      );
      dashboardStore.setCurrentTabItems(
        dashboardStore.layout[l].children[activeTabIndex.value].children
      );
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
      }
    );
    watch(
      () => dashboardStore.currentTabIndex,
      () => {
        activeTabIndex.value = dashboardStore.currentTabIndex;
        dashboardStore.activeGridItem(props.data.i);
        dashboardStore.selectWidget(props.data);
        const l = dashboardStore.layout.findIndex(
          (d: LayoutConfig) => d.i === props.data.i
        );
        dashboardStore.setCurrentTabItems(
          dashboardStore.layout[l].children[activeTabIndex.value].children
        );
        needQuery.value = true;
        if (route.params.activeTabIndex) {
          let p = location.href.split("/tab/")[0];
          p = p + "/tab/" + activeTabIndex.value;
          history.replaceState({}, "", p);
        }
      }
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
  color: #ccc;
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  overflow-y: hidden;

  span {
    display: inline-block;
    height: 40px;
    line-height: 40px;
    cursor: pointer;
    text-align: center;
  }

  .tab-name {
    max-width: 110px;
    height: 20px;
    line-height: 20px;
    outline: none;
    color: #333;
    font-style: normal;
    margin-right: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }

  .tab-icons {
    color: #333;

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
    border-bottom: 1px solid #409eff;

    .tab-name {
      color: #409eff;
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
  border-bottom: 1px solid #eee;
}

.vue-grid-layout {
  background: #f7f9fa;
  height: auto !important;
}

.vue-grid-item:not(.vue-grid-placeholder) {
  background: #fff;
  box-shadow: 0px 1px 4px 0px #00000029;
  border-radius: 3px;
}

.tab-layout {
  height: calc(100% - 55px);
  overflow: auto;
}

.tab-icon {
  color: #666;
}

.vue-grid-item.active {
  border: 1px solid #409eff;
}

.no-data-tips {
  width: 100%;
  text-align: center;
  font-size: 14px;
  padding-top: 30px;
  color: #888;
}
</style>
