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
            <el-tag v-for="(value, key) in getEndpoints(props.row.spans)" :key="key" class="mr-10">
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
      <el-table-column label="Duration (ms)" prop="duration" width="200" sortable />
    </el-table>
  </div>
</template>
<script lang="ts" setup>
  import { dateFormat } from "@/utils/dateFormat";
  import { useTraceStore } from "@/store/modules/trace";
  import type { ZipkinTrace } from "@/types/trace";

  const traceStore = useTraceStore();

  function getEndpoints(spans: ZipkinTrace[]) {
    const endpoints = new Map<string, number>();
    for (const d of spans) {
      endpoints.set(d.localEndpoint.serviceName, (endpoints.get(d.localEndpoint.serviceName) || 0) + 1);
    }
    return endpoints;
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
</style>
