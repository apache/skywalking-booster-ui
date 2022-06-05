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
import { ServiceLogColumn, BrowserLogColumn } from "@/types/log-column";
import { ServiceLogConstants, BrowserLogConstants } from "../data";
import { store } from "@/store";
import graphql from "@/graphql";
import { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import { useDashboardStore } from "@/store/modules/dashboard";

interface LogState {
  services: Service[];
  instances: Instance[];
  endpoints: Endpoint[];
  serviceLogColumn: ServiceLogColumn[];
  browserLogColumn: BrowserLogColumn[];
  conditions: any;
  durationTime: Duration;
  selectorStore: any;
  supportQueryLogsByKeywords: boolean;
  logs: any[];
  logsTotal: number;
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
      paging: { pageNum: 1, pageSize: 15, needTotal: true },
    },
    serviceLogColumn: [...ServiceLogConstants],
    browserLogColumn: [...BrowserLogConstants],
    supportQueryLogsByKeywords: true,
    durationTime: useAppStoreWithOut().durationTime,
    selectorStore: useSelectorStore(),
    logs: [],
    logsTotal: 0,
    loadLogs: false,
  }),
  actions: {
    showColumns(columnsLabel: string) {
      this.serviceLogColumn.forEach((col: any) => {
        if (columnsLabel === col.value) {
          col.isVisible = true;
        }
      });
    },
    hideColumns(columnsLabel: string) {
      this.serviceLogColumn.forEach((col: any) => {
        if (columnsLabel === col.value) {
          col.isVisible = false;
        }
      });
    },
    toggleAllColumns(status: boolean) {
      this.serviceLogColumn.forEach((col: any) => {
        col.isVisible = status;
      });
    },
    setLogCondition(data: any) {
      this.conditions = { ...this.conditions, ...data };
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
        serviceId,
        duration: this.durationTime,
      });

      if (res.data.errors) {
        return res.data;
      }
      this.instances = [
        { value: "0", label: "All" },
        ...res.data.data.pods,
      ] || [{ value: " 0", label: "All" }];
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
      this.endpoints = [
        { value: "0", label: "All" },
        ...res.data.data.pods,
      ] || [{ value: "0", label: "All" }];
      return res.data;
    },
    async getLogsByKeywords() {
      const res: AxiosResponse = await graphql
        .query("queryLogsByKeywords")
        .params({});

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
      const res: AxiosResponse = await graphql
        .query("queryServiceLogs")
        .params({ condition: this.conditions });
      this.loadLogs = false;
      if (res.data.errors) {
        return res.data;
      }

      this.logs = res.data.data.queryLogs.logs;
      this.logsTotal = res.data.data.queryLogs.total;
      return res.data;
    },
    async getBrowserLogs() {
      this.loadLogs = true;
      const res: AxiosResponse = await graphql
        .query("queryBrowserErrorLogs")
        .params({ condition: this.conditions });

      this.loadLogs = false;
      if (res.data.errors) {
        return res.data;
      }
      this.logs = res.data.data.queryBrowserErrorLogs.logs;
      this.logsTotal = res.data.data.queryBrowserErrorLogs.total;
      return res.data;
    },
  },
});

export function useLogStore(): any {
  return logStore(store);
}
