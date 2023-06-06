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
  <div class="header">
    {{ t("monitorInstances") }}
  </div>
  <el-table :data="currentInstances" style="width: 99%" height="440">
    <el-table-column type="expand">
      <template #default="props">
        <div class="child">
          <div class="title">{{ t("attributes") }}</div>
          <div v-for="(attr, index) in props.row.attributes" :key="index">
            {{ `${attr.name}: ${attr.value}` }}
          </div>
          <div class="title mt-10">{{ t("processes") }}</div>
          <el-table :data="props.row.processes" size="small" max-height="300">
            <el-table-column prop="name" label="Name">
              <template #default="scope">
                <span :class="config.processDashboardName ? 'link' : ''">
                  {{ scope.row.name }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              v-for="item in HeaderChildLabels"
              :key="item.value"
              :label="item.label"
              :prop="item.value"
              :width="item.width"
            />
          </el-table>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="name" label="Name">
      <template #default="scope">
        <span :class="config.instanceDashboardName ? 'link' : ''">
          {{ scope.row.name }}
        </span>
      </template>
    </el-table-column>
    <el-table-column
      v-for="item in HeaderLabels"
      :key="item.value"
      :label="item.label"
      :prop="item.value"
      :width="item.width"
    />
  </el-table>
  <el-pagination
    class="mt-10"
    small
    background
    layout="prev, pager, next"
    :page-size="pageSize"
    :total="instances.length"
    @current-change="changePage"
    @prev-click="changePage"
    @next-click="changePage"
  />
</template>
<script lang="ts" setup>
  import { ref, computed, watch } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import { useContinousProfilingStore } from "@/store/modules/continous-profiling";
  import type { MonitorInstance, MonitorProcess } from "@/types/continous-profiling";
  import { HeaderLabels, HeaderChildLabels } from "../data";
  import { dateFormat } from "@/utils/dateFormat";

  /*global defineProps */
  defineProps({
    config: {
      type: Object as PropType<any>,
      default: () => ({}),
    },
  });
  const { t } = useI18n();
  const continousProfilingStore = useContinousProfilingStore();
  const pageSize = 10;
  const instances = computed(() => {
    return continousProfilingStore.instances
      .map((d: MonitorInstance) => {
        const processes = (d.processes || [])
          .sort((c: MonitorProcess, d: MonitorProcess) => d.lastTriggerTimestamp - c.lastTriggerTimestamp)
          .map((p: MonitorProcess) => {
            return {
              ...p,
              lastTriggerTime: d.lastTriggerTimestamp ? dateFormat(d.lastTriggerTimestamp) : "",
              labels: p.labels.join("; "),
            };
          });

        return { ...d, processes, lastTriggerTime: d.lastTriggerTimestamp ? dateFormat(d.lastTriggerTimestamp) : "" };
      })
      .sort((a: MonitorInstance, b: MonitorInstance) => b.lastTriggerTimestamp - a.lastTriggerTimestamp);
  });
  const currentInstances = ref<MonitorInstance[]>([]);

  async function changePage(pageIndex: number) {
    currentInstances.value = instances.value.filter((d: unknown, index: number) => {
      if (index >= (pageIndex - 1) * pageSize && index < pageIndex * pageSize) {
        return d;
      }
    });
  }

  watch(
    () => instances.value,
    () => {
      currentInstances.value = instances.value.filter((_: unknown, index: number) => index < pageSize);
    },
  );
</script>
<style lang="scss" scoped>
  .title {
    font-size: 12px;
    font-weight: bold;
  }

  .child {
    padding-left: 20px;
  }

  .header {
    font-size: 13px;
    font-weight: bold;
    border-bottom: 1px solid rgba(0, 0, 0, 0.07);
    padding: 10px 20px;
    background-color: #f3f4f9;
  }

  .settings {
    padding: 1px 0;
    border: 1px solid #666;
    border-radius: 3px;
    color: #666;
    cursor: pointer;
  }

  .link {
    cursor: pointer;
    color: #409eff;
    text-decoration: underline;
  }
</style>
