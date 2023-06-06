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
import { store } from "@/store";
import graphql from "@/graphql";
import type { AxiosResponse } from "axios";
import type { EBPFTaskList } from "@/types/ebpf";
import { useNetworkProfilingStore } from "@/store/modules/network-profiling";

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
      this.taskList = res.data.data.queryEBPFTasks || [];
      if (!this.taskList.length) {
        const networkProfilingStore = useNetworkProfilingStore();
        networkProfilingStore.seNodes([]);
        networkProfilingStore.setLinks([]);
        this.eBPFSchedules = [];
        this.analyzeTrees = [];
        this.selectedTask = {};
        return;
      }
      // this.selectedTask = this.taskList[0] || {};
      // this.setselectedTask(this.selectedTask);
      // await this.getGraphData();
      return res.data;
    },
  },
});

export function useTaskTimelineStore(): Recordable {
  return taskTimelineStore(store);
}
