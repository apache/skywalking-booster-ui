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
import { Option } from "@/types/app";
import { Instance } from "@/types/selector";
import { store } from "@/store";
import graphql from "@/graphql";
import { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import { Conditions, DemandLog } from "@/types/demand-log";

interface DemandLogState {
  containers: Instance[];
  instances: Instance[];
  conditions: Conditions;
  selectorStore: any;
  logs: DemandLog[];
  loadLogs: boolean;
  namespaces: Option[];
}

export const demandLogStore = defineStore({
  id: "demandLog",
  state: (): DemandLogState => ({
    containers: [{ label: "Detail", value: "Detail" }],
    instances: [{ value: "", label: "" }],
    conditions: {
      namespace: "",
      container: "",
      serviceId: "",
      serviceInstanceId: "",
      queryDuration: useAppStoreWithOut().durationTime,
      paging: { pageNum: 1, pageSize: -1 },
    },
    selectorStore: useSelectorStore(),
    logs: [],
    loadLogs: false,
    namespaces: [],
  }),
  actions: {
    setLogCondition(data: Conditions) {
      this.conditions = { ...this.conditions, ...data };
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
      this.instances = res.data.data.pods || [];
      return res.data;
    },
    async getNamespaces() {
      const res: AxiosResponse = await graphql
        .query("fetchNamespaces")
        .params({});

      if (res.data.errors) {
        return res.data;
      }
      this.namespaces = (res.data.data.namespaces || []).map((d: string) => {
        return {
          label: d,
          value: d,
        };
      });
      return res.data;
    },
    async getContainers(namespace: string, serviceInstanceId: string) {
      if (!this.selectorStore.currentService) {
        return new Promise((resolve) => resolve({ errors: "No service" }));
      }
      const serviceId = this.selectorStore.currentService.id;
      const condition = {
        serviceId,
        serviceInstanceId,
        namespace,
      };
      const res: AxiosResponse = await graphql
        .query("fetchContainers")
        .params({ condition });

      if (res.data.errors) {
        return res.data;
      }
      this.containers =
        res.data.data.containers.containers.map((d: string) => {
          return { label: d, value: d };
        }) || [];
      return res.data;
    },
    async getDemandLogs() {
      this.loadLogs = true;
      const res: AxiosResponse = await graphql
        .query("fetchDemandPodLogs")
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
