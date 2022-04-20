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
          Click to select processes
        </el-button>
      </template>
      <el-table
        :data="processes"
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
            {{ scope.row.attributes.map((d: any) => `${d.name}=${d.value}`).join("; ") }}
          </template>
        </el-table-column>
      </el-table>
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
import type { ElTable } from "element-plus";

const { t } = useI18n();
const ebpfStore = useEbpfStore();
/*global Nullable */
const multipleTableRef = ref<InstanceType<typeof ElTable>>();
const selectedProcesses = ref<string[]>([]);
const timeline = ref<Nullable<HTMLDivElement>>(null);
const visGraph = ref<Nullable<any>>(null);
const labels = ref<Option[]>([{ label: "All", value: "0" }]);
const processes = ref<Process[]>([]);
const selectedLabels = ref<string[]>(["0"]);
const dateFormat = (date: number, pattern = "YYYY-MM-DD HH:mm:ss") =>
  dayjs(date).format(pattern);

function changeLabels(opt: any[]) {
  const arr = opt.map((d) => d.value);

  // if (arr.includes("0")) {
  //   selectedLabels.value = labels.value.map((d: Option) => d.value);

  //   return;
  // }
  // selectedLabels.value = Array.from(new Set(arr));
  selectedLabels.value = arr;
}

const handleSelectionChange = (arr: Process[]) => {
  selectedProcesses.value = arr.map((d: Process) => d.id);
};

async function analyzeEBPF() {
  let arr: string[] = [];
  if (selectedLabels.value.includes("0")) {
    arr = labels.value.map((d: Option) => d.value);
    arr.pop();
  }
  console.log(arr);
  const ranges: { start: number; end: number }[] = [];
  const scheduleIdList = ebpfStore.eBPFSchedules.flatMap(
    (d: EBPFProfilingSchedule) => {
      const l = d.process.labels.find((d: string) => arr.includes(d));
      const i = selectedLabels.value.includes(d.process.id);
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
}

function visTimeline() {
  if (visGraph.value) {
    visGraph.value.destroy();
  }
  labels.value = [{ label: "All", value: "0" }];
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
  const items: any = new DataSet(schedules);
  const options = {
    height: 250,
  };
  if (!timeline.value) {
    return;
  }
  visGraph.value = new Timeline(timeline.value, items, options);
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
  width: 100%;
  margin: 0 5px 5px 0;
}

.inputs {
  width: 300px;
}
</style>
