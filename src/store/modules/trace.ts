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
import type { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import { QueryOrders } from "@/views/dashboard/data";

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
}

export const traceStore = defineStore({
  id: "trace",
  state: (): TraceState => ({
    services: [{ value: "0", label: "All" }],
    instances: [{ value: "0", label: "All" }],
    endpoints: [{ value: "0", label: "All" }],
    traceList: [],
    traceSpans: [],
    currentTrace: {},
    conditions: {
      queryDuration: useAppStoreWithOut().durationTime,
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
    resetState() {
      this.traceSpans = [];
      this.traceList = [];
      this.currentTrace = {};
      this.conditions = {
        queryDuration: useAppStoreWithOut().durationTime,
        paging: { pageNum: 1, pageSize: 20 },
        traceState: "ALL",
        queryOrder: QueryOrders[0].value,
      };
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
    async getService(serviceId: string) {
      if (!serviceId) {
        return;
      }
      const res: AxiosResponse = await graphql.query("queryService").params({
        serviceId,
      });

      return res.data;
    },
    async getInstance(instanceId: string) {
      if (!instanceId) {
        return;
      }
      const res: AxiosResponse = await graphql.query("queryInstance").params({
        instanceId,
      });

      return res.data;
    },
    async getEndpoint(endpointId: string) {
      if (!endpointId) {
        return;
      }
      const res: AxiosResponse = await graphql.query("queryEndpoint").params({
        endpointId,
      });

      return res.data;
    },
    async getInstances(id: string) {
      const serviceId = this.selectorStore.currentService ? this.selectorStore.currentService.id : id;
      const res: AxiosResponse = await graphql.query("queryInstances").params({
        serviceId: serviceId,
        duration: useAppStoreWithOut().durationTime,
      });

      if (res.data.errors) {
        return res.data;
      }
      this.instances = [{ value: "0", label: "All" }, ...res.data.data.pods];
      return res.data;
    },
    async getEndpoints(id: string, keyword?: string) {
      const serviceId = this.selectorStore.currentService ? this.selectorStore.currentService.id : id;
      const res: AxiosResponse = await graphql.query("queryEndpoints").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
        keyword: keyword || "",
      });
      if (res.data.errors) {
        return res.data;
      }
      this.endpoints = [{ value: "0", label: "All" }, ...res.data.data.pods];
      return res.data;
    },
    async getTraces() {
      const res: AxiosResponse = await graphql.query("queryTraces").params({ condition: this.conditions });
      if (res.data.errors) {
        return res.data;
      }
      if (!res.data.data.data.traces.length) {
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
      this.setCurrentTrace(res.data.data.data.traces[0] || {});
      return res.data;
    },
    async getTraceSpans(params: { traceId: string }) {
      const res: AxiosResponse = await graphql.query("queryTrace").params(params);
      if (res.data.errors) {
        return res.data;
      }
      const data = res.data.data.trace.spans;
      this.setTraceSpans(data || []);
      return res.data;
    },
    async getSpanLogs(params: Recordable) {
      const res: AxiosResponse = await graphql.query("queryServiceLogs").params(params);
      if (res.data.errors) {
        this.traceSpanLogs = [];
        return res.data;
      }
      this.traceSpanLogs = res.data.data.queryLogs.logs || [];
      return res.data;
    },
    async getTagKeys() {
      const res: AxiosResponse = await graphql
        .query("queryTraceTagKeys")
        .params({ duration: useAppStoreWithOut().durationTime });

      return res.data;
    },
    async getTagValues(tagKey: string) {
      const res: AxiosResponse = await graphql
        .query("queryTraceTagValues")
        .params({ tagKey, duration: useAppStoreWithOut().durationTime });

      return res.data;
    },
  },
});

export function useTraceStore(): Recordable {
  return traceStore(store);
}
