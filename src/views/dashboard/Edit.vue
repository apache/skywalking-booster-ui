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
    <el-button size="mini" @click="addWidget"> Add Widget </el-button>
    <el-button size="mini">Dashboard Settings</el-button>
    <el-button size="mini">Save As</el-button>
    <el-button size="mini">Discard</el-button>
    <el-button size="mini" type="primary">Apply</el-button>
  </div>
  <div class="flex-h ds-main">
    <div class="layout">
      <div class="grids">
        <GridLayout />
      </div>
    </div>
    <div
      class="ds-config"
      v-show="dashboardStore.showConfig"
      @click="dashboardStore.setConfigPanel(true)"
    >
      Configurations
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ElButton } from "element-plus";
import GridLayout from "./panel/Layout.vue";
import { LayoutConfig } from "@/types/dashboard";
import { useDashboardStore } from "@/store/modules/dashboard";

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
  { x: 4, y: 8, w: 4, h: 12, i: "15" },
  { x: 8, y: 10, w: 4, h: 15, i: "16" },
];
dashboardStore.setLayout(layout);
document.addEventListener("click", setConfig, true);
function setConfig() {
  dashboardStore.setConfigPanel(false);
}
function addWidget() {
  dashboardStore.addWidget();
}
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
</style>
