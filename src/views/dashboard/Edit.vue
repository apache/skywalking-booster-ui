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
  <div class="dashboard-tool">
    <el-tooltip class="item" effect="dark" content="Add Widget" placement="top">
      <span class="icon-btn" @click="dashboardStore.addWidget">
        <Icon size="sm" iconName="playlist_add" />
      </span>
    </el-tooltip>
    <el-tooltip class="item" effect="dark" content="Settings" placement="top">
      <span class="icon-btn" @click="dashboardStore.setConfigPanel(true)">
        <Icon size="sm" iconName="settings" />
      </span>
    </el-tooltip>
    <el-tooltip class="item" effect="dark" content="Import" placement="top">
      <span class="icon-btn">
        <Icon size="sm" iconName="folder_open" />
      </span>
    </el-tooltip>
    <el-tooltip class="item" effect="dark" content="Export" placement="top">
      <span class="icon-btn">
        <Icon size="sm" iconName="save_alt" />
      </span>
    </el-tooltip>
    <el-tooltip class="item" effect="dark" content="Apply" placement="top">
      <span class="icon-btn">
        <Icon size="sm" iconName="save" />
      </span>
    </el-tooltip>
  </div>
  <div class="ds-main">
    <GridLayout />
    <el-dialog
      v-model="dashboardStore.showConfig"
      title="Configurations"
      width="95%"
      @closed="dashboardStore.setConfigPanel(false)"
    >
      <div class="configuration">xxxx</div>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import GridLayout from "./panel/Layout.vue";
import { LayoutConfig } from "@/types/dashboard";
import { useDashboardStore } from "@/store/modules/dashboard";
import { ElDialog, ElTooltip } from "element-plus";

const dashboardStore = useDashboardStore();
// fetch layout data from serve side
const layout: LayoutConfig[] = [
  { x: 0, y: 0, w: 4, h: 12, i: "0" },
  { x: 4, y: 0, w: 4, h: 12, i: "1" },
  { x: 8, y: 0, w: 4, h: 15, i: "2" },
  { x: 12, y: 0, w: 4, h: 9, i: "3" },
  { x: 16, y: 0, w: 4, h: 9, i: "4" },
  { x: 20, y: 0, w: 4, h: 9, i: "5" },
  { x: 0, y: 12, w: 4, h: 15, i: "7" },
  { x: 4, y: 12, w: 4, h: 15, i: "8" },
  { x: 8, y: 15, w: 4, h: 12, i: "9" },
  { x: 12, y: 9, w: 4, h: 12, i: "10" },
  { x: 16, y: 9, w: 4, h: 12, i: "11" },
  { x: 20, y: 9, w: 4, h: 15, i: "12" },
  { x: 0, y: 27, w: 4, h: 12, i: "14" },
  { x: 4, y: 27, w: 4, h: 12, i: "15" },
  { x: 8, y: 27, w: 4, h: 15, i: "16" },
];
dashboardStore.setLayout(layout);
</script>
<style lang="scss" scoped>
.dashboard-tool {
  text-align: right;
  padding: 5px 10px;
  background: rgb(240, 242, 245);
  border-bottom: 1px solid #dfe4e8;
}

.ds-main {
  height: calc(100% - 40px);
}

.layout {
  height: 100%;
  flex-grow: 2;
  overflow: hidden;
}

.grids {
  height: 100%;
  overflow-y: auto;
}

.ds-config {
  width: 340px;
  background-color: #fff;
  box-shadow: 2px 0 2px 0 #ccc;
  text-align: center;
  border-left: 1px solid #eee;
}

.icon-btn {
  display: inline-block;
  padding: 0 5px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-left: 8px;
  cursor: pointer;
  background-color: #eee;
  color: #666;
}

.configuration {
  height: 600px;
}
</style>
