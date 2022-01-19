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
  <div class="table">
    <el-table
      v-loading="chartLoading"
      :data="endpoints"
      style="width: 100%; height: 100%; overflow: auto"
    >
      <el-table-column label="Endpoints">
        <template #default="scope">
          <router-link
            target="_blank"
            class="link"
            :to="`/dashboard/${scope.row.layer}/endpoint/${selectorStore.currentService}/${scope.row.value}/${config.dashboardName}`"
            :style="{ fontSize: `${config.fontSize}px` }"
          >
            {{ scope.row.label }}
          </router-link>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="pagination"
      background
      layout="prev, pager, next"
      :page-size="6"
      :total="selectorStore.endpoints.length"
      @current-change="changePage"
      @prev-click="changePage"
      @next-click="changePage"
    />
  </div>
</template>
<script setup lang="ts">
import { defineProps, onBeforeMount, ref } from "vue";
import { useSelectorStore } from "@/store/modules/selectors";
import { ElMessage } from "element-plus";
import type { PropType } from "vue";
import { EndpointListConfig } from "@/types/dashboard";

defineProps({
  data: {
    type: Object,
  },
  config: {
    type: Object as PropType<EndpointListConfig>,
    default: () => ({ dashboardName: "", fontSize: 12 }),
  },
});
const selectorStore = useSelectorStore();
const chartLoading = ref<boolean>(false);
const endpoints = ref<{ label: string; value: string }[]>([]);
const pageSize = 7;

onBeforeMount(async () => {
  chartLoading.value = true;
  const resp = await selectorStore.getEndpoints();

  chartLoading.value = false;
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  endpoints.value = selectorStore.endpoints.splice(0, pageSize);
});
function changePage(pageIndex: number) {
  endpoints.value = selectorStore.endpoints.splice(pageIndex - 1, pageSize);
}
</script>
<style lang="scss" scoped>
.table {
  height: 100%;
}

.pagination {
  width: 100%;
  text-align: center;
  height: 30px;
  padding: 3px 0;
}

.link {
  cursor: pointer;
  color: #409eff;
  display: inline-block;
  width: 100%;
}
</style>
