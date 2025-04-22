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
import { useAppStoreWithOut } from "@/store/modules/app";
import { EndpointsTopNDefault } from "../data";

interface ProfileState {
  endpoints: Endpoint[];
  taskEndpoints: Endpoint[];
  condition: { serviceId: string; endpointName: string };
  taskList: TaskListItem[];
  currentTask: Recordable<TaskListItem>;
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
    currentTask: {},
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
    setCurrentTask(task: TaskListItem) {
      this.currentTask = task || {};
      this.analyzeTrees = [];
    },
    setSegmentSpans(spans: Recordable<SegmentSpan>[]) {
      this.currentSpan = spans[0] || {};
      this.segmentSpans = spans;
    },
    setCurrentSpan(span: Recordable<SegmentSpan>) {
      this.currentSpan = span;
      this.analyzeTrees = [];
    },
    setCurrentSegment(segment: Trace) {
      this.currentSegment = segment || {};
      this.segmentSpans = segment.spans || [];
      if (segment.spans) {
        this.currentSpan = segment.spans[0] || {};
      } else {
        this.currentSpan = {};
      }
      this.analyzeTrees = [];
    },
    setHighlightTop() {
      this.highlightTop = !this.highlightTop;
    },
    async getEndpoints(serviceId: string, keyword?: string) {
      const response = await graphql.query("queryEndpoints").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
        keyword: keyword || "",
        limit: EndpointsTopNDefault,
      });
      if (response.errors) {
        return response;
      }
      this.endpoints = response.data.pods || [];
      return response.data;
    },
    async getTaskEndpoints(serviceId: string, keyword?: string) {
      const response = await graphql.query("queryEndpoints").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
        keyword: keyword || "",
        limit: EndpointsTopNDefault,
      });
      if (response.errors) {
        return response;
      }
      this.taskEndpoints = [{ value: "", label: "All" }, ...response.data.pods];
      return response;
    },
    async getTaskList() {
      const response = await graphql.query("getProfileTaskList").params(this.condition);

      if (response.errors) {
        return response;
      }
      const list = response.data.taskList || [];
      this.taskList = list;
      this.currentTask = list[0] || {};
      if (!list.length) {
        this.segmentList = [];
        this.segmentSpans = [];
        this.analyzeTrees = [];

        return response;
      }
      this.getSegmentList({ taskID: list[0].id });
      return response;
    },
    async getSegmentList(params: { taskID: string }) {
      if (!params.taskID) {
        return new Promise((resolve) => resolve({}));
      }
      const response = await graphql.query("getProfileTaskSegmentList").params(params);

      if (response.errors) {
        this.segmentList = [];
        return response;
      }
      const { segmentList } = response.data;

      this.segmentList = segmentList || [];
      if (!segmentList.length) {
        this.segmentSpans = [];
        this.analyzeTrees = [];

        return response;
      }
      if (segmentList[0]) {
        this.setCurrentSegment(segmentList[0]);
        this.getSegmentSpans(segmentList[0].segmentId);
      } else {
        this.setCurrentSegment({});
      }
      return response;
    },
    async getSegmentSpans(params: { segmentId: string }) {
      if (!(params && params.segmentId)) {
        return new Promise((resolve) => resolve({}));
      }
      const response = await graphql.query("queryProfileSegment").params(params);
      if (response.errors) {
        this.segmentSpans = [];
        return response;
      }
      const { segment } = response.data;
      if (!segment) {
        this.segmentSpans = [];
        this.analyzeTrees = [];
        return response;
      }
      this.segmentSpans = segment.spans.map((d: SegmentSpan) => {
        return {
          ...d,
          segmentId: this.currentSegment?.segmentId,
          traceId: (this.currentSegment.traceIds as string[])[0],
        };
      });
      if (!(segment.spans && segment.spans.length)) {
        this.analyzeTrees = [];
        return response;
      }
      const index = segment.spans.length - 1 || 0;
      this.currentSpan = segment.spans[index];
      return response;
    },
    async getProfileAnalyze(params: Array<{ segmentId: string; timeRange: { start: number; end: number } }>) {
      if (!params.length) {
        return new Promise((resolve) => resolve({}));
      }
      const response = await graphql.query("getProfileAnalyze").params({ queries: params });

      if (response.errors) {
        this.analyzeTrees = [];
        return response;
      }
      const { analyze, tip } = response.data;
      if (tip) {
        this.analyzeTrees = [];
        return response;
      }

      if (!analyze) {
        this.analyzeTrees = [];
        return response;
      }
      this.analyzeTrees = analyze.trees;
      return response;
    },
    async createTask(param: ProfileTaskCreationRequest) {
      const response = await graphql.query("saveProfileTask").params({ creationRequest: param });

      if (response.errors) {
        return response;
      }
      this.getTaskList();
      return response;
    },
    async getTaskLogs(param: { taskID: string }) {
      const response = await graphql.query("getProfileTaskLogs").params(param);

      if (response.errors) {
        return response;
      }
      this.taskLogs = response.data.taskLogs;
      return response;
    },
  },
});

export function useProfileStore(): Recordable {
  return profileStore(store);
}
