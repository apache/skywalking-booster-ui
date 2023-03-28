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
import type { Endpoint } from "@/types/selector";
import type {
  TaskListItem,
  SegmentSpan,
  ProfileAnalyzationTrees,
  TaskLog,
  ProfileTaskCreationRequest,
} from "@/types/profile";
import type { Trace } from "@/types/trace";
import { store } from "@/store";
import graphql from "@/graphql";
import type { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";

interface ProfileState {
  endpoints: Endpoint[];
  taskEndpoints: Endpoint[];
  condition: { serviceId: string; endpointName: string };
  taskList: TaskListItem[];
  segmentList: Trace[];
  currentSegment: Recordable<Trace>;
  segmentSpans: Array<Recordable<SegmentSpan>>;
  currentSpan: Recordable<SegmentSpan>;
  analyzeTrees: ProfileAnalyzationTrees;
  taskLogs: TaskLog[];
  highlightTop: boolean;
}

export const profileStore = defineStore({
  id: "profile",
  state: (): ProfileState => ({
    endpoints: [{ value: "", label: "All" }],
    taskEndpoints: [{ value: "", label: "All" }],
    condition: { serviceId: "", endpointName: "" },
    taskList: [],
    segmentList: [],
    currentSegment: {},
    segmentSpans: [],
    currentSpan: {},
    analyzeTrees: [],
    taskLogs: [],
    highlightTop: true,
  }),
  actions: {
    setConditions(data: { serviceId?: string; endpointName?: string }) {
      this.condition = {
        ...this.condition,
        ...data,
      };
    },
    setSegmentSpans(spans: Recordable<SegmentSpan>[]) {
      this.segmentSpans = spans;
    },
    setCurrentSpan(span: Recordable<SegmentSpan>) {
      this.currentSpan = span;
    },
    setCurrentSegment(s: Recordable<Trace>) {
      this.currentSegment = s;
    },
    setHighlightTop() {
      this.highlightTop = !this.highlightTop;
    },
    async getEndpoints(serviceId: string, keyword?: string) {
      const res: AxiosResponse = await graphql.query("queryEndpoints").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
        keyword: keyword || "",
      });
      if (res.data.errors) {
        return res.data;
      }
      this.endpoints = res.data.data.pods || [];
      return res.data;
    },
    async getTaskEndpoints(serviceId: string, keyword?: string) {
      const res: AxiosResponse = await graphql.query("queryEndpoints").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
        keyword: keyword || "",
      });
      if (res.data.errors) {
        return res.data;
      }
      this.taskEndpoints = [{ value: "", label: "All" }, ...res.data.data.pods];
      return res.data;
    },
    async getTaskList() {
      const res: AxiosResponse = await graphql.query("getProfileTaskList").params(this.condition);

      if (res.data.errors) {
        return res.data;
      }
      const list = res.data.data.taskList || [];
      this.taskList = list;
      if (!list.length) {
        this.segmentList = [];
        this.segmentSpans = [];
        this.analyzeTrees = [];

        return res.data;
      }
      this.getSegmentList({ taskID: list[0].id });
      return res.data;
    },
    async getSegmentList(params: { taskID: string }) {
      if (!params.taskID) {
        return new Promise((resolve) => resolve({}));
      }
      const res: AxiosResponse = await graphql.query("getProfileTaskSegmentList").params(params);

      if (res.data.errors) {
        this.segmentList = [];
        return res.data;
      }
      const { segmentList } = res.data.data;

      this.segmentList = segmentList || [];
      if (!segmentList.length) {
        this.segmentSpans = [];
        this.analyzeTrees = [];

        return res.data;
      }
      if (segmentList[0]) {
        this.currentSegment = segmentList[0];
        this.getSegmentSpans(segmentList[0].segmentId);
      } else {
        this.currentSegment = {};
      }
      return res.data;
    },
    async getSegmentSpans() {
      this.analyzeTrees = [];
      this.segmentSpans = this.currentSegment.spans;
      const index = this.currentSegment.spans.length - 1 || 0;
      this.currentSpan = this.currentSegment.spans[index];
    },
    async getProfileAnalyze(params: Array<{ segmentId: string; timeRange: { start: number; end: number } }>) {
      if (!params.length) {
        return new Promise((resolve) => resolve({}));
      }
      const res: AxiosResponse = await graphql.query("getProfileAnalyze").params({ queries: params });

      if (res.data.errors) {
        this.analyzeTrees = [];
        return res.data;
      }
      const { analyze, tip } = res.data.data;
      if (tip) {
        this.analyzeTrees = [];
        return res.data;
      }

      if (!analyze) {
        this.analyzeTrees = [];
        return res.data;
      }
      this.analyzeTrees = analyze.trees;
      return res.data;
    },
    async createTask(param: ProfileTaskCreationRequest) {
      const res: AxiosResponse = await graphql.query("saveProfileTask").params({ creationRequest: param });

      if (res.data.errors) {
        return res.data;
      }
      this.getTaskList();
      return res.data;
    },
    async getTaskLogs(param: { taskID: string }) {
      const res: AxiosResponse = await graphql.query("getProfileTaskLogs").params(param);

      if (res.data.errors) {
        return res.data;
      }
      this.taskLogs = res.data.data.taskLogs;
      return res.data;
    },
  },
});

export function useProfileStore(): any {
  return profileStore(store);
}
