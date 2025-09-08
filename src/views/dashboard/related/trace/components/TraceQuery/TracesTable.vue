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
  <div class="trace-query-table flex-v">
    <el-table
      :data="traceStore.zipkinTraces"
      :border="false"
      :preserve-expanded-content="true"
      :default-sort="{ prop: 'duration', order: 'descending' }"
      style="width: 100%"
    >
      <el-table-column type="expand">
        <template #default="props">
          <div class="flex-h service-tags">
            <el-tag v-for="(value, key) in getEndpoints(props.row.spans)" :key="key" class="mr-10" type="primary">
              {{ value[0] }}: {{ value[1] }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Name" prop="label" />
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
              <div class="duration-value">{{ props.row.duration.toFixed(2) }}ms</div>
            </el-progress>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from "vue";
  import { dateFormat } from "@/utils/dateFormat";
  import { useTraceStore } from "@/store/modules/trace";
  import type { ZipkinTrace } from "@/types/trace";

  // Type for the transformed trace data
  interface TransformedZipkinTrace extends ZipkinTrace {
    label: string;
    duration: number;
  }

  const traceStore = useTraceStore();

  function getEndpoints(spans: ZipkinTrace[]) {
    const endpoints = new Map<string, number>();
    for (const d of spans) {
      endpoints.set(d.localEndpoint.serviceName, (endpoints.get(d.localEndpoint.serviceName) || 0) + 1);
    }
    return endpoints;
  }

  // Calculate max duration for progress bar scaling
  const maxDuration = computed(() => {
    if (!traceStore.zipkinTraces.length) return 1;
    const durations = traceStore.zipkinTraces.map((trace) => {
      // Handle both the original ZipkinTrace[][] structure and the transformed flat array
      if (Array.isArray(trace)) {
        return trace[0]?.duration || 0;
      }
      return (trace as TransformedZipkinTrace).duration || 0;
    });
    return Math.max(...durations);
  });

  // Calculate progress percentage for a given duration
  function getDurationProgress(duration: number): number {
    if (maxDuration.value === 0) return 0;
    return Math.round((duration / maxDuration.value) * 100);
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
</style>
