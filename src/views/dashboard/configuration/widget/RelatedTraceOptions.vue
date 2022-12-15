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
  <div v-if="type === 'TopList'" class="item">
    <span class="label">RefId</span>
    <Selector
      size="small"
      :value="refIdType"
      :options="RefIdTypes"
      placeholder="Select a refId"
      @change="updateConfig({ refIdType: $event[0].value })"
      class="selector"
    />
  </div>
  <div v-else class="item">
    <span class="label">{{ t("enableRelatedTrace") }}</span>
    <el-switch v-model="enableRelate" active-text="Yes" inactive-text="No" @change="updateConfig({ enableRelate })" />
  </div>
  <div v-if="enableRelate">
    <div class="item">
      <span class="label">{{ t("status") }}</span>
      <Selector
        size="small"
        :value="status"
        :options="Status"
        placeholder="Select a status"
        @change="updateConfig({ status: $event[0].value })"
        class="selector"
      />
    </div>
    <div class="item">
      <span class="label">{{ t("setOrder") }}</span>
      <Selector
        size="small"
        :value="queryOrder"
        :options="QueryOrders"
        placeholder="Select a option"
        class="selector"
        @change="updateConfig({ queryOrder: $event[0].value })"
      />
    </div>
    <div class="item">
      <span class="label">{{ t("setLatencyDuration") }}</span>
      <el-switch v-model="latency" active-text="Yes" inactive-text="No" @change="updateConfig({ latency })" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { RefIdTypes } from "../../data";

  const QueryOrders = [
    { label: "None", value: "BY_START_TIME" },
    { label: "Duration", value: "BY_DURATION" },
  ];
  const Status = [
    { label: "None", value: "ALL" },
    { label: "Success", value: "SUCCESS" },
    { label: "Error", value: "ERROR" },
  ];
  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const { graph, relatedTrace } = dashboardStore.selectedGrid;
  const traceOpt = relatedTrace || {};
  const status = ref<string>(traceOpt.status || Status[0].value);
  const queryOrder = ref<string>(traceOpt.queryOrder || QueryOrders[0].value);
  const latency = ref<boolean>(traceOpt.latency || false);
  const enableRelate = ref<boolean>(traceOpt.enableRelate || false);
  const type = ref<string>((graph && graph.type) || "");
  const refIdType = ref<string>(traceOpt.refIdType || "traceId");

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

  .item {
    margin-bottom: 10px;
  }

  .selector {
    width: 500px;
  }
</style>
