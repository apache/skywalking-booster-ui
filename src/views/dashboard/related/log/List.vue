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
  <div>
    <LogTable v-loading="logStore.loadLogs" :tableData="logStore.logs || []" :type="type" :noLink="false">
      <div class="log-tips" v-if="!logStore.logs.length">{{ t("noData") }}</div>
    </LogTable>
    <div class="mt-5 mb-5">
      <el-pagination
        v-model="logStore.conditions.paging.pageNum"
        :page-size="pageSize"
        :small="true"
        layout="prev, pager, next"
        :pager-count="5"
        :total="total"
        @current-change="updatePage"
        :style="`float: right`"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import LogTable from "./LogTable/Index.vue";
  import { useLogStore } from "@/store/modules/log";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { ElMessage } from "element-plus";

  const { t } = useI18n();
  const logStore = useLogStore();
  const dashboardStore = useDashboardStore();
  const type = ref<string>(dashboardStore.layerId === "BROWSER" ? "browser" : "service");
  const pageSize = ref<number>(15);
  const total = computed(() =>
    logStore.logs.length === pageSize.value
      ? pageSize.value * logStore.conditions.paging.pageNum + 1
      : pageSize.value * logStore.conditions.paging.pageNum,
  );
  function updatePage(p: number) {
    logStore.setLogCondition({
      paging: { pageNum: p, pageSize: pageSize.value },
    });
    queryLogs();
  }
  async function queryLogs() {
    const res = await logStore.getLogs();
    if (res && res.errors) {
      ElMessage.error(res.errors);
    }
  }
</script>
<style lang="scss" scoped>
  .log-tips {
    width: 100%;
    text-align: center;
    margin: 50px 0;
  }
</style>
