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
import type { Trace, Span } from "@/types/trace";
import { store } from "@/store";
import graphql from "@/graphql";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import { QueryOrders } from "@/views/dashboard/data";
import { EndpointsTopNDefault } from "../data";
import { useDuration } from "@/hooks/useDuration";
interface TraceState {
  services: Service[];
  instances: Instance[];
  endpoints: Endpoint[];
  traceList: Trace[];
  traceSpans: Span[];
  currentTrace: Recordable<Trace>;
  conditions: Recordable;
  traceSpanLogs: Recordable[];
  selectorStore: Recordable;
  selectedSpan: Recordable<Span>;
}
const { getDurationTime } = useDuration();

export const traceStore = defineStore({
  id: "trace",
  state: (): TraceState => ({
    services: [{ value: "0", label: "All" }],
    instances: [{ value: "0", label: "All" }],
    endpoints: [{ value: "0", label: "All" }],
    traceList: [],
    traceSpans: [],
    currentTrace: {},
    selectedSpan: {},
    conditions: {
      queryDuration: getDurationTime(),
      traceState: "ALL",
      queryOrder: QueryOrders[0].value,
      paging: { pageNum: 1, pageSize: 20 },
    },
    traceSpanLogs: [],
    selectorStore: useSelectorStore(),
  }),
  actions: {
    setTraceCondition(data: Recordable) {
      this.conditions = { ...this.conditions, ...data };
    },
    setCurrentTrace(trace: Recordable<Trace>) {
      this.currentTrace = trace;
    },
    setTraceSpans(spans: Span[]) {
      this.traceSpans = spans;
    },
    setSelectedSpan(span: Span) {
      this.selectedSpan = span;
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
    async getInstances(id: string) {
      const serviceId = this.selectorStore.currentService ? this.selectorStore.currentService.id : id;
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
    async getEndpoints(id: string, keyword?: string) {
      const serviceId = this.selectorStore.currentService ? this.selectorStore.currentService.id : id;
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
      const data = response.data.trace.spans;

      this.setTraceSpans(data || []);
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
  },
});

export function useTraceStore(): Recordable {
  return traceStore(store);
}
