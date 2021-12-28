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
</template>

<script lang="ts" setup>
import { ElTooltip } from "element-plus";
import { useDashboardStore } from "@/store/modules/dashboard";

const dashboardStore = useDashboardStore();
</script>
<style lang="scss" scoped>
.dashboard-tool {
  text-align: right;
  padding: 5px 10px;
  background: rgb(240, 242, 245);
  border-bottom: 1px solid #dfe4e8;
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
</style>
