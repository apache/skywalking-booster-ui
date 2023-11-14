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
  <div v-if="filters.id" class="conditions flex-h">
    <div class="label grey">TraceId:</div>
    <el-input size="small" v-model="traceId" class="trace-id" />
  </div>
  <div class="conditions flex-h" v-else>
    <el-radio-group v-model="conditions" @change="changeCondition" size="small">
      <el-radio-button v-for="(item, index) in items" :label="item.label" :key="item.label + index" border>
        {{ t(item.label) }}
      </el-radio-button>
    </el-radio-group>
    <Selector
      v-if="conditions === 'latency' && filters.latency.length > 1"
      :value="filters.latency[0].value"
      :options="filters.latency"
      placeholder="Select a option"
      @change="changeLatency"
      class="ml-10"
    />
    <el-popover trigger="hover" width="250" placement="bottom">
      <template #reference>
        <div class="cp conditions-popup">
          <Icon iconName="conditions" size="middle" />
        </div>
      </template>
      <div>
        <div class="title">{{ t("queryConditions") }}</div>
        <div v-for="key in Object.keys(FiltersKeys)" :key="key">
          <span
            v-if="
              [FiltersKeys.minTraceDuration, FiltersKeys.maxTraceDuration].includes(key) &&
              !isNaN(traceStore.conditions[FiltersKeys[key]])
            "
          >
            {{ t(key) }}: {{ traceStore.conditions[FiltersKeys[key]] }}
          </span>
          <span v-else-if="key !== 'duration'"> {{ t(key) }}: {{ traceStore.conditions[FiltersKeys[key]] }} </span>
        </div>
      </div>
    </el-popover>
    <el-popover trigger="hover" width="250" placement="bottom">
      <template #reference>
        <div class="cp metric-value">
          <Icon iconName="info_outline" size="middle" />
        </div>
      </template>
      <div>
        <div class="title">{{ t("metricValues") }}</div>
        <div v-for="metric in filters.metricValue" :key="metric.value"> {{ metric.label }}: {{ metric.data }} </div>
      </div>
    </el-popover>
  </div>
  <div class="flex-h">
    <ConditionTags :type="'TRACE'" @update="updateTags" />
    <div class="search-btn">
      <el-button size="small" type="primary" @click="queryTraces">
        {{ t("search") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive, onUnmounted } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import type { Option, DurationTime } from "@/types/app";
  import { useTraceStore } from "@/store/modules/trace";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { useSelectorStore } from "@/store/modules/selectors";
  import ConditionTags from "@/views/components/ConditionTags.vue";
  import { ElMessage } from "element-plus";
  import { EntityType, QueryOrders, Status } from "../../data";

  const FiltersKeys: { [key: string]: string } = {
    status: "traceState",
    queryOrder: "queryOrder",
    duration: "queryDuration",
    minTraceDuration: "minTraceDuration",
    maxTraceDuration: "maxTraceDuration",
  };
  /*global defineProps, Recordable */
  const props = defineProps({
    needQuery: { type: Boolean, default: true },
    data: {
      type: Object as PropType<Recordable>,
      default: () => ({ graph: {} }),
    },
  });
  const { t } = useI18n();
  const filters = reactive<Recordable>(props.data.filters || {});
  const appStore = useAppStoreWithOut();
  const selectorStore = useSelectorStore();
  const dashboardStore = useDashboardStore();
  const traceStore = useTraceStore();
  const tagsList = ref<string[]>([]);
  const tagsMap = ref<Option[]>([]);
  const traceId = ref<string>(filters.refId || "");
  const duration = ref<DurationTime>(filters.duration || appStore.durationTime);
  const state = reactive<Recordable>({
    instance: "",
    endpoint: "",
    service: "",
  });
  const conditions = ref<string>("");
  const items = ref<{ label: string; value: string }[]>([]);
  const currentLatency = ref<number[]>(filters.latency ? filters.latency[0].data : []);
  init();

  async function init() {
    for (const d of Object.keys(filters)) {
      if (
        (d === "queryOrder" && filters[d] && filters[d] === QueryOrders[1].value) ||
        (d === "status" && filters[d] && filters[d] !== Status[0].value) ||
        (filters[d] && d === "latency")
      ) {
        items.value.push({ label: d, value: FiltersKeys[d] });
      }
    }
    conditions.value = (items.value[0] && items.value[0].label) || "";
    if (!filters.id) {
      state.service = selectorStore.currentService.id;
      if (dashboardStore.entity === EntityType[2].value) {
        state.endpoint = selectorStore.currentPod.id;
      }
      if (dashboardStore.entity === EntityType[3].value) {
        state.instance = selectorStore.currentPod.id;
      }
      await queryTraces();
      return;
    }
    if (filters.isReadRecords) {
      await queryTraces();
      return;
    }
    if (dashboardStore.entity === EntityType[1].value) {
      await getService();
    }
    if (dashboardStore.entity === EntityType[0].value) {
      state.service = selectorStore.currentService.id;
      await getInstance();
      if (!state.instance) {
        await getEndpoint();
      }
    }
    await queryTraces();
  }
  function changeCondition() {
    if (conditions.value === "latency") {
      currentLatency.value = filters.latency ? filters.latency[0].data : [];
    }
    queryTraces();
  }

  function changeLatency(options: any[]) {
    currentLatency.value = options[0].data;
    queryTraces();
  }

  async function getService() {
    const resp = await traceStore.getService(filters.id);
    if (resp.errors) {
      ElMessage.error(resp.errors);
      return;
    }
    state.service = (resp.data.service && resp.data.service) || "";
  }
  async function getEndpoint() {
    const resp = await traceStore.getEndpoint(filters.id);
    if (resp.errors) {
      ElMessage.error(resp.errors);
      return;
    }
    state.endpoint = (resp.data.endpoint && resp.data.endpoint.id) || "";
  }
  async function getInstance() {
    const resp = await traceStore.getInstance(filters.id);
    if (resp.errors) {
      ElMessage.error(resp.errors);
      return;
    }
    state.instance = (resp.data.instance && resp.data.instance.id) || "";
  }
  function setCondition() {
    let params: Recordable = {
      traceState: Status[0].value,
      queryOrder: QueryOrders[0].value,
      queryDuration: duration.value,
      minTraceDuration: Number(currentLatency.value[0]),
      maxTraceDuration: Number(currentLatency.value[1]),
      tags: tagsMap.value.length ? tagsMap.value : undefined,
      paging: { pageNum: 1, pageSize: 20 },
      serviceId: state.service || undefined,
      endpointId: state.endpoint || undefined,
      serviceInstanceId: state.instance || undefined,
      traceId: traceId.value || undefined,
    };
    for (const k of items.value) {
      if (k.label === conditions.value && FiltersKeys[k.label] && filters[k.label]) {
        params[k.value] = filters[k.label];
      }
    }
    if (!isNaN(params.minTraceDuration)) {
      params.queryOrder = QueryOrders[1].value;
    }
    return params;
  }
  async function queryTraces() {
    traceStore.setTraceCondition(setCondition());
    const res = await traceStore.getTraces();
    if (res && res.errors) {
      ElMessage.error(res.errors);
    }
  }
  function updateTags(data: { tagsMap: Array<Option>; tagsList: string[] }) {
    tagsList.value = data.tagsList;
    tagsMap.value = data.tagsMap;
  }
  onUnmounted(() => {
    traceStore.resetState();
    const config = props.data;
    delete config.filters;
    dashboardStore.setWidget(config);
  });
</script>
<style lang="scss" scoped>
  .row {
    margin-bottom: 5px;
    position: relative;
  }

  .conditions {
    margin-bottom: 10px;
  }

  .search-btn {
    margin-top: 2px;
  }

  .metric-value {
    padding: 0 5px;
    line-height: 32px;
  }

  .conditions-popup {
    padding-left: 10px;
    line-height: 32px;
  }

  .title {
    margin-bottom: 10px;
    font-weight: bold;
  }

  .trace-id {
    width: 300px;
    margin-left: 10px;
  }

  .label {
    line-height: 22px;
  }
</style>
