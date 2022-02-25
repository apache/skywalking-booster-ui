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
  <div class="trace-detail-chart-table">
    <div class="rk-trace-t-loading" v-show="loading">
      <Icon iconName="spinner" size="sm" />
    </div>
    <TableContainer :tableData="tableData" :type="HeaderType">
      <div class="trace-tips" v-if="!tableData.length">{{ $t("noData") }}</div>
    </TableContainer>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";
import type { PropType } from "vue";
import copy from "@/utils/copy";
import TableContainer from "./TableContainer.vue";
import traceTable from "../../utils/trace-table";

/* global defineProps, defineEmits */
const props = defineProps({
  data: { type: Array as PropType<any>, default: () => [] },
  traceId: { type: String, default: "" },
  showBtnDetail: { type: Boolean, default: false },
  HeaderType: { type: String, default: "" },
});
const emit = defineEmits(["select", "view", "load"]);
const loading = ref<boolean>(true);
const tableData = ref<any>([]);
const showDetail = ref<boolean>(false);
const currentSpan = ref<any[]>([]);

onMounted(() => {
  tableData.value = formatData(
    traceTable.changeTree(props.data, props.traceId)
  );
  loading.value = false;
  emit("select", handleSelectSpan);
  emit("view", handleViewSpan);
  emit("load", () => {
    loading.value = true;
  });
});

function formatData(arr: any[], level = 1, totalExec?: number) {
  for (const item of arr) {
    item.level = level;
    totalExec = totalExec || item.endTime - item.startTime;
    item.totalExec = totalExec;
    if (item.children && item.children.length > 0) {
      formatData(item.children, level + 1, totalExec);
    }
  }
  return arr;
}

function handleSelectSpan(data: any[]) {
  currentSpan.value = data;
  if (!props.showBtnDetail) {
    showDetail.value = true;
  }
  emit("select", data);
}

function showCurrentSpanDetail(title: string, text: string) {
  const textLineNumber = text.split("\n").length;
  let textHeight = textLineNumber * 20.2 + 10;
  const tmpHeight = window.innerHeight * 0.9;
  textHeight = textHeight >= tmpHeight ? tmpHeight : textHeight;
  // this.$modal.show('dialog', {
  //   title,
  //   text: `<div style="height:${textHeight}px">${text}</div>`,
  //   buttons: [
  //     {
  //       title: 'Copy',
  //       handler: () => {
  //         this.copy(text);
  //       },
  //     },
  //     {
  //       title: 'Close',
  //     },
  //   ],
  // });
}
function handleViewSpan() {
  showDetail.value = true;
}

watch(
  () => props.data,
  () => {
    if (!props.data.length) {
      tableData.value = [];
      return;
    }
    tableData.value = formatData(
      traceTable.changeTree(props.data, props.traceId)
    );
    loading.value = false;
  }
);
</script>
<style lang="scss" scoped>
.dialog-c-text {
  white-space: pre;
  overflow: auto;
  font-family: monospace;
}

.trace-tips {
  width: 100%;
  text-align: center;
  margin-top: 10px;
}
</style>
