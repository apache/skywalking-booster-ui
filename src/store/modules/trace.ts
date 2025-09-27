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
import type { Instance, Endpoint, Service } from "@/types/selector";
import type { Trace, Span, TraceCondition } from "@/types/trace";
import { store } from "@/store";
import graphql from "@/graphql";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import { QueryOrders } from "@/views/dashboard/data";
import { EndpointsTopNDefault } from "../data";
import { useDuration } from "@/hooks/useDuration";
import { LogItem } from "@/types/log";
interface TraceState {
  services: Service[];
  instances: Instance[];
  endpoints: Endpoint[];
  traceList: Trace[];
  traceSpans: Span[];
  currentTrace: Nullable<Trace>;
  conditions: TraceCondition;
  traceSpanLogs: LogItem[];
  selectorStore: ReturnType<typeof useSelectorStore>;
  selectedSpan: Nullable<Span>;
  serviceList: string[];
  currentSpan: Nullable<Span>;
  hasQueryTracesV2Support: boolean;
  v2Traces: Trace[];
}
const { getDurationTime } = useDuration();

export const PageSize = 20;

export const traceStore = defineStore({
  id: "trace",
  state: (): TraceState => ({
    services: [{ value: "0", label: "All", id: "" }],
    instances: [{ value: "0", label: "All", id: "" }],
    endpoints: [{ value: "0", label: "All", id: "" }],
    traceList: [],
    traceSpans: [],
    currentTrace: null,
    selectedSpan: null,
    conditions: {
      queryDuration: getDurationTime(),
      traceState: "ALL",
      queryOrder: QueryOrders[0].value,
      paging: { pageNum: 1, pageSize: PageSize },
    },
    traceSpanLogs: [],
    selectorStore: useSelectorStore(),
    serviceList: [],
    currentSpan: null,
    hasQueryTracesV2Support: false,
    v2Traces: [],
  }),
  actions: {
    setTraceCondition(data: Recordable) {
      this.conditions = { ...this.conditions, ...data };
    },
    setCurrentTrace(trace: Nullable<Trace>) {
      this.currentTrace = trace || {};
    },
    setTraceSpans(spans: Span[]) {
      this.traceSpans = spans;
    },
    setSelectedSpan(span: Nullable<Span>) {
      this.selectedSpan = span || {};
    },
    setCurrentSpan(span: Nullable<Span>) {
      this.currentSpan = span || {};
    },
    setV2Spans(traceId: string) {
      const trace = this.traceList.find((d: Trace) => d.traceId === traceId);
      this.setTraceSpans(trace?.spans || []);
      this.serviceList = Array.from(new Set(trace?.spans.map((i: Span) => i.serviceCode)));
    },
    setTraceList(traces: Trace[]) {
      this.traceList = traces;
    },
    resetState() {
      this.traceSpans = [];
      this.traceList = [];
      this.currentTrace = {};
      this.conditions = {
        queryDuration: getDurationTime(),
        paging: { pageNum: 1, pageSize: 20 },
        traceState: "ALL",
        queryOrder: QueryOrders[0].value,
      };
    },
    async getServices(layer: string) {
      const response = await graphql.query("queryServices").params({
        layer,
      });
      if (response.errors) {
        return response;
      }
      this.services = response.data.services;
      return response;
    },
    async getService(serviceId: string) {
      if (!serviceId) {
        return;
      }
      const response = await graphql.query("queryService").params({
        serviceId,
      });

      return response;
    },
    async getInstance(instanceId: string) {
      if (!instanceId) {
        return;
      }
      const response = await graphql.query("queryInstance").params({
        instanceId,
      });

      return response;
    },
    async getEndpoint(endpointId: string) {
      if (!endpointId) {
        return;
      }
      return await graphql.query("queryEndpoint").params({
        endpointId,
      });
    },
    async getInstances(id?: string) {
      const serviceId = this.selectorStore.currentService ? this.selectorStore.currentService.id : id;
      if (!serviceId) {
        return new Promise((resolve) => resolve({ errors: "Service ID is required" }));
      }
      const response = await graphql.query("queryInstances").params({
        serviceId: serviceId,
        duration: useAppStoreWithOut().durationTime,
      });

      if (response.errors) {
        return response;
      }
      this.instances = [{ value: "0", label: "All" }, ...response.data.pods];
      return response;
    },
    async getEndpoints(id?: string, keyword?: string) {
      const serviceId = this.selectorStore.currentService ? this.selectorStore.currentService.id : id;
      if (!serviceId) {
        return new Promise((resolve) => resolve({ errors: "Service ID is required" }));
      }
      const response = await graphql.query("queryEndpoints").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
        keyword: keyword || "",
        limit: EndpointsTopNDefault,
      });
      if (response.errors) {
        return response;
      }
      this.endpoints = [{ value: "0", label: "All" }, ...response.data.pods];
      return response;
    },
    async getTraces() {
      if (this.hasQueryTracesV2Support) {
        return this.fetchV2Traces();
      }
      const response = await graphql.query("queryTraces").params({ condition: this.conditions });
      if (response.errors) {
        return response;
      }
      if (!response.data.data.traces.length) {
        this.traceList = [];
        this.setCurrentTrace({});
        this.setTraceSpans([]);
        return response;
      }
      this.getTraceSpans({ traceId: response.data.data.traces[0].traceIds[0] });
      this.traceList = response.data.data.traces.map((d: Trace) => {
        d.traceIds = d.traceIds.map((id: string) => {
          return { value: id, label: id };
        });
        return d;
      });
      this.setCurrentTrace(response.data.data.traces[0] || {});
      return response;
    },
    async getTraceSpans(params: { traceId: string }) {
      if (this.hasQueryTracesV2Support) {
        this.setV2Spans(params.traceId);
        return new Promise((resolve) => resolve({}));
      }
      const appStore = useAppStoreWithOut();
      let response;
      if (appStore.coldStageMode) {
        response = await graphql
          .query("queryTraceSpansFromColdStage")
          .params({ ...params, duration: this.conditions.queryDuration });
      } else {
        response = await graphql.query("querySpans").params(params);
      }
      if (response.errors) {
        return response;
      }
      const data = response.data.trace.spans || [];
      this.serviceList = Array.from(new Set(data.map((i: Span) => i.serviceCode)));
      this.setTraceSpans(data);
      return response;
    },
    async getSpanLogs(params: Recordable) {
      const response = await graphql.query("queryServiceLogs").params(params);
      if (response.errors) {
        this.traceSpanLogs = [];
        return response;
      }
      this.traceSpanLogs = response.data.queryLogs.logs || [];
      return response;
    },
    async getTagKeys() {
      return await graphql.query("queryTraceTagKeys").params({ duration: useAppStoreWithOut().durationTime });
    },
    async getTagValues(tagKey: string) {
      return await graphql.query("queryTraceTagValues").params({ tagKey, duration: useAppStoreWithOut().durationTime });
    },
    async getHasQueryTracesV2Support() {
      const response = await graphql.query("queryHasQueryTracesV2Support").params({});
      this.hasQueryTracesV2Support = response.data.hasQueryTracesV2Support;
      return response;
    },
    async fetchV2Traces() {
      const response = await graphql.query("queryV2Traces").params({ condition: this.conditions });
      if (response.errors) {
        this.traceList = [];
        this.setCurrentTrace({});
        this.setTraceSpans([]);
        return response;
      }
      this.v2Traces = response.data.queryTraces.traces || [];
      this.traceList = this.v2Traces
        .map((d: Trace) => {
          const newSpans = d.spans.map((span: Span) => {
            return {
              ...span,
              traceId: span.traceId,
              duration: span.endTime - span.startTime,
              label: `${span.serviceCode}: ${span.endpointName}`,
            };
          });
          const trace =
            newSpans.find((span: Span) => span.parentSpanId === -1 && span.refs.length === 0) || newSpans[0];
          return {
            endpointNames: trace.endpointName ? [trace.endpointName] : [],
            traceIds: trace.traceId ? [{ value: trace.traceId, label: trace.traceId }] : [],
            start: trace.startTime,
            duration: trace.endTime - trace.startTime,
            isError: trace.isError,
            spans: newSpans,
            traceId: trace.traceId,
            key: trace.traceId,
            serviceCode: trace.serviceCode,
            label: `${trace.serviceCode}: ${trace.endpointName}`,
          };
        })
        .sort((a: Trace, b: Trace) => b.duration - a.duration);
      const trace = this.traceList[0];
      if (!trace) {
        this.traceList = [];
        this.setCurrentTrace({});
        this.setTraceSpans([]);
        return response;
      }

      this.serviceList = Array.from(new Set(trace.spans.map((i: Span) => i.serviceCode)));
      this.setTraceSpans(trace.spans);
      this.setCurrentTrace(trace || {});
      return response;
    },
  },
});

export function useTraceStore() {
  return traceStore(store);
}
