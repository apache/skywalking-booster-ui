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
  <div class="topology">
    <div class="header flex-h">
      <div>{{ data.widget?.title || "" }}</div>
      <div>
        <el-tooltip :content="data.widget?.tips">
          <span>
            <Icon
              iconName="info_outline"
              size="sm"
              class="operation"
              v-show="data.widget?.tips"
            />
          </span>
        </el-tooltip>
        <el-popover placement="bottom" trigger="click" :width="100">
          <template #reference>
            <span>
              <Icon iconName="ellipsis_v" size="middle" class="operation" />
            </span>
          </template>
          <div class="tools" @click="editConfig">
            <span>{{ t("edit") }}</span>
          </div>
          <div class="tools" @click="removeTopo">
            <span>{{ t("delete") }}</span>
          </div>
        </el-popover>
      </div>
    </div>
    <div
      class="body"
      @click="ViewTopology"
      :style="{ backgroundColor: Colors[data.graph.backgroundColor] }"
    >
      <Icon
        :iconName="data.graph.iconTheme ? 'topology-light' : 'topology-dark'"
        size="middle"
      />
      <div
        :style="{
          color: Colors[data.graph.fontColor],
          fontSize: data.graph.fontSize + 'px',
        }"
      >
        {{ data.graph.content }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useDashboardStore } from "@/store/modules/dashboard";
import { Colors } from "../data";
/*global defineProps */
const props = defineProps({
  data: {
    type: Object as PropType<any>,
    default: () => ({ graph: {} }),
  },
  activeIndex: { type: String, default: "" },
});
const { t } = useI18n();
const dashboardStore = useDashboardStore();

function editConfig() {
  dashboardStore.setConfigPanel(true);
  dashboardStore.selectWidget(props.data);
}
function ViewTopology() {
  dashboardStore.setTopology(true);
}
function removeTopo() {
  dashboardStore.removeControls(props.data);
}
</script>
<style lang="scss" scoped>
.topology {
  font-size: 12px;
  height: 100%;
}

.header {
  height: 30px;
  padding: 5px;
  width: 100%;
  border-bottom: 1px solid #eee;
  justify-content: space-between;
}

.operation {
  cursor: pointer;
}

.tools {
  padding: 5px 0;
  color: #999;
  cursor: pointer;
  position: relative;
  text-align: center;

  &:hover {
    color: #409eff;
    background-color: #eee;
  }
}

.body {
  text-align: center;
  width: 100%;
  height: calc(100% - 30px);
  cursor: pointer;
  box-sizing: border-box;
  color: #333;
  display: -webkit-box;
  -webkit-box-orient: horizontal;
  -webkit-box-pack: center;
  -webkit-box-align: center;
}

.no-data {
  font-size: 14px;
  color: #888;
  width: 100%;
  text-align: center;
  padding-top: 20px;
}
</style>
