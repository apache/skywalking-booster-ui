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
import type { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import { useDashboardStore } from "@/store/modules/dashboard";

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

export const logStore = defineStore({
  id: "log",
  state: (): LogState => ({
    services: [{ value: "0", label: "All" }],
    instances: [{ value: "0", label: "All" }],
    endpoints: [{ value: "0", label: "All" }],
    conditions: {
      queryDuration: useAppStoreWithOut().durationTime,
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
        queryDuration: useAppStoreWithOut().durationTime,
        paging: { pageNum: 1, pageSize: 15 },
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
    async getInstances(id: string) {
      const serviceId = this.selectorStore.currentService ? this.selectorStore.currentService.id : id;
      const res: AxiosResponse = await graphql.query("queryInstances").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
      });

      if (res.data.errors) {
        return res.data;
      }
      this.instances = [{ value: "0", label: "All" }, ...res.data.data.pods] || [{ value: " 0", label: "All" }];
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
      this.endpoints = [{ value: "0", label: "All" }, ...res.data.data.pods] || [{ value: "0", label: "All" }];
      return res.data;
    },
    async getLogsByKeywords() {
      const res: AxiosResponse = await graphql.query("queryLogsByKeywords").params({});

      if (res.data.errors) {
        return res.data;
      }

      this.supportQueryLogsByKeywords = res.data.data.support;
      return res.data;
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
      const res: AxiosResponse = await graphql.query("queryServiceLogs").params({ condition: this.conditions });
      this.loadLogs = false;
      if (res.data.errors) {
        return res.data;
      }

      this.logs = res.data.data.queryLogs.logs;
      return res.data;
    },
    async getBrowserLogs() {
      this.loadLogs = true;
      const res: AxiosResponse = await graphql.query("queryBrowserErrorLogs").params({ condition: this.conditions });

      this.loadLogs = false;
      if (res.data.errors) {
        return res.data;
      }
      this.logs = res.data.data.queryBrowserErrorLogs.logs;
      return res.data;
    },
    async getLogTagKeys() {
      const res: AxiosResponse = await graphql
        .query("queryLogTagKeys")
        .params({ duration: useAppStoreWithOut().durationTime });

      return res.data;
    },
    async getLogTagValues(tagKey: string) {
      const res: AxiosResponse = await graphql
        .query("queryLogTagValues")
        .params({ tagKey, duration: useAppStoreWithOut().durationTime });

      return res.data;
    },
  },
});

export function useLogStore(): Recordable {
  return logStore(store);
}
