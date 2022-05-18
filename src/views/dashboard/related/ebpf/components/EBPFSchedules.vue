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
    <Selector
      :value="selectedLabels"
      :options="labels"
      size="small"
      placeholder="Please select labels"
      @change="changeLabels"
      class="inputs mr-10"
      :multiple="true"
    />
    <el-popover placement="bottom" :width="680" trigger="click">
      <template #reference>
        <el-button type="primary" size="small">
          {{ t("processSelect") }}
        </el-button>
      </template>
      <el-input
        v-model="searchText"
        placeholder="Please input name"
        class="input-with-search"
        size="small"
        @change="searchProcesses"
      >
        <template #append>
          <el-button size="small">
            <Icon size="sm" iconName="search" />
          </el-button>
        </template>
      </el-input>
      <el-table
        :data="currentProcesses"
        ref="multipleTableRef"
        @selection-change="handleSelectionChange"
      >
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
            {{ scope.row.attributes.map((d: {name: string, value: string}) => `${d.name}=${d.value}`).join("; ") }}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        background
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
  <div ref="timeline" class="schedules"></div>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import dayjs from "dayjs";
import { useI18n } from "vue-i18n";
import { Option } from "@/types/app";
import { TableHeader } from "./data";
import { useEbpfStore } from "@/store/modules/ebpf";
import { EBPFProfilingSchedule, Process } from "@/types/ebpf";
import { DataSet, Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.css";
import { ElMessage, ElTable } from "element-plus";

const { t } = useI18n();
const ebpfStore = useEbpfStore();
const pageSize = 5;
/*global Nullable */
const multipleTableRef = ref<InstanceType<typeof ElTable>>();
const selectedProcesses = ref<string[]>([]);
const timeline = ref<Nullable<HTMLDivElement>>(null);
const visGraph = ref<Nullable<any>>(null);
const labels = ref<Option[]>([{ label: "All", value: "0" }]);
const processes = ref<Process[]>([]);
const currentProcesses = ref<Process[]>([]);
const selectedLabels = ref<string[]>(["0"]);
const searchText = ref<string>("");
const dateFormat = (date: number, pattern = "YYYY-MM-DD HH:mm:ss") =>
  new Date(dayjs(date).format(pattern));

function changeLabels(opt: any[]) {
  const arr = opt.map((d) => d.value);
  selectedLabels.value = arr;
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
  const scheduleIdList = ebpfStore.eBPFSchedules.flatMap(
    (d: EBPFProfilingSchedule) => {
      const l = d.process.labels.find((d: string) => arr.includes(d));
      const i = selectedProcesses.value.includes(d.process.id);
      if (l || i) {
        ranges.push({
          start: d.startTime,
          end: d.endTime,
        });
        return d.scheduleId;
      }
    }
  );
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
  });
  if (res.data.errors) {
    ElMessage.error(res.data.errors);
    return;
  }
}

function visTimeline() {
  if (visGraph.value) {
    visGraph.value.destroy();
  }
  labels.value = [{ label: "All", value: "0" }];
  selectedLabels.value = ["0"];
  processes.value = [];
  const schedules = ebpfStore.eBPFSchedules.map(
    (d: EBPFProfilingSchedule, index: number) => {
      for (const l of d.process.labels) {
        labels.value.push({ label: l, value: l });
      }
      processes.value.push(d.process);
      return {
        id: index + 1,
        content: d.process.name,
        start: dateFormat(d.startTime),
        end: dateFormat(d.endTime),
      };
    }
  );
  searchProcesses();
  if (!timeline.value) {
    return;
  }
  const h = timeline.value.getBoundingClientRect().height;
  const items: any = new DataSet(schedules);
  const options = {
    height: h,
    width: "100%",
    locale: "en",
  };
  visGraph.value = new Timeline(timeline.value, items, options);
}

function changePage(pageIndex: number) {
  searchProcesses(pageIndex);
}

function searchProcesses(pageIndex?: any) {
  const arr = processes.value.filter(
    (d: { name: string; instanceName: string }) =>
      d.name.includes(searchText.value) ||
      d.instanceName.includes(searchText.value)
  );
  currentProcesses.value = arr.splice(
    (pageIndex - 1 || 0) * pageSize,
    pageSize * (pageIndex || 1)
  );
}

watch(
  () => ebpfStore.eBPFSchedules,
  () => {
    visTimeline();
  }
);
</script>
<style lang="scss" scoped>
.filters {
  margin: 5px 0;
}

.schedules {
  width: calc(100% - 5px);
  margin: 0 5px 5px 0;
  height: calc(100% - 60px);
  min-height: 150px;
}

.inputs {
  width: 300px;
}

.input-with-search {
  width: 650px;
  margin-bottom: 5px;
}

.pagination {
  margin-top: 10px;
}
</style>