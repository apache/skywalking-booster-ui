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
      v-if="dashboardStore.editMode"
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
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useDashboardStore } from "@/store/modules/dashboard";
/*global defineProps */
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  activeIndex: { type: String, default: "" },
  needQuery: { type: Boolean, default: true },
});
const { t } = useI18n();
const dashboardStore = useDashboardStore();

function removeWidget() {
  dashboardStore.removeControls(props.data);
}
</script>
