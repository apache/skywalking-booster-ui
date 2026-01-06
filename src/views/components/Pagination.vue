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
  <div class="pagination-container">
    <el-pagination
      v-model:current-page="currentPageModel"
      :page-size="displayPageSize"
      size="small"
      layout="prev, pager, next"
      :total="computedTotal"
      :pager-count="pagerCount"
      @current-change="handlePageChange"
      :style="paginationStyle"
    />
  </div>
</template>
<script lang="ts" setup>
  import { computed } from "vue";

  /*global defineProps, defineEmits*/
  const props = defineProps({
    currentPage: {
      type: Number,
      default: 1,
    },
    pageSize: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    pagerCount: {
      type: Number,
      default: 5,
    },
    align: {
      type: String as () => "left" | "center" | "right",
      default: "right",
    },
  });

  const emits = defineEmits<{
    (e: "update:currentPage", page: number): void;
    (e: "change", page: number): void;
  }>();

  // The display page size is pageSize - 1 because we fetch pageSize items
  // but the last item is only used to check if there are more pages
  const displayPageSize = computed(() => props.pageSize - 1);

  // Calculate total for pagination display based on fetched items
  // If we fetched pageSize items, there might be more pages
  const computedTotal = computed(() => {
    if (props.total >= props.pageSize) {
      return displayPageSize.value * props.currentPage + 1;
    }
    return displayPageSize.value * props.currentPage;
  });

  const currentPageModel = computed({
    get: () => props.currentPage,
    set: (val: number) => emits("update:currentPage", val),
  });

  const paginationStyle = computed(() => {
    const alignMap = {
      left: "flex-start",
      center: "center",
      right: "flex-end",
    };
    return {
      display: "flex",
      justifyContent: alignMap[props.align],
    };
  });

  function handlePageChange(page: number) {
    emits("update:currentPage", page);
    emits("change", page);
  }
</script>
<style lang="scss" scoped>
  .pagination-container {
    margin: 5px 0;
  }
</style>
