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
  <div class="flex-h result-header">
    <div style="align-items: center"> {{ filteredTraces.length }} Results </div>
    <div class="flex-h" style="align-items: center">
      <el-switch
        v-model="expandAll"
        size="large"
        active-text="Expand All"
        inactive-text="Collapse All"
        class="mr-20"
        @change="toggleAllExpansion"
      />
      <Selector
        placeholder="Service filters"
        @change="changeServiceFilters"
        :value="selectedServiceNames"
        :options="serviceNames"
        :multiple="true"
        style="width: 500px"
      />
    </div>
  </div>
  <div class="trace-query-table flex-v">
    <el-table
      ref="tableRef"
      :data="filteredTraces"
      :border="false"
      :preserve-expanded-content="true"
      :default-sort="{ prop: 'duration', order: 'descending' }"
      style="width: 100%"
    >
      <el-table-column type="expand">
        <template #default="props">
          <div class="flex-h service-tags">
            <el-tag
              v-for="(value, key) in getEndpoints(props.row.spans)"
              :key="key"
              class="mr-10 cp"
              disable-transitions
              :style="{ backgroundColor: getServiceColor(value[0]), color: 'white', border: 'none' }"
              @click="toggleServiceTags(value[0], props.row)"
            >
              {{ value[0] }}: {{ value[1] }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Root" prop="label" />
      <el-table-column label="Start Time" prop="timestamp" width="220">
        <template #default="props">
          {{ dateFormat(props.row.timestamp / 1000) }}
        </template>
      </el-table-column>
      <el-table-column label="Spans" prop="spans.length" width="100" />
      <el-table-column label="Duration (ms)" prop="duration" width="200" sortable>
        <template #default="props">
          <div class="duration-cell">
            <el-progress
              :percentage="getDurationProgress(props.row.duration)"
              :stroke-width="22"
              :text-inside="true"
              color="rgba(64, 158, 255, 0.4)"
            >
              <div class="duration-value">{{ props.row.duration }}ms</div>
            </el-progress>
          </div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Operations" width="120">
        <template #default="props">
          <el-button size="small" @click="(e: MouseEvent) => handleShowTrace(e, props.row)"> Show </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <!-- Trace Details Dialog -->
  <el-dialog
    v-model="dialogVisible"
    fullscreen
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    destroy-on-close
  >
    <TraceContent v-if="selectedTrace" :trace="selectedTrace" />
  </el-dialog>
</template>
<script lang="ts" setup>
  import { computed, ref, nextTick } from "vue";
  import { ElTable, ElDialog } from "element-plus";
  import { dateFormat } from "@/utils/dateFormat";
  import { useTraceStore } from "@/store/modules/trace";
  import type { ZipkinTrace } from "@/types/trace";
  import type { Option } from "@/types/app";
  import { getServiceColor } from "./color";
  import TraceContent from "./TraceContent.vue";

  const traceStore = useTraceStore();
  const expandAll = ref<boolean>(false);
  const tableRef = ref<InstanceType<typeof ElTable>>();
  const selectedServiceNames = ref<string[]>([]);
  const dialogVisible = ref<boolean>(false);
  const selectedTrace = ref<ZipkinTrace | null>(null);

  // Calculate max duration for progress bar scaling
  const maxDuration = computed(() => {
    if (!traceStore.zipkinTraces.length) return 1;
    const durations = traceStore.zipkinTraces.map((trace: ZipkinTrace) => trace.duration || 0);
    return Math.max(...durations);
  });

  // Filtered traces based on selected service names
  const filteredTraces = computed<ZipkinTrace[]>(() => {
    const rows = traceStore.zipkinTraces as ZipkinTrace[];
    if (!selectedServiceNames.value.length) return rows;
    const selected = new Set(selectedServiceNames.value);
    return rows.filter((row) => {
      const rowService = row?.localEndpoint?.serviceName;
      if (rowService && selected.has(rowService)) return true;
      for (const s of row.spans || []) {
        const name = s?.localEndpoint?.serviceName;
        if (name && selected.has(name)) return true;
      }
      return false;
    });
  });

  // Service names options for the header Selector
  const serviceNames = computed<Option[]>(() => {
    const names = new Set<string>();
    const rows = traceStore.zipkinTraces as ZipkinTrace[];
    for (const row of rows) {
      if (row?.localEndpoint?.serviceName) {
        names.add(row.localEndpoint.serviceName);
      }
      for (const s of row.spans || []) {
        if (s?.localEndpoint?.serviceName) {
          names.add(s.localEndpoint.serviceName);
        }
      }
    }
    return Array.from(names)
      .sort((a, b) => a.localeCompare(b))
      .map((n) => ({ label: n, value: n }));
  });

  function getEndpoints(spans: ZipkinTrace[]) {
    const endpoints = new Map<string, number>();
    for (const d of spans) {
      endpoints.set(d.localEndpoint.serviceName, (endpoints.get(d.localEndpoint.serviceName) || 0) + 1);
    }
    return endpoints;
  }

  function handleShowTrace(e: MouseEvent, row: ZipkinTrace) {
    selectedTrace.value = row;
    dialogVisible.value = true;
  }

  // Calculate progress percentage for a given duration
  function getDurationProgress(duration: number): number {
    if (maxDuration.value === 0) return 0;
    return Math.round((duration / maxDuration.value) * 100);
  }

  function toggleServiceTags(serviceName: string, row: ZipkinTrace) {
    // Toggle service selection
    selectedServiceNames.value = selectedServiceNames.value.includes(serviceName)
      ? selectedServiceNames.value.filter((name) => name !== serviceName)
      : [...selectedServiceNames.value, serviceName];

    // Expand the row to show the service tags
    nextTick(() => {
      if (tableRef.value) {
        tableRef.value.toggleRowExpansion(row, true);
      }
    });
  }

  function changeServiceFilters(selected: Option[]) {
    selectedServiceNames.value = selected.map((o) => String(o.value));
  }

  // Toggle all table row expansions
  function toggleAllExpansion() {
    nextTick(() => {
      if (tableRef.value) {
        const rows = filteredTraces.value;
        if (expandAll.value) {
          // Expand all rows
          for (const row of rows) {
            tableRef.value.toggleRowExpansion(row, true);
          }
        } else {
          // Collapse all rows
          for (const row of rows) {
            tableRef.value.toggleRowExpansion(row, false);
          }
        }
      }
    });
  }
</script>
<style lang="scss" scoped>
  .trace-query-table {
    width: 100%;
    font-size: $font-size-smaller;
    overflow: auto;
  }

  .service-tags {
    width: 100%;
    padding-left: 60px;
  }

  .duration-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px 0;
  }

  .duration-value {
    font-size: $font-size-smaller;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .result-header {
    justify-content: space-between;
    padding: 20px 10px;
    font-size: 14px;
  }
</style>
