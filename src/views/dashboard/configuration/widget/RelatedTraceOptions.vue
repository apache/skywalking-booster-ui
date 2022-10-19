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
  <div class="item">
    <span class="label">{{ t("status") }}</span>
    <Selector
      size="small"
      :value="status"
      :options="Status"
      placeholder="Select a status"
      @change="updateConfig({ status })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("queryOrder") }}</span>
    <Selector
      size="small"
      :value="queryOrder"
      :options="QueryOrders"
      placeholder="Select a option"
      @change="updateConfig({ queryOrder })"
    />
  </div>
  <!-- <div class="item">
    <span class="label">{{ t("setDuration") }}</span>
    <el-switch
      v-model="setDuration"
      active-text="Yes"
      inactive-text="No"
      @change="updateConfig({ setDuration })"
    />
  </div> -->
  <div class="item">
    <span class="label">{{ t("setLatencyDuration") }}</span>
    <el-switch
      v-model="setLatencyDuration"
      active-text="Yes"
      inactive-text="No"
      @change="updateConfig({ setLatencyDuration })"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useDashboardStore } from "@/store/modules/dashboard";
import { Status } from "../../data";
import { QueryOrders } from "../../data";

const { t } = useI18n();
const dashboardStore = useDashboardStore();
const traceOpt = dashboardStore.selectedGrid.relatedTrace;
const status = ref<string>(traceOpt.status || Status[0].value);
const queryOrder = ref<string>(traceOpt.queryOrder || QueryOrders[0].value);
// const setDuration = ref<boolean>(traceOpt.setDuration || false);
const setLatencyDuration = ref<boolean>(traceOpt.setLatencyDuration || false);

function updateConfig(param: { [key: string]: unknown }) {
  const relatedTrace = {
    ...dashboardStore.selectedGrid.relatedTrace,
    ...param,
  };
  dashboardStore.selectWidget({ ...dashboardStore.selectedGrid, relatedTrace });
}
</script>
<style lang="scss" scoped>
.label {
  font-size: 13px;
  font-weight: 500;
  display: block;
  margin-bottom: 5px;
}

.input {
  width: 500px;
}

.item {
  margin-bottom: 10px;
}
</style>
