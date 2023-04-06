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
import type { Instance } from "@/types/selector";
import { store } from "@/store";
import graphql from "@/graphql";
import type { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import type { Conditions, Log } from "@/types/demand-log";

interface DemandLogState {
  containers: Instance[];
  instances: Instance[];
  conditions: Conditions;
  selectorStore: Recordable;
  logs: Log[];
  loadLogs: boolean;
  message: string;
  total: number;
}

export const demandLogStore = defineStore({
  id: "demandLog",
  state: (): DemandLogState => ({
    containers: [{ label: "", value: "" }],
    instances: [{ value: "", label: "" }],
    conditions: {
      container: "",
      serviceInstanceId: "",
      duration: useAppStoreWithOut().durationTime,
    },
    selectorStore: useSelectorStore(),
    logs: [],
    loadLogs: false,
    message: "",
    total: 0,
  }),
  actions: {
    setLogCondition(data: Conditions) {
      this.conditions = { ...this.conditions, ...data };
    },
    setLogs(logs: Log[], message?: string) {
      this.logs = logs;
      this.message = message || "";
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
      this.instances = res.data.data.pods || [];
      return res.data;
    },
    async getContainers(serviceInstanceId: string) {
      if (!serviceInstanceId) {
        return new Promise((resolve) => resolve({ errors: "No service instance" }));
      }
      const condition = {
        serviceInstanceId,
      };
      const res: AxiosResponse = await graphql.query("fetchContainers").params({ condition });

      if (res.data.errors) {
        return res.data;
      }
      if (res.data.data.containers.errorReason) {
        this.containers = [{ label: "", value: "" }];
        return res.data;
      }
      this.containers = res.data.data.containers.containers.map((d: string) => {
        return { label: d, value: d };
      });
      return res.data;
    },
    async getDemandLogs() {
      this.loadLogs = true;
      const res: AxiosResponse = await graphql.query("fetchDemandPodLogs").params({ condition: this.conditions });
      this.loadLogs = false;
      if (res.data.errors) {
        return res.data;
      }
      if (res.data.data.logs.errorReason) {
        this.setLogs([], res.data.data.logs.errorReason);
        return res.data;
      }
      this.total = res.data.data.logs.logs.length;
      const logs = res.data.data.logs.logs.map((d: Log) => d.content).join("\n");
      this.setLogs(logs);
      return res.data;
    },
  },
});

export function useDemandLogStore(): Recordable {
  return demandLogStore(store);
}
