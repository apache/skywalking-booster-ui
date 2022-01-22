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
import { Option, Duration } from "@/types/app";
import { Service } from "@/types/selector";
import { store } from "@/store";
import graph from "@/graph";
import { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";

interface SelectorState {
  services: Service[];
  instances: Option[];
  pods: Option[];
  endpoints: Option[];
  currentService: Nullable<Service>;
  currentPod: string;
  currentDestService: Nullable<Service>;
  currentDestPod: string;
  durationTime: Duration;
}

export const selectorStore = defineStore({
  id: "selector",
  state: (): SelectorState => ({
    services: [],
    instances: [],
    pods: [],
    endpoints: [],
    currentService: null,
    currentPod: "",
    currentDestService: null,
    currentDestPod: "",
    durationTime: useAppStoreWithOut().durationTime,
  }),
  actions: {
    setCurrentService(service: Service) {
      this.currentService = service;
    },
    setCurrentPod(pod: string) {
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
        this.currentService = this.services.length ? this.services[0] : null;
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
        this.instances = res.data.data.pods || [];
        this.pods = this.instances;
        this.currentPod = this.pods.length ? this.pods[0].value : "";
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
        this.endpoints = res.data.data.pods || [];
        this.pods = this.endpoints;
        this.currentPod = this.pods.length ? this.pods[0].value : "";
      }
      return res.data;
    },
  },
});

export function useSelectorStore(): any {
  return selectorStore(store);
}
