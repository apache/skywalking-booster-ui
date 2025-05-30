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
  <div class="cluster-nodes">
    <el-table
      :data="settingsStore.clusterNodes"
      class="mb-5"
      :row-style="{ backgroundColor: 'var(--layout-background)' }"
    >
      <el-table-column
        v-for="item in ClusterNodeRow"
        :prop="item.value"
        :label="item.label"
        :key="item.value"
        :width="item.width"
      />
    </el-table>
    <el-pagination
      class="pagination"
      layout="prev, pager, next"
      :page-size="pageSize"
      :total="settingsStore.clusterNodes.length"
      v-model="currentPage"
      @current-change="changePage"
      @prev-click="changePage"
      @next-click="changePage"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted } from "vue";
  import { useSettingsStore } from "@/store/modules/settings";
  import { ClusterNodeRow } from "../data";

  const settingsStore = useSettingsStore();
  const pageSize = 16;
  const currentPage = ref<number>(1);

  onMounted(() => {
    settingsStore.getClusterNodes();
  });

  const changePage = (pageIndex: number) => {
    currentPage.value = pageIndex;
  };
</script>
<style lang="scss" scoped>
  .cluster-nodes {
    font-size: 13px;
    width: 100%;
  }

  .label {
    width: 200px;
    display: inline-block;
    font-weight: 500;
    color: $font-color;
  }
</style>
