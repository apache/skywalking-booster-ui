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
import { Instance, Endpoint, Service } from "@/types/selector";
import { Trace, Span } from "@/types/trace";
import { store } from "@/store";
import graphql from "@/graphql";
import { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";

interface TraceState {
  services: Service[];
  instances: Instance[];
  endpoints: Endpoint[];
  traceList: Trace[];
  activeFilter: string;
  displayMode: string;
  currentView: string;
  traceTotal: number;
  traceSpans: Span[];
  currentTrace: Trace | any;
  conditions: any;
  traceSpanLogs: any[];
  traceSpanLogsTotal: number;
  // traceListErrors: string;
  // traceSpanErrors: string;
  // traceSpanLogErrors: string;
  durationTime: Duration;
  selectorStore: any;
}

export const traceStore = defineStore({
  id: "trace",
  state: (): TraceState => ({
    services: [{ value: "0", label: "All" }],
    instances: [{ value: "0", label: "All" }],
    endpoints: [{ value: "0", label: "All" }],
    displayMode: "List",
    currentView: "traceList",
    activeFilter: "titi",
    traceList: [],
    traceSpans: [],
    traceTotal: 0,
    currentTrace: {},
    conditions: {
      queryDuration: useAppStoreWithOut().durationTime,
      traceState: "ALL",
      queryOrder: "BY_START_TIME",
      paging: { pageNum: 1, pageSize: 15, needTotal: true },
    },
    traceSpanLogs: [],
    traceSpanLogsTotal: 0,
    durationTime: useAppStoreWithOut().durationTime,
    selectorStore: useSelectorStore(),
  }),
  actions: {
    setTraceCondition(data: any) {
      this.condition = { ...this.condition, ...data };
    },
    setDisplayMode(data: string) {
      this.displayMode = data;
    },
    setCurrentView(data: string) {
      this.currentView = data;
    },
    setActiveFilter(data: string) {
      if (!data) this.activeFilter = "";
      this.activeFilter = data;
    },
    setCurrentTrace(trace: Trace) {
      this.currentTrace = trace;
    },
    setTraceSpans(spans: Span) {
      this.traceSpans = spans;
    },
    async getServices(layer: string) {
      const res: AxiosResponse = await graphql.query("queryServices").params({
        layer,
      });
      if (res.data.errors) {
        return res.data;
      }
      this.services = res.data.data.services;
      return res.data;
    },
    async getInstances(id: string) {
      const serviceId = this.selectorStore.currentService
        ? this.selectorStore.currentService.id
        : id;
      const res: AxiosResponse = await graphql.query("queryInstances").params({
        serviceId: serviceId,
        duration: this.durationTime,
      });

      if (res.data.errors) {
        return res.data;
      }
      this.instances = [{ value: "0", label: "All" }, ...res.data.data.pods];
      return res.data;
    },
    async getEndpoints(id: string, keyword?: string) {
      const serviceId = this.selectorStore.currentService
        ? this.selectorStore.currentService.id
        : id;
      const res: AxiosResponse = await graphql.query("queryEndpoints").params({
        serviceId,
        duration: this.durationTime,
        keyword: keyword || "",
      });
      if (res.data.errors) {
        return res.data;
      }
      this.endpoints = [{ value: "0", label: "All" }, ...res.data.data.pods];
      return res.data;
    },
    async getTraces() {
      const res: AxiosResponse = await graphql
        .query("queryTraces")
        .params({ condition: this.condition });
      if (res.data.errors) {
        return res.data;
      }
      if (!res.data.data.data.traces.length) {
        this.traceTotal = 0;
        this.traceList = [];
        this.setCurrentTrace({});
        this.setTraceSpans([]);
        return res.data;
      }
      this.getTraceSpans({ traceId: res.data.data.data.traces[0].traceIds[0] });
      this.traceList = res.data.data.data.traces.map((d: Trace) => {
        d.traceIds = d.traceIds.map((id: string) => {
          return { value: id, label: id };
        });
        return d;
      });
      this.traceTotal = res.data.data.data.total;
      this.setCurrentTrace(res.data.data.data.traces[0] || {});
      return res.data;
    },
    async getTraceSpans(params: { traceId: string }) {
      const res: AxiosResponse = await graphql
        .query("queryTrace")
        .params(params);
      if (res.data.errors) {
        return res.data;
      }
      this.setTraceSpans(res.data.data.trace.spans || []);
      return res.data;
    },
    async getSpanLogs(params: any) {
      const res: AxiosResponse = await graphql
        .query("queryServiceLogs")
        .params(params);
      if (res.data.errors) {
        this.traceSpanLogs = [];
        this.traceSpanLogsTotal = 0;
        return res.data;
      }
      this.traceSpanLogs = res.data.data.queryLogs.logs || [];
      this.traceSpanLogsTotal = res.data.data.queryLogs.total;
      return res.data;
    },
  },
});

export function useTraceStore(): any {
  return traceStore(store);
}
