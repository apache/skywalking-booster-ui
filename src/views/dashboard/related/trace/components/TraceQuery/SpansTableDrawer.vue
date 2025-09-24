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
  <el-drawer
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    size="70%"
    :before-close="handleClose"
    direction="rtl"
  >
    <div class="flex-v" style="height: 100%">
      <el-table
        :data="spans"
        :border="true"
        :stripe="true"
        :default-sort="{ prop: 'timestamp', order: 'ascending' }"
        style="width: 100%"
        max-height="calc(100vh - 200px)"
      >
        <el-table-column label="Span ID" prop="id">
          <template #default="props">
            <el-link type="primary" @click="emit('viewSpan', props.row)">{{ props.row.endpointName }}</el-link>
          </template>
        </el-table-column>

        <el-table-column label="Service Name" prop="localEndpoint.serviceName" />
        <el-table-column label="Span Name" prop="name" />

        <el-table-column label="Start Time" prop="timestamp" width="180">
          <template #default="props">
            {{ dateFormat(props.row.timestamp / 1000) }}
          </template>
        </el-table-column>

        <el-table-column label="Duration (ms)" prop="duration" width="120" />
      </el-table>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
  import { ElDrawer, ElTable, ElTableColumn } from "element-plus";
  import { dateFormat } from "@/utils/dateFormat";
  import type { Span } from "@/types/trace";

  interface Props {
    visible: boolean;
    spans: Span[];
    traceId: string;
  }

  interface Emits {
    (e: "update:visible", value: boolean): void;
    (e: "viewSpan", span: Span): void;
  }

  defineProps<Props>();
  const emit = defineEmits<Emits>();

  function handleClose() {
    emit("update:visible", false);
  }
</script>

<style lang="scss" scoped>
  :deep(.el-table) {
    .el-table__header {
      th {
        background-color: var(--el-fill-color-light);
        font-weight: 600;
      }
    }
  }
</style>
