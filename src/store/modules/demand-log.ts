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
import { Instance } from "@/types/selector";
import { store } from "@/store";
import graphql from "@/graphql";
import { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";

interface DemandLogState {
  containers: Instance[];
  instances: Instance[];
  conditions: any;
  selectorStore: any;
  logs: any[];
  loadLogs: boolean;
}

export const demandLogStore = defineStore({
  id: "demandLog",
  state: (): DemandLogState => ({
    containers: [{ value: "0", label: "All" }],
    instances: [{ value: "0", label: "All" }],
    conditions: {
      queryDuration: useAppStoreWithOut().durationTime,
      paging: { pageNum: 1, pageSize: 15 },
    },
    selectorStore: useSelectorStore(),
    logs: [],
    loadLogs: false,
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
      this.services = res.data.data.services;
      return res.data;
    },
    async getInstances(id: string) {
      const serviceId = this.selectorStore.currentService
        ? this.selectorStore.currentService.id
        : id;
      const res: AxiosResponse = await graphql.query("queryInstances").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
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
    async getLogs() {
      this.loadLogs = true;
      const res: AxiosResponse = await graphql
        .query("queryServiceLogs")
        .params({ condition: this.conditions });
      this.loadLogs = false;
      if (res.data.errors) {
        return res.data;
      }

      this.logs = res.data.data.queryLogs.logs;
      return res.data;
    },
  },
});

export function useDemandLogStore(): any {
  return demandLogStore(store);
}
