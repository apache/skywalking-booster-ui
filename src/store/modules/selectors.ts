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
import type { Service, Instance, Endpoint, Process } from "@/types/selector";
import { store } from "@/store";
import graphql from "@/graphql";
import type { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";
interface SelectorState {
  services: Service[];
  destServices: Service[];
  pods: Array<Instance | Endpoint>;
  processes: Process[];
  destProcesses: Process[];
  currentService: Nullable<Service>;
  currentPod: Nullable<Instance | Endpoint>;
  currentProcess: Nullable<Process>;
  currentDestService: Nullable<Service>;
  currentDestPod: Nullable<Instance | Endpoint>;
  destPods: Array<Instance | Endpoint>;
  currentDestProcess: Nullable<Process>;
}

export const selectorStore = defineStore({
  id: "selector",
  state: (): SelectorState => ({
    services: [],
    destServices: [],
    pods: [],
    destPods: [],
    processes: [],
    destProcesses: [],
    currentService: null,
    currentPod: null,
    currentProcess: null,
    currentDestService: null,
    currentDestPod: null,
    currentDestProcess: null,
  }),
  actions: {
    setCurrentService(service: Nullable<Service>) {
      this.currentService = service;
    },
    setCurrentDestService(service: Nullable<Service>) {
      this.currentDestService = service;
    },
    setCurrentPod(pod: Nullable<Instance | Endpoint>) {
      this.currentPod = pod;
    },
    setCurrentDestPod(pod: Nullable<Instance | Endpoint>) {
      this.currentDestPod = pod;
    },
    setCurrentProcess(process: Nullable<Process>) {
      this.currentProcess = process;
    },
    setCurrentDestProcess(process: Nullable<Process>) {
      this.currentDestProcess = process;
    },
    setDestPods(pods: Array<Instance | Endpoint>) {
      this.destPods = pods;
    },
    setDestProcesses(processes: Array<Process>) {
      this.destProcesses = processes;
    },
    async fetchLayers(): Promise<AxiosResponse> {
      const res: AxiosResponse = await graphql.query("queryLayers").params({});

      return res.data || {};
    },
    async fetchServices(layer: string): Promise<AxiosResponse> {
      const res: AxiosResponse = await graphql.query("queryServices").params({ layer });

      if (!res.data.errors) {
        this.services = res.data.data.services || [];
        this.destServices = res.data.data.services || [];
      }
      return res.data;
    },
    async getServiceInstances(param?: { serviceId: string; isRelation: boolean }): Promise<Nullable<AxiosResponse>> {
      const serviceId = param ? param.serviceId : this.currentService?.id;
      if (!serviceId) {
        return null;
      }
      const res: AxiosResponse = await graphql.query("queryInstances").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
      });
      if (!res.data.errors) {
        if (param && param.isRelation) {
          this.destPods = res.data.data.pods || [];
          return res.data;
        }
        this.pods = res.data.data.pods || [];
      }
      return res.data;
    },
    async getProcesses(param?: { instanceId: string; isRelation: boolean }): Promise<Nullable<AxiosResponse>> {
      const instanceId = param ? param.instanceId : this.currentPod?.id;
      if (!instanceId) {
        return null;
      }
      const res: AxiosResponse = await graphql.query("queryProcesses").params({
        instanceId,
        duration: useAppStoreWithOut().durationTime,
      });
      if (!res.data.errors) {
        if (param && param.isRelation) {
          this.destProcesses = res.data.data.processes || [];
          return res.data;
        }
        this.processes = res.data.data.processes || [];
      }
      return res.data;
    },
    async getEndpoints(params: {
      keyword?: string;
      serviceId?: string;
      isRelation?: boolean;
      limit?: number;
    }): Promise<Nullable<AxiosResponse>> {
      if (!params) {
        params = {};
      }
      const serviceId = params.serviceId || this.currentService?.id;
      if (!serviceId) {
        return null;
      }
      const res: AxiosResponse = await graphql.query("queryEndpoints").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
        keyword: params.keyword || "",
        limit: params.limit,
      });
      if (!res.data.errors) {
        if (params.isRelation) {
          this.destPods = res.data.data.pods || [];
          return res.data;
        }
        this.pods = res.data.data.pods || [];
      }
      return res.data;
    },
    async getService(serviceId: string, isRelation: boolean) {
      if (!serviceId) {
        return;
      }
      const res: AxiosResponse = await graphql.query("queryService").params({
        serviceId,
      });
      if (!res.data.errors) {
        if (isRelation) {
          this.setCurrentDestService(res.data.data.service);
          this.destServices = [res.data.data.service];
          return res.data;
        }
        this.setCurrentService(res.data.data.service);
        this.services = [res.data.data.service];
      }

      return res.data;
    },
    async getInstance(instanceId: string, isRelation?: boolean) {
      if (!instanceId) {
        return;
      }
      const res: AxiosResponse = await graphql.query("queryInstance").params({
        instanceId,
      });
      if (!res.data.errors) {
        if (isRelation) {
          this.currentDestPod = res.data.data.instance || null;
          this.destPods = [res.data.data.instance];
          return res.data;
        }
        this.currentPod = res.data.data.instance || null;
        this.pods = [res.data.data.instance];
      }

      return res.data;
    },
    async getEndpoint(endpointId: string, isRelation?: string) {
      if (!endpointId) {
        return;
      }
      const res: AxiosResponse = await graphql.query("queryEndpoint").params({
        endpointId,
      });
      if (res.data.errors) {
        return res.data;
      }
      if (isRelation) {
        this.currentDestPod = res.data.data.endpoint || null;
        this.destPods = [res.data.data.endpoint];
        return res.data;
      }
      this.currentPod = res.data.data.endpoint || null;
      this.pods = [res.data.data.endpoint];
      return res.data;
    },
    async getProcess(processId: string, isRelation?: boolean) {
      if (!processId) {
        return;
      }
      const res: AxiosResponse = await graphql.query("queryProcess").params({
        processId,
      });
      if (!res.data.errors) {
        if (isRelation) {
          this.currentDestProcess = res.data.data.process || null;
          this.destProcesses = [res.data.data.process];
          return res.data;
        }
        this.currentProcess = res.data.data.process || null;
        this.processes = [res.data.data.process];
      }

      return res.data;
    },
  },
});

export function useSelectorStore(): Recordable {
  return selectorStore(store);
}
