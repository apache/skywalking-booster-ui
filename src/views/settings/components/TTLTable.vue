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
  <el-table
    :data="data"
    class="mb-5"
    :row-style="{ backgroundColor: 'var(--layout-background)' }"
    :cell-style="(data: Indexable) => (data.columnIndex === 0 ? { backgroundColor: 'var(--el-table-header-bg-color)' } : {})"
  >
    <el-table-column
      v-for="item in metricsRows"
      :prop="item.value"
      :label="item.label"
      :key="item.value"
      :width="item.width"
    >
      <template #default="scope">
        {{ scope.row && scope.row[item.value] ? (scope.row[item.value] < 0 ? "N/A" : scope.row[item.value]) : "N/A" }}
      </template>
    </el-table-column>
  </el-table>
</template>
<script lang="ts" setup>
  /*global PropType, Indexable */
  defineProps({
    metricsRows: {
      type: Array as PropType<{ width?: number; value: string; label: string }[]>,
      default: () => [],
    },
    data: { type: Array as PropType<Indexable[]>, default: () => [] },
  });
</script>
