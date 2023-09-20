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
  <div class="filters">
    <div class="mb-10 flex-h">
      <Selector
        :value="selectedLabels"
        :options="labels"
        size="small"
        placeholder="Please select labels"
        @change="changeLabels"
        class="inputs mr-10"
        :multiple="true"
      />
      <div class="mr-5 duration" v-if="duration.length">
        <span>{{ duration[0] }}</span>
        <span> ~ </span>
        <span>{{ duration[1] }}</span>
      </div>
    </div>
    <div class="flex-h">
      <Selector
        v-if="ebpfStore.selectedTask.targetType === 'OFF_CPU'"
        :value="aggregateType"
        :options="AggregateTypes"
        size="small"
        placeholder="Please select a type"
        @change="changeAggregateType"
        class="selector mr-10"
      />
      <el-popover placement="bottom" :width="680" trigger="click" :persistent="false">
        <template #reference>
          <el-button size="small">
            {{ t("processSelect") }}
          </el-button>
        </template>
        <el-input
          v-model="searchText"
          placeholder="Please input name"
          class="input-with-search"
          size="small"
          @change="searchProcesses(0)"
        >
          <template #append>
            <el-button size="small">
              <Icon size="sm" iconName="search" />
            </el-button>
          </template>
        </el-input>
        <el-table :data="currentProcesses" ref="multipleTableRef" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column
            v-for="(h, index) of TableHeader"
            :property="h.property"
            :label="h.label"
            :key="index"
            width="150"
          />
          <el-table-column width="300" label="Attributes">
            <template #default="scope">
              {{ attributes(scope.row.attributes) }}
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pagination"
          small
          layout="prev, pager, next"
          :page-size="pageSize"
          :total="processes.length"
          @current-change="changePage"
          @prev-click="changePage"
          @next-click="changePage"
        />
      </el-popover>
      <el-button type="primary" size="small" @click="analyzeEBPF">
        {{ t("analyze") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import type { Option } from "@/types/app";
  import { TableHeader, AggregateTypes } from "./data";
  import { useEbpfStore } from "@/store/modules/ebpf";
  import { useContinousProfilingStore } from "@/store/modules/continous-profiling";
  import type { EBPFProfilingSchedule, Process } from "@/types/ebpf";
  import { ElMessage, ElTable } from "element-plus";
  import { dateFormat } from "@/utils/dateFormat";
  import { ComponentType } from "@/views/dashboard/related/continuous-profiling/data";

  const { t } = useI18n();
  /*global defineProps*/
  const props = defineProps({
    type: {
      type: String,
      default: "",
    },
  });
  const ebpfStore = props.type === ComponentType ? useContinousProfilingStore() : useEbpfStore();
  const pageSize = 5;
  const multipleTableRef = ref<InstanceType<typeof ElTable>>();
  const selectedProcesses = ref<string[]>([]);
  const labels = ref<Option[]>([{ label: "All", value: "0" }]);
  const processes = ref<Process[]>([]);
  const currentProcesses = ref<Process[]>([]);
  const selectedLabels = ref<string[]>(["0"]);
  const searchText = ref<string>("");
  const aggregateType = ref<string>(AggregateTypes[0].value);
  const duration = ref<string[]>([]);
  const attributes = (attr: { name: string; value: string }[]) => {
    return attr.map((d: { name: string; value: string }) => `${d.name}=${d.value}`).join("; ");
  };

  function changeLabels(opt: any[]) {
    const arr = opt.map((d) => d.value);
    selectedLabels.value = arr;
  }

  function changeAggregateType(opt: any[]) {
    aggregateType.value = opt[0].value;
    ebpfStore.setAnalyzeTrees([]);
  }

  const handleSelectionChange = (arr: Process[]) => {
    selectedProcesses.value = arr.map((d: Process) => d.id);
  };

  async function analyzeEBPF() {
    let arr: string[] = selectedLabels.value;
    if (selectedLabels.value.includes("0")) {
      arr = labels.value.map((d: Option) => d.value);
    }
    const ranges: { start: number; end: number }[] = [];
    const scheduleIdList = ebpfStore.eBPFSchedules.flatMap((d: EBPFProfilingSchedule) => {
      const l = d.process.labels.find((d: string) => arr.includes(d));
      const i = selectedProcesses.value.includes(d.process.id);
      if (l || i) {
        ranges.push({
          start: d.startTime,
          end: d.endTime,
        });
        return d.scheduleId;
      }
    });
    let timeRanges: { start: number; end: number }[] = [];
    for (const r of ranges) {
      if (timeRanges.length) {
        for (const t of timeRanges) {
          if (r.start > t.start && r.start < t.end) {
            if (r.end > t.end) {
              t.end = r.end;
            }
          }
        }
      } else {
        timeRanges.push(r);
      }
    }
    const res = await ebpfStore.getEBPFAnalyze({
      scheduleIdList,
      timeRanges,
      aggregateType: aggregateType.value,
    });
    if (res.data && res.data.errors) {
      ElMessage.error(res.data.errors);
      return;
    }
  }

  function getSchedules() {
    labels.value = [{ label: "All", value: "0" }];
    selectedLabels.value = ["0"];
    processes.value = [];
    const ranges = ebpfStore.eBPFSchedules.map((d: EBPFProfilingSchedule) => {
      for (const l of d.process.labels) {
        labels.value.push({ label: l, value: l });
      }
      processes.value.push(d.process);
      return [d.startTime / 10000, d.endTime / 10000];
    });
    if (ranges.length) {
      const arr = ranges.flat(1);
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      duration.value = [dateFormat(min * 10000), dateFormat(max * 10000)];
    } else {
      duration.value = [];
    }
    searchProcesses(0);
    analyzeEBPF();
  }

  function changePage(pageIndex: number) {
    searchProcesses(pageIndex);
  }

  function searchProcesses(pageIndex: number) {
    const arr = processes.value.filter(
      (d: { name: string; instanceName: string; attributes: { name: string; value: string }[] }) =>
        d.name.includes(searchText.value) ||
        d.instanceName.includes(searchText.value) ||
        searchAttribute(d.attributes, searchText.value),
    );
    currentProcesses.value = arr.filter(
      (d, index: number) => (pageIndex - 1 || 0) * pageSize <= index && pageSize * (pageIndex || 1) > index,
    );
  }

  function searchAttribute(attributes: { name: string; value: string }[], text: string) {
    const item = attributes.find((d: { name: string; value: string }) => d.name === "command_line");

    if (!item) {
      return false;
    }
    return item.value.includes(text);
  }

  watch(
    () => ebpfStore.eBPFSchedules,
    () => {
      getSchedules();
    },
  );
</script>
<style lang="scss" scoped>
  .filters {
    margin: 5px 0;
    width: 100%;
    min-width: 560px;
  }

  .inputs {
    width: 400px;
  }

  .input-with-search {
    width: 650px;
    margin-bottom: 5px;
  }

  .pagination {
    margin-top: 10px;
  }

  .selector {
    width: 120px;
  }

  .duration {
    line-height: 30px;
  }
</style>
