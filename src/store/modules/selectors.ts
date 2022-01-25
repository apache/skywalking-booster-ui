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
import { Service, Instance, Endpoint } from "@/types/selector";
import { store } from "@/store";
import graph from "@/graph";
import { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";

interface SelectorState {
  services: Service[];
  pods: Array<Instance | Endpoint>;
  currentService: Nullable<Service>;
  currentPod: Nullable<Instance | Endpoint>;
  currentDestService: Nullable<Service>;
  currentDestPod: Nullable<Instance | Endpoint>;
  durationTime: Duration;
}

export const selectorStore = defineStore({
  id: "selector",
  state: (): SelectorState => ({
    services: [],
    pods: [],
    currentService: null,
    currentPod: null,
    currentDestService: null,
    currentDestPod: null,
    durationTime: useAppStoreWithOut().durationTime,
  }),
  actions: {
    setCurrentService(service: Service) {
      this.currentService = service;
    },
    setCurrentPod(pod: Nullable<Instance | Endpoint>) {
      console.log(pod);
      this.currentPod = pod;
    },
    async fetchLayers(): Promise<AxiosResponse> {
      const res: AxiosResponse = await graph.query("queryLayers").params({});

      return res.data || {};
    },
    async fetchServices(layer: string): Promise<AxiosResponse> {
      const res: AxiosResponse = await graph
        .query("queryServices")
        .params({ layer });

      if (!res.data.errors) {
        this.services = res.data.data.services || [];
      }
      return res.data;
    },
    async getServiceInstances(param?: {
      serviceId: string;
    }): Promise<Nullable<AxiosResponse>> {
      const serviceId = param ? param.serviceId : this.currentService?.id;
      if (!serviceId) {
        return null;
      }
      const res: AxiosResponse = await graph.query("queryInstances").params({
        serviceId,
        duration: this.durationTime,
      });
      if (!res.data.errors) {
        this.pods = res.data.data.pods || [];
      }
      return res.data;
    },
    async getEndpoints(params?: {
      keyword?: string;
      serviceId?: string;
    }): Promise<Nullable<AxiosResponse>> {
      if (!params) {
        params = {};
      }
      if (!params.keyword) {
        params.keyword = "";
      }
      const serviceId = params.serviceId || this.currentService?.id;
      if (!serviceId) {
        return null;
      }
      const res: AxiosResponse = await graph.query("queryEndpoints").params({
        serviceId,
        duration: this.durationTime,
        keyword: params.keyword,
      });
      if (!res.data.errors) {
        this.pods = res.data.data.pods || [];
      }
      return res.data;
    },
    async getService(serviceId: string) {
      if (!serviceId) {
        return;
      }
      const res: AxiosResponse = await graph.query("queryService").params({
        serviceId,
      });
      if (!res.data.errors) {
        this.currentService = res.data.data.service || {};
      }

      return res.data;
    },
    async getInstance(instanceId: string) {
      if (!instanceId) {
        return;
      }
      const res: AxiosResponse = await graph.query("queryInstance").params({
        instanceId,
      });
      if (!res.data.errors) {
        this.currentPod = res.data.data.instance || null;
      }

      return res.data;
    },
    async getEndpoint(endpointId: string) {
      if (!endpointId) {
        return;
      }
      const res: AxiosResponse = await graph.query("queryEndpoint").params({
        endpointId,
      });
      if (!res.data.errors) {
        this.currentPod = res.data.data.endpoint || null;
      }

      return res.data;
    },
  },
});

export function useSelectorStore(): any {
  return selectorStore(store);
}
