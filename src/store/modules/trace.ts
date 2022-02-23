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
import { Duration } from "@/types/app";
import { Instance, Endpoint } from "@/types/selector";
import { Trace, Span } from "@/types/trace";
import { store } from "@/store";
import graphql from "@/graphql";
import { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";

interface TraceState {
  instances: Instance[];
  endpoints: Endpoint[];
  traceList: Trace[];
  traceTotal: number;
  traceSpans: Span[];
  currentTrace: Nullable<Trace>;
  conditions: any;
  // traceSpanLogs: any[];
  // traceSpanLogsTotal: number;
  // traceListErrors: string;
  // traceSpanErrors: string;
  // traceSpanLogErrors: string;
  durationTime: Duration;
  selectorStore: any;
}

export const traceStore = defineStore({
  id: "trace",
  state: (): TraceState => ({
    instances: [],
    endpoints: [],
    traceList: [],
    traceSpans: [],
    traceTotal: 0,
    currentTrace: null,
    conditions: {
      queryDuration: useAppStoreWithOut().durationTime,
      traceState: "ALL",
      queryOrder: "BY_START_TIME",
      paging: { pageNum: 1, pageSize: 15, needTotal: true },
    },
    durationTime: useAppStoreWithOut().durationTime,
    selectorStore: useSelectorStore(),
  }),
  actions: {
    setCondition(data: any) {
      this.condition = data;
    },
    setCurrentTrace(trace: Trace) {
      this.currentTrace = trace;
    },
    setTraceSpans(spans: Span) {
      this.traceSpans = spans;
    },
    async getInstances() {
      const res: AxiosResponse = await graphql
        .query("queryServiceInstance")
        .params({ serviceId: this.selectorStore.currentService });

      if (res.data.errors) {
        return res.data;
      }
      this.instances = [{ value: 0, label: "All" }, ...res.data.data.pods] || [
        { value: 0, label: "All" },
      ];
      return res.data;
    },
    async getEndpoints() {
      const res: AxiosResponse = await graphql.query("queryEndpoints").params({
        serviceId: this.selectorStore.currentService,
        duration: this.durationTime,
        keyword: "",
      });
      if (res.data.errors) {
        return res.data;
      }
      this.endpoints = [{ value: 0, label: "All" }, ...res.data.data.pods] || [
        { value: 0, label: "All" },
      ];
      return res.data;
    },
    async getTraces() {
      const res: AxiosResponse = await graphql
        .query("queryTraces")
        .params({ condition: this.condition });
      if (res.data.errors) {
        return res.data;
      }
      this.traceList = res.data.data.data.traces;
      this.traceTotal = res.data.data.data.total;
    },
    async getTraceSpans(params: any) {
      const res: AxiosResponse = await graphql
        .query("queryTrace")
        .params(params);
      if (res.data.errors) {
        return res.data;
      }
      this.setTraceSpans(res.data.data.trace.spans || []);
    },
  },
});

export function useTraceStore(): any {
  return traceStore(store);
}
