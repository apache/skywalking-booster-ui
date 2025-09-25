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
    <div style="align-items: center"> {{ filteredTraces.length }} of {{ totalTraces }} Results </div>
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
  <div class="trace-query-table scroll_bar_style">
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
          {{ dateFormat(props.row.start) }}
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
              <div class="duration-value">{{ props.row.duration || 0 }}ms</div>
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

    <!-- Loading indicator -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>Loading more traces...</span>
    </div>

    <!-- Load more button (fallback) -->
    <div v-else-if="hasMoreItems" class="load-more-container">
      <el-button @click="loadMoreItems" :loading="loading">
        Load More ({{ totalTraces - filteredTraces.length }} remaining)
      </el-button>
    </div>
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
  import { computed, ref, nextTick, watch, onMounted, onUnmounted } from "vue";
  import { ElTable, ElDialog, ElIcon } from "element-plus";
  import { Loading } from "@element-plus/icons-vue";
  import { dateFormat } from "@/utils/dateFormat";
  import { useTraceStore } from "@/store/modules/trace";
  import type { Trace } from "@/types/trace";
  import type { Option } from "@/types/app";
  import { getServiceColor } from "@/utils/color";
  import TraceContent from "./TraceContent.vue";

  const PageSize = 10;
  const traceStore = useTraceStore();
  const expandAll = ref<boolean>(false);
  const tableRef = ref<InstanceType<typeof ElTable>>();
  const selectedServiceNames = ref<string[]>([]);
  const dialogVisible = ref<boolean>(false);
  const selectedTrace = ref<Trace | null>(null);
  // Infinite scroll state
  const loadedItemsCount = ref<number>(PageSize);
  const loading = ref<boolean>(false);
  const loadMoreThreshold = 100; // pixels from bottom to trigger load

  // Calculate max duration for progress bar scaling
  const maxDuration = computed(() => {
    if (!traceStore.traceList.length) return 1;
    const durations = traceStore.traceList.map((trace: Trace) => trace.duration || 0);
    return Math.max(...durations);
  });

  // All filtered traces based on selected service names
  const allFilteredTraces = computed<Trace[]>(() => {
    const rows = traceStore.traceList as Trace[];
    if (!selectedServiceNames.value.length) return rows;
    const selected = new Set(selectedServiceNames.value);
    return rows.filter((row) => {
      const rowService = row?.serviceCode;
      if (rowService && selected.has(rowService)) return true;
      for (const s of row.spans || []) {
        const name = s?.serviceCode;
        if (name && selected.has(name)) return true;
      }
      return false;
    });
  });

  const filteredTraces = computed<Trace[]>(() => {
    return allFilteredTraces.value.slice(0, loadedItemsCount.value);
  });

  const totalTraces = computed<number>(() => allFilteredTraces.value.length);

  const hasMoreItems = computed<boolean>(() => {
    return loadedItemsCount.value < allFilteredTraces.value.length;
  });

  // Service names options for the header Selector
  const serviceNames = computed<Option[]>(() => {
    const names = new Set<string>();
    const rows = traceStore.traceList as Trace[];
    for (const row of rows) {
      if (row?.serviceCode) {
        names.add(row.serviceCode);
      }
      for (const s of row.spans || []) {
        if (s?.serviceCode) {
          names.add(s.serviceCode);
        }
      }
    }
    return Array.from(names)
      .sort((a, b) => a.localeCompare(b))
      .map((n) => ({ label: n, value: n }));
  });

  function getEndpoints(spans: Trace[]) {
    const endpoints = new Map<string, number>();
    for (const d of spans) {
      endpoints.set(d.serviceCode, (endpoints.get(d.serviceCode) || 0) + 1);
    }
    return endpoints;
  }

  function handleShowTrace(e: MouseEvent, row: Trace) {
    selectedTrace.value = row;
    dialogVisible.value = true;
  }

  function getDurationProgress(duration: number): number {
    if (maxDuration.value === 0) return 0;
    return Math.round((duration / maxDuration.value) * 100);
  }

  function toggleServiceTags(serviceName: string, row: Trace) {
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

  // Infinite scroll handlers
  function loadMoreItems() {
    if (loading.value || !hasMoreItems.value) return;

    loading.value = true;

    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextBatch = Math.min(PageSize, allFilteredTraces.value.length - loadedItemsCount.value);
      loadedItemsCount.value += nextBatch;
      loading.value = false;
    }, 300);
  }

  function handleScroll(event: Event) {
    const target = event.target as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = target;

    // Check if user is near the bottom
    if (scrollHeight - scrollTop - clientHeight < loadMoreThreshold && hasMoreItems.value && !loading.value) {
      loadMoreItems();
    }
  }

  // Reset loaded items when filters change
  watch(selectedServiceNames, () => {
    loadedItemsCount.value = PageSize;
  });

  // Setup scroll listener
  onMounted(() => {
    const tableContainer = document.querySelector(".trace-query-table");
    if (tableContainer) {
      tableContainer.addEventListener("scroll", handleScroll);
    }
  });

  onUnmounted(() => {
    const tableContainer = document.querySelector(".trace-query-table");
    if (tableContainer) {
      tableContainer.removeEventListener("scroll", handleScroll);
    }
  });

  // Toggle all table row expansions (only for loaded items)
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
    height: calc(100% - 100px);
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

  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px 0;
    color: var(--el-text-color-secondary);
    font-size: $font-size-smaller;
  }

  .load-more-container {
    display: flex;
    justify-content: center;
    padding: 20px 0;
    border-top: 1px solid var(--el-border-color-light);
    margin-top: 10px;
  }
</style>
