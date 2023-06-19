/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { defineStore } from "pinia";
import { ElMessage } from "element-plus";
import { store } from "@/store";
import graphql from "@/graphql";
import type { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";
import type { EBPFTaskList } from "@/types/ebpf";
import { useNetworkProfilingStore } from "@/store/modules/network-profiling";
import { useSelectorStore } from "@/store/modules/selectors";
import { useEbpfStore } from "@/store/modules/ebpf";
import dateFormatStep from "@/utils/dateFormat";
import getLocalTime from "@/utils/localtime";
import { TargetTypes } from "@/views/dashboard/related/continuous-profiling/data";
interface taskTimelineState {
  loading: boolean;
  taskList: EBPFTaskList[];
  selectedTask: Recordable<EBPFTaskList>;
}

export const taskTimelineStore = defineStore({
  id: "taskTimeline",
  state: (): taskTimelineState => ({
    loading: false,
    taskList: [],
    selectedTask: {},
  }),
  actions: {
    setSelectedTask(task: Recordable<EBPFTaskList>) {
      this.selectedTask = task || {};
    },
    setTaskList(list: EBPFTaskList[]) {
      this.taskList = list;
    },
    async getContinousTaskList(params: {
      serviceId: string;
      serviceInstanceId: string;
      targets: string[];
      triggerType: string;
    }) {
      if (!params.serviceId) {
        return new Promise((resolve) => resolve({}));
      }
      this.loading = true;
      const res: AxiosResponse = await graphql.query("getEBPFTasks").params(params);

      this.loading = false;
      this.errorTip = "";
      if (res.data.errors) {
        return res.data;
      }
      const selectorStore = useSelectorStore();
      this.taskList = (res.data.data.queryEBPFTasks || []).filter(
        (d: EBPFTaskList) => selectorStore.currentProcess && d.processId === selectorStore.currentProcess.id,
      );
      // this.selectedTask = this.taskList[0] || {};
      // await this.getGraphData();
      return res.data;
    },
    async getGraphData() {
      let res: any = {};

      if (this.selectedTask.targetType === TargetTypes[2].value) {
        res = await this.getTopology();
      } else {
        const ebpfStore = useEbpfStore();
        res = await ebpfStore.getEBPFSchedules({
          taskId: this.selectedTask.taskId,
        });
      }

      if (res.errors) {
        ElMessage.error(res.errors);
      }
    },
    async getTopology() {
      const networkProfilingStore = useNetworkProfilingStore();
      const appStore = useAppStoreWithOut();
      const selectorStore = useSelectorStore();
      networkProfilingStore.setSelectedNetworkTask(this.selectedTask);
      const { taskStartTime, fixedTriggerDuration } = this.selectedTask;
      const startTime =
        fixedTriggerDuration > 1800 ? taskStartTime + fixedTriggerDuration * 1000 - 30 * 60 * 1000 : taskStartTime;
      let endTime = taskStartTime + fixedTriggerDuration * 1000;
      if (taskStartTime + fixedTriggerDuration * 1000 > new Date().getTime()) {
        endTime = new Date().getTime();
      }
      const resp = await networkProfilingStore.getProcessTopology({
        serviceInstanceId: (selectorStore.currentPod || {}).id || "",
        duration: {
          start: dateFormatStep(getLocalTime(appStore.utc, new Date(startTime)), appStore.duration.step, true),
          end: dateFormatStep(getLocalTime(appStore.utc, new Date(endTime)), appStore.duration.step, true),
          step: appStore.duration.step,
        },
      });
      if (resp.errors) {
        ElMessage.error(resp.errors);
      }
      return resp;
    },
    async preAnalyzeTask() {
      if (this.selectedStrategy.type === "NETWORK") {
        const networkProfilingStore = useNetworkProfilingStore();
        await networkProfilingStore.setSelectedNetworkTask(this.selectedTask);
        return;
      }
      const res = await this.getEBPFSchedules({
        taskId: this.selectedTask.taskId,
      });
      if (res.errors) {
        ElMessage.error(res.errors);
      }
    },
  },
});

export function useTaskTimelineStore(): Recordable {
  return taskTimelineStore(store);
}
