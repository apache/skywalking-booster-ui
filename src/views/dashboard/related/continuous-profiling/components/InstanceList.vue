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
  <el-table :data="tableData" style="width: 100%">
    <el-table-column type="expand">
      <template #default="props">
        <div class="child">
          <div class="title">Attributes</div>
          <div v-for="(attr, index) in props.row.attributes" :key="index">
            {{ `${attr.name}: ${attr.value}` }}
          </div>
          <div class="title mt-20">Processes</div>
          <el-table :data="props.row.processes" size="small">
            <el-table-column
              v-for="item in HeaderChildLabels"
              :key="item.value"
              :label="item.label"
              :prop="item.value"
            />
          </el-table>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      v-for="item in HeaderLabels"
      :key="item.value"
      :label="item.label"
      :prop="item.value"
      :width="item.width"
    />
  </el-table>
</template>
<script lang="ts" setup>
  import { computed } from "vue";
  import type { EBPFTaskList } from "@/types/ebpf";
  import { useContinousProfilingStore } from "@/store/modules/continous-profiling";
  import type { MonitorInstance, MonitorProcess } from "@/types/continous-profiling";
  import { HeaderLabels, HeaderChildLabels } from "../data";
  import { dateFormat } from "@/utils/dateFormat";

  const continousProfilingStore = useContinousProfilingStore();

  const tableData = computed(() => {
    return continousProfilingStore.instances.map((d: MonitorInstance) => {
      const processes = (d.processes || []).map((p: MonitorProcess) => {
        return {
          ...p,
          lastTriggerTime: d.lastTriggerTimestamp ? dateFormat(d.lastTriggerTimestamp) : "",
          labels: p.labels.join("; "),
        };
      });

      return { ...d, processes, lastTriggerTime: d.lastTriggerTimestamp ? dateFormat(d.lastTriggerTimestamp) : "" };
    });
  });

  async function changeTask(item: EBPFTaskList) {
    continousProfilingStore.setselectedTask(item);
    continousProfilingStore.getGraphData();
  }
</script>
<style lang="scss" scoped>
  .title {
    font-size: 12px;
    font-weight: bold;
  }

  .child {
    padding-left: 20px;
  }
</style>
