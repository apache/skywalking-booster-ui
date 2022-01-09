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
        v-for="(item, idx) in data.children || []"
        :key="idx"
        :class="{ active: state.activeTab === idx }"
        @click="clickTabs(idx)"
      >
        {{ item.name }}
        <Icon
          v-show="state.activeTab === idx"
          size="sm"
          iconName="cancel"
          @click="deleteTabItem(idx)"
        />
      </span>

      <span class="add-Item" @click="addTabItem">
        <Icon size="middle" iconName="add" />
      </span>
    </div>
    <div class="operations">
      <Icon size="sm" iconName="clearclose" @click="removeTab" />
    </div>
  </div>
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
    >
      <Widget :item="item" />
    </grid-item>
  </grid-layout>
</template>
<script lang="ts" setup>
import { defineProps, reactive } from "vue";
import type { PropType } from "vue";
import Widget from "./Widget.vue";
import { LayoutConfig } from "@/types/dashboard";
import { useDashboardStore } from "@/store/modules/dashboard";

const props = defineProps({
  data: {
    type: Object as PropType<{ type: string; children: any[] }>,
    default: () => ({ children: [] }),
  },
  active: { type: Boolean, default: false },
});
const dashboardStore = useDashboardStore();
const state = reactive<{ layout: any[]; activeTab: number }>({
  layout: [],
  activeTab: 0,
});
function layoutUpdatedEvent(newLayout: LayoutConfig[]) {
  state.layout = newLayout;
}
function clickTabs(idx: number) {
  state.activeTab = idx;
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
</script>
<style lang="scss" scoped>
.tabs {
  height: 40px;

  span {
    display: inline-block;
    width: auto;
    padding: 0 10px;
    margin: 0 10px;
    height: 40px;
    line-height: 40px;
    cursor: pointer;
  }

  span.active {
    border-bottom: 1px solid #409eff;
    color: #409eff;
  }
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
</style>
