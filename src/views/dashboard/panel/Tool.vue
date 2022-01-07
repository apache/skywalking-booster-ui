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
  <div class="dashboard-tool flex-h">
    <div class="flex-h">
      <div class="selectors-item" v-if="states.key < 3">
        <span class="label">$Service</span>
        <Selector
          :value="states.service"
          :options="Options"
          size="mini"
          placeholder="Select a service"
          :borderRadius="0"
          @change="changeService"
          class="selectors"
        />
      </div>
      <div class="selectors-item" v-if="states.key === 3 || states.key === 4">
        <span class="label">$ServiceInstance</span>
        <el-cascader
          placeholder="Select a instance"
          :options="SelectOpts"
          size="mini"
          filterable
          :style="{ minWidth: '300px' }"
        />
      </div>
      <div class="selectors-item" v-if="states.key === 2">
        <span class="label">$DestinationService</span>
        <Selector
          :value="states.service"
          :options="Options"
          size="mini"
          placeholder="Select a service"
          :borderRadius="0"
          @change="changeService"
          class="selectors"
        />
      </div>
      <div class="selectors-item" v-if="states.key === 4">
        <span class="label">$DestinationServiceInstance</span>
        <el-cascader
          placeholder="Select a instance"
          :options="SelectOpts"
          size="mini"
          filterable
          :style="{ minWidth: '300px' }"
        />
      </div>
    </div>
    <div class="tool-icons">
      <el-tooltip
        v-for="(t, index) in ToolIcons"
        :key="index"
        class="item"
        :content="t.content"
        placement="top"
      >
        <span class="icon-btn" @click="clickIcons(t)">
          <Icon size="sm" :iconName="t.name" />
        </span>
      </el-tooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { useRoute } from "vue-router";
import { ElTooltip, ElCascader } from "element-plus";
import { useDashboardStore } from "@/store/modules/dashboard";
import { Options, SelectOpts, EntityType, ToolIcons } from "../data";

const dashboardStore = useDashboardStore();
const params = useRoute().params;
const states = reactive<{
  entity: string | string[];
  layerId: string | string[];
  service: string;
  pod: string;
  destService: string;
  destPod: string;
  key: number;
}>({
  service: Options[0].value,
  pod: Options[0].value, // instances and endpoints
  destService: "",
  destPod: "",
  key: EntityType.filter((d: any) => d.value === params.entity)[0].key || 0,
  entity: params.entity,
  layerId: params.layerId,
});

dashboardStore.setLayer(states.layerId);
dashboardStore.setEntity(states.entity);

function changeService(val: { value: string; label: string }) {
  states.service = val.value;
}

function clickIcons(t: { id: string; content: string; name: string }) {
  switch (t.id) {
    case "addWidget":
      dashboardStore.addWidget();
      break;
    case "addTab":
      dashboardStore.addTab();
      break;
    case "addImage":
      dashboardStore.addWidget();
      break;
    case "settings":
      dashboardStore.setConfigPanel(true);
      break;
  }
}
</script>
<style lang="scss" scoped>
.dashboard-tool {
  text-align: right;
  padding: 5px;
  background: rgb(240, 242, 245);
  border-bottom: 1px solid #dfe4e8;
  justify-content: space-between;
}

.label {
  font-size: 12px;
  display: inline-block;
  padding: 4px 2px;
  border: var(--el-input-border, var(--el-border-base));
  border-right: none;
  border-radius: 2px;
}

.icon-btn {
  display: inline-block;
  padding: 0 5px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-left: 6px;
  cursor: pointer;
  background-color: #eee;
  color: #666;
}

.selectors {
  min-width: 180px;
}

.selectors-item {
  margin-right: 5px;
}
</style>
