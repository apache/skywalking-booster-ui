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
  <div class="profile-detail-chart-table">
    <Container :tableData="tableData" :highlightTop="highlightTop">
      <div class="profile-tips" v-if="!tableData.length">{{ t("noData") }}</div>
    </Container>
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
  import { ref, onMounted, watch } from "vue";
  import type { PropType } from "vue";
  import Container from "./Container.vue";

  const { t } = useI18n();
  /* global defineProps */
  const props = defineProps({
    data: { type: Array as PropType<any>, default: () => [] },
    highlightTop: { type: Boolean, default: false },
  });
  const tableData = ref<any>([]);

  onMounted(() => {
    tableData.value = processTree();
  });
  function processTree() {
    if (!props.data.length) {
      return [];
    }

    const durationChildExcluded = props.data
      .map((d: any) => {
        return d.elements.map((item: any) => item.durationChildExcluded);
      })
      .flat(1);
    function compare(val: number, val1: number) {
      return val1 - val;
    }
    const topDur = durationChildExcluded.sort(compare).filter((item: any, index: number) => index < 10 && item !== 0);
    const trees = [];

    for (const item of props.data) {
      const newArr = sortArr(item.elements, topDur);
      trees.push(...newArr);
    }

    return trees;
  }

  function sortArr(arr: any[], topDur: any) {
    const copyArr = JSON.parse(JSON.stringify(arr));
    const obj: any = {};
    const res = [];
    for (const item of copyArr) {
      obj[item.id] = item;
    }
    for (const item of copyArr) {
      item.topDur = topDur.includes(item.durationChildExcluded) && props.highlightTop;
      if (item.parentId === "0") {
        res.push(item);
      }
      for (const key in obj) {
        if (item.id === obj[key].parentId) {
          if (item.children) {
            item.children.push(obj[key]);
          } else {
            item.children = [obj[key]];
          }
        }
      }
    }

    return res;
  }

  watch(
    () => [props.data, props.highlightTop],
    () => {
      if (!props.data.length) {
        tableData.value = [];
        return;
      }
      tableData.value = processTree();
    },
  );
</script>
<style lang="scss" scoped>
  .profile-detail-chart-table {
    height: 100%;
    overflow: auto;
  }
</style>
