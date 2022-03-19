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
  <div class="log-wrapper flex-v">
    <el-popover
      placement="bottom"
      trigger="click"
      :width="100"
      v-if="routeParams.entity"
    >
      <template #reference>
        <span class="delete cp">
          <Icon iconName="ellipsis_v" size="middle" class="operation" />
        </span>
      </template>
      <div class="tools" @click="removeWidget">
        <span>{{ t("delete") }}</span>
      </div>
    </el-popover>
    <div class="header">
      <Header />
    </div>
    <div class="log">
      <List />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useDashboardStore } from "@/store/modules/dashboard";
import Header from "../related/log/Header.vue";
import List from "../related/log/List.vue";

/*global defineProps */
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  activeIndex: { type: String, default: "" },
});
const { t } = useI18n();
const routeParams = useRoute().params;
const dashboardStore = useDashboardStore();

function removeWidget() {
  dashboardStore.removeControls(props.data);
}
</script>
<style lang="scss" scoped>
.log-wrapper {
  width: 100%;
  height: 100%;
  font-size: 12px;
  position: relative;
}

.delete {
  position: absolute;
  top: 5px;
  right: 3px;
}

.header {
  padding: 10px;
  font-size: 12px;
  border-bottom: 1px solid #dcdfe6;
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

.log {
  width: 100%;
  overflow: auto;
}
</style>
