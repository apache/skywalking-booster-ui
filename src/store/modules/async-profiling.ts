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
import type { Option } from "@/types/app";
import type { AsyncProfilingTaskList } from "@/types/async-profiling";
import { store } from "@/store";
import graphql from "@/graphql";
import type { AxiosResponse } from "axios";

interface AsyncProfilingState {
  taskList: Array<Recordable<AsyncProfilingTaskList>>;
  labels: Option[];
  asyncProfilingTips: string;
  selectedTask: Recordable<AsyncProfilingTaskList>;
}

export const asyncProfilingStore = defineStore({
  id: "asyncProfiling",
  state: (): AsyncProfilingState => ({
    taskList: [],
    labels: [{ value: "", label: "" }],
    asyncProfilingTips: "",
    selectedTask: {},
  }),
  actions: {
    setSelectedTask(task: Recordable<AsyncProfilingTaskList>) {
      this.selectedTask = task || {};
    },
    async getTaskList(params: { serviceId: string; targets: string[] }) {
      if (!params.serviceId) {
        return new Promise((resolve) => resolve({}));
      }
      const res: AxiosResponse = await graphql.query("getAsyncTaskList").params(params);

      this.asyncProfilingTips = "";
      if (res.data.errors) {
        return res.data;
      }
      this.taskList = res.data.data.asyncTaskList || [];
      this.selectedTask = this.taskList[0] || {};
      this.setSelectedTask(this.selectedTask);
      if (!this.taskList.length) {
        return res.data;
      }
      return res.data;
    },
    async getTaskLogs(param: { taskID: string }) {
      const res: AxiosResponse = await graphql.query("getAsyncProfileTaskProcess").params(param);

      if (res.data.errors) {
        return res.data;
      }
      this.taskLogs = res.data.data.taskLogs;
      return res.data;
    },
  },
});

export function useAsyncProfilingStore(): Recordable {
  return asyncProfilingStore(store);
}
