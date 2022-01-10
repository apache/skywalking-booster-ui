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
    <div class="tabs">
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
          :readonly="isNaN(editTabIndex)"
          :class="{ view: isNaN(editTabIndex) }"
        />
        <Icon
          v-show="activeTabIndex === idx"
          size="sm"
          iconName="cancel"
          @click="deleteTabItem(idx)"
        />
      </span>
      <span class="tab-icons">
        <i @click="addTabItem">
          <Icon size="middle" iconName="add" />
        </i>
        <i @click="addTabWidget">
          <Icon size="middle" iconName="playlist_add" />
        </i>
      </span>
    </div>
    <div class="operations">
      <Icon size="sm" iconName="clearclose" @click="removeTab" />
    </div>
  </div>
  <div class="tab-layout">
    <grid-layout
      v-model:layout="state.layout"
      :col-num="24"
      :row-height="10"
      :is-draggable="true"
      :is-resizable="true"
      @layout-updated="layoutUpdatedEvent"
    >
      <grid-item
        v-for="item in state.layout"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        :key="item.i"
        @click="clickTabGrid($event, item)"
        :class="{ active: activeTabWidget === item.i }"
      >
        <Widget :data="item" :active="activeTabWidget === item.i" />
      </grid-item>
    </grid-layout>
  </div>
</template>
<script lang="ts" setup>
import { defineProps, reactive, ref, watch } from "vue";
import type { PropType } from "vue";
import Widget from "./Widget.vue";
import { LayoutConfig } from "@/types/dashboard";
import { useDashboardStore } from "@/store/modules/dashboard";

const props = defineProps({
  data: {
    type: Object as PropType<LayoutConfig>,
    default: () => ({ children: [] }),
  },
  active: { type: Boolean, default: false },
});
const dashboardStore = useDashboardStore();
const activeTabIndex = ref<number>(0);
const activeTabWidget = ref<string>("0");
const editTabIndex = ref<number>(NaN); // edit tab item name
const state = reactive<{
  layout: LayoutConfig[];
}>({
  layout:
    dashboardStore.layout[props.data.i].children[activeTabIndex.value].children,
});

function layoutUpdatedEvent(newLayout: LayoutConfig[]) {
  state.layout = newLayout;
}
function clickTabs(e: Event, idx: number) {
  e.stopPropagation();
  activeTabIndex.value = idx;
}
function removeTab() {
  dashboardStore.removeControls(props.data);
}
function deleteTabItem(idx: number) {
  dashboardStore.removeTabItem(props.data, idx);
}
function addTabItem() {
  dashboardStore.addTabItem(props.data);
}
function editTabName(el: Event, index: number) {
  el.stopPropagation();
  editTabIndex.value = index;
}
function handleClick(el: any) {
  if (el.target.className === "tab-name") {
    return;
  }
  editTabIndex.value = NaN;
}
function addTabWidget(e: Event) {
  e.stopPropagation();
  activeTabWidget.value = String(state.layout.length);
  dashboardStore.addTabWidget(activeTabIndex.value);
  dashboardStore.activeGridItem(
    `${props.data.i}-${activeTabIndex.value}-${activeTabWidget.value}`
  );
}
function clickTabGrid(e: Event, item: LayoutConfig) {
  e.stopPropagation();
  activeTabWidget.value = item.i;
  dashboardStore.activeGridItem(
    `${props.data.i}-${activeTabIndex.value}-${item.i}`
  );
}
document.body.addEventListener("click", handleClick, false);
watch(
  () =>
    dashboardStore.layout[props.data.i].children[activeTabIndex.value].children,
  (data) => {
    state.layout = data;
  }
);
watch(
  () => dashboardStore.activedGridItem,
  (data) => {
    const i = data.split("-");
    if (i[0] === props.data.i && activeTabIndex.value === Number(i[1])) {
      activeTabWidget.value = i[2];
    } else {
      activeTabWidget.value = "";
    }
  }
);
</script>
<style lang="scss" scoped>
.tabs {
  height: 40px;
  color: #ccc;

  span {
    display: inline-block;
    padding: 0 10px;
    margin: 0 10px;
    height: 40px;
    line-height: 40px;
    cursor: pointer;
  }

  .tab-name {
    max-width: 80px;
    height: 20px;
    line-height: 20px;
    outline: none;
    color: #333;
    font-style: normal;
    margin-right: 5px;
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
    color: #409eff;
  }
}

.el-input__inner {
  border: none !important;
}

.operations {
  color: #aaa;
  cursor: pointer;
  height: 40px;
  line-height: 40px;
  padding-right: 10px;
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
  border-radius: 5px;
}

.tab-layout {
  height: calc(100% - 55px);
  overflow: auto;
}

.vue-grid-item.active {
  border: 1px solid #409eff;
}
</style>
