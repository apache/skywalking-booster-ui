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
import { Endpoint } from "@/types/selector";
import {
  TaskListItem,
  SegmentSpan,
  ProfileAnalyzationTrees,
  TaskLog,
  ProfileTaskCreationRequest,
} from "@/types/profile";
import { Trace, Span } from "@/types/trace";
import { store } from "@/store";
import graphql from "@/graphql";
import { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";

interface ProfileState {
  endpoints: Endpoint[];
  taskEndpoints: Endpoint[];
  condition: { serviceId: string; endpointName: string };
  taskList: TaskListItem[];
  segmentList: Trace[];
  currentSegment: Trace | Record<string, never>;
  segmentSpans: SegmentSpan[];
  currentSpan: SegmentSpan | Record<string, never>;
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
    setCurrentSpan(span: Span) {
      this.currentSpan = span;
    },
    setCurrentSegment(s: Trace) {
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
      this.endpoints = [{ value: "", label: "All" }, ...res.data.data.pods];
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
      const res: AxiosResponse = await graphql
        .query("getProfileTaskList")
        .params(this.condition);

      if (res.data.errors) {
        return res.data;
      }
      const list = res.data.data.taskList;
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
      const res: AxiosResponse = await graphql
        .query("getProfileTaskSegmentList")
        .params(params);

      if (res.data.errors) {
        this.segmentList = [];
        return res.data;
      }
      const { segmentList } = res.data.data;

      this.segmentList = segmentList;
      if (!segmentList.length) {
        this.segmentSpans = [];
        this.analyzeTrees = [];

        return res.data;
      }
      if (segmentList[0]) {
        this.currentSegment = segmentList[0];
        this.getSegmentSpans({ segmentId: segmentList[0].segmentId });
      } else {
        this.currentSegment = null;
      }
      return res.data;
    },
    async getSegmentSpans(params: { segmentId: string }) {
      if (!params.segmentId) {
        return new Promise((resolve) => resolve({}));
      }
      const res: AxiosResponse = await graphql
        .query("queryProfileSegment")
        .params(params);
      if (res.data.errors) {
        this.segmentSpans = [];
        return res.data;
      }
      const { segment } = res.data.data;
      if (!segment) {
        this.segmentSpans = [];
        this.analyzeTrees = [];
        return res.data;
      }
      this.segmentSpans = segment.spans.map((d: SegmentSpan) => {
        return {
          ...d,
          segmentId: this.currentSegment.segmentId,
          traceId: this.currentSegment.traceIds[0],
        };
      });
      if (!(segment.spans && segment.spans.length)) {
        this.analyzeTrees = [];
        return res.data;
      }
      const index = segment.spans.length - 1 || 0;
      this.currentSpan = segment.spans[index];
      return res.data;
    },
    async getProfileAnalyze(params: {
      segmentId: string;
      timeRanges: Array<{ start: number; end: number }>;
    }) {
      if (!params.segmentId) {
        return new Promise((resolve) => resolve({}));
      }
      if (!params.timeRanges.length) {
        return new Promise((resolve) => resolve({}));
      }
      const res: AxiosResponse = await graphql
        .query("getProfileAnalyze")
        .params(params);

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
      const res: AxiosResponse = await graphql
        .query("saveProfileTask")
        .params({ creationRequest: param });

      if (res.data.errors) {
        return res.data;
      }
      this.getTaskList();
      return res.data;
    },
    async getTaskLogs(param: { taskID: string }) {
      const res: AxiosResponse = await graphql
        .query("getProfileTaskLogs")
        .params(param);

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
