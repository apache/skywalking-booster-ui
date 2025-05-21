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
import { store } from "@/store";
import graphql from "@/graphql";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useDuration } from "@/hooks/useDuration";
import { EndpointsTopNDefault } from "../data";

interface LogState {
  services: Service[];
  instances: Instance[];
  endpoints: Endpoint[];
  conditions: Recordable;
  selectorStore: Recordable;
  supportQueryLogsByKeywords: boolean;
  logs: Recordable[];
  loadLogs: boolean;
}
const { getDurationTime } = useDuration();

export const logStore = defineStore({
  id: "log",
  state: (): LogState => ({
    services: [{ value: "0", label: "All" }],
    instances: [{ value: "0", label: "All" }],
    endpoints: [{ value: "0", label: "All" }],
    conditions: {
      queryDuration: getDurationTime(),
      paging: { pageNum: 1, pageSize: 15 },
    },
    supportQueryLogsByKeywords: true,
    selectorStore: useSelectorStore(),
    logs: [],
    loadLogs: false,
  }),
  actions: {
    setLogCondition(data: Recordable) {
      this.conditions = { ...this.conditions, ...data };
    },
    resetState() {
      this.logs = [];
      this.conditions = {
        queryDuration: getDurationTime(),
        paging: { pageNum: 1, pageSize: 15 },
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
    async getInstances(id: string) {
      const serviceId = this.selectorStore.currentService ? this.selectorStore.currentService.id : id;
      const response = await graphql.query("queryInstances").params({
        serviceId,
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
    async getLogsByKeywords() {
      const response = await graphql.query("queryLogsByKeywords").params({});

      if (response.errors) {
        return response;
      }

      this.supportQueryLogsByKeywords = response.data.support;
      return response;
    },
    async getLogs() {
      const dashboardStore = useDashboardStore();
      if (dashboardStore.layerId === "BROWSER") {
        return this.getBrowserLogs();
      }
      return this.getServiceLogs();
    },
    async getServiceLogs() {
      this.loadLogs = true;
      const response = await graphql.query("queryServiceLogs").params({ condition: this.conditions });
      this.loadLogs = false;
      if (response.errors) {
        return response;
      }

      this.logs = response.data.queryLogs.logs;
      return response;
    },
    async getBrowserLogs() {
      this.loadLogs = true;
      const response = await graphql.query("queryBrowserErrorLogs").params({ condition: this.conditions });

      this.loadLogs = false;
      if (response.errors) {
        return response;
      }
      this.logs = response.data.queryBrowserErrorLogs.logs;
      return response;
    },
    async getLogTagKeys() {
      return await graphql.query("queryLogTagKeys").params({ duration: useAppStoreWithOut().durationTime });
    },
    async getLogTagValues(tagKey: string) {
      return await graphql.query("queryLogTagValues").params({ tagKey, duration: useAppStoreWithOut().durationTime });
    },
  },
});

export function useLogStore(): Recordable {
  return logStore(store);
}
