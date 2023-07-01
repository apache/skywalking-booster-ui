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
  <div class="trace-statistics">
    <div class="trace-t-loading" v-show="loading">
      <Icon iconName="spinner" size="sm" />
    </div>
    <TableContainer :tableData="tableData" type="statistics" :HeaderType="HeaderType">
      <div class="trace-tips" v-if="!tableData.length">{{ $t("noData") }}</div>
    </TableContainer>
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch, onMounted } from "vue";
  import type { PropType } from "vue";
  import TableContainer from "./Table/TableContainer.vue";
  import traceTable from "../utils/trace-table";
  import type { StatisticsSpan, Span, StatisticsGroupRef } from "@/types/trace";

  /* global defineProps, defineEmits, Recordable*/
  const props = defineProps({
    data: { type: Array as PropType<Span[]>, default: () => [] },
    traceId: { type: String, default: "" },
    showBtnDetail: { type: Boolean, default: false },
    HeaderType: { type: String, default: "" },
  });
  const emit = defineEmits(["load"]);
  const loading = ref<boolean>(true);
  const tableData = ref<Recordable>([]);
  const list = ref<any[]>([]);

  onMounted(() => {
    tableData.value = calculationDataforStatistics(props.data);
    loading.value = false;
    emit("load", () => {
      loading.value = true;
    });
  });

  function calculationDataforStatistics(data: Span[]): StatisticsSpan[] {
    list.value = traceTable.buildTraceDataList(data);
    const result: StatisticsSpan[] = [];
    const map = traceTable.changeStatisticsTree(data);
    map.forEach((nodes, nodeKey) => {
      const nodeKeyData = nodeKey.split(":");
      result.push(
        getSpanGroupData(nodes, {
          endpointName: nodeKeyData[0],
          type: nodeKeyData[1],
        }),
      );
    });
    return result;
  }

  function getSpanGroupData(groupspans: Span[], groupRef: StatisticsGroupRef): StatisticsSpan {
    let maxTime = 0;
    let minTime = Infinity;
    let sumTime = 0;
    const count = groupspans.length;
    groupspans.forEach((groupspan: Span) => {
      const duration = groupspan.dur || 0;
      if (duration > maxTime) {
        maxTime = duration;
      }
      if (duration < minTime) {
        minTime = duration;
      }
      sumTime = sumTime + duration;
    });
    const avgTime = count === 0 ? 0 : sumTime / count;
    return {
      groupRef,
      maxTime,
      minTime,
      sumTime,
      avgTime,
      count,
    };
  }

  watch(
    () => props.data,
    () => {
      if (!props.data.length) {
        tableData.value = [];
        return;
      }
      tableData.value = calculationDataforStatistics(props.data);
      loading.value = false;
    },
  );
</script>
<style lang="scss" scoped>
  .trace-tips {
    width: 100%;
    text-align: center;
    margin-top: 10px;
  }

  .trace-statistics {
    padding: 10px;
    height: calc(100% - 95px);
    width: 100%;
  }
</style>
