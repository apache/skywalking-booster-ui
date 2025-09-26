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
  <div class="trace-query-filter">
    <TraceListFilter />
    <div class="filter-row flex-h mt-10">
      <div class="grey mr-10 label">{{ t("limit") }}</div>
      <el-input-number size="small" v-model="limit" :min="10" @change="changeLimit" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, onUnmounted, onMounted, PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import { useTraceStore, PageSize } from "@/store/modules/trace";
  import type { LayoutConfig } from "@/types/dashboard";
  import TraceListFilter from "@/views/dashboard/related/trace/components/TraceList/Filter.vue";

  defineProps({
    needQuery: { type: Boolean, default: true },
    data: {
      type: Object as PropType<LayoutConfig>,
      default: () => ({}),
    },
  });
  const { t } = useI18n();
  const traceStore = useTraceStore();
  const limit = ref(PageSize);
  onMounted(() => {
    traceStore.setTraceList([]);
    traceStore.setTraceCondition({
      paging: { pageNum: 1, pageSize: PageSize },
    });
  });

  function changeLimit(val: number | undefined) {
    if (!val) return;
    traceStore.setTraceCondition({
      paging: { pageNum: 1, pageSize: val },
    });
  }

  onUnmounted(() => {
    traceStore.resetState();
  });
</script>
<style lang="scss" scoped>
  .trace-query-filter {
    justify-content: space-between;
    padding: 10px 0 10px 10px;
    border-bottom: 1px solid $border-color;
  }

  .label {
    height: 28px;
    line-height: 28px;
  }
</style>
