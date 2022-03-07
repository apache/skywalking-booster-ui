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
import { store } from "@/store";
import graphql from "@/graphql";
import { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";

interface LogState {
  services: Service[];
  instances: Instance[];
  endpoints: Endpoint[];
  conditions: any;
  durationTime: Duration;
  selectorStore: any;
  supportQueryLogsByKeywords: boolean;
  logs: any[];
  logsTotal: number;
}

export const logStore = defineStore({
  id: "trace",
  state: (): LogState => ({
    services: [{ value: "0", label: "All" }],
    instances: [{ value: "0", label: "All" }],
    endpoints: [{ value: "0", label: "All" }],
    conditions: {
      queryDuration: useAppStoreWithOut().durationTime,
      paging: { pageNum: 1, pageSize: 15, needTotal: true },
    },
    supportQueryLogsByKeywords: true,
    durationTime: useAppStoreWithOut().durationTime,
    selectorStore: useSelectorStore(),
    logs: [],
    logsTotal: 0,
  }),
  actions: {
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
      this.services = [
        { value: "0", label: "All" },
        ...res.data.data.services,
      ] || [{ value: "0", label: "All" }];
      return res.data;
    },
    async getInstances() {
      const res: AxiosResponse = await graphql.query("queryInstances").params({
        serviceId: this.selectorStore.currentService.id,
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
    async getEndpoints() {
      const res: AxiosResponse = await graphql.query("queryEndpoints").params({
        serviceId: this.selectorStore.currentService.id,
        duration: this.durationTime,
        keyword: "",
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
    async queryLogsByKeywords() {
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
      const res: AxiosResponse = await graphql
        .query("queryServiceLogs")
        .params({ condition: this.conditions });

      if (res.data.errors) {
        return res.data;
      }
      this.logs = res.data.data.queryLogs.logs;
      this.logsTotal = res.data.data.queryLogs.total;
      return res.data;
    },
    async getBrowserLogs() {
      const res: AxiosResponse = await graphql
        .query("queryBrowserErrorLogs")
        .params({ condition: this.conditions });

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
