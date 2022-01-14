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
import { store } from "@/store";
import graph from "@/graph";
import { AxiosResponse } from "axios";

interface SelectorState {
  services: Option[];
}

export const selectorStore = defineStore({
  id: "selector",
  state: (): SelectorState => ({
    services: [],
  }),
  actions: {
    async fetchLayers(): Promise<AxiosResponse> {
      const res: AxiosResponse = await graph.query("queryLayers").params({});

      return res.data || {};
    },
    async fetchServices(layer: string): Promise<AxiosResponse> {
      const res: AxiosResponse = await graph
        .query("queryServices")
        .params({ layer });

      if (!res.data.errors) {
        this.services = res.data.data.services;
      }
      return res.data;
    },
    async getServiceInstances(params: {
      serviceId: string;
      duration: Duration;
    }): Promise<AxiosResponse> {
      const res: AxiosResponse = await graph
        .query("queryInstances")
        .params(params);
      return res;
    },
    async getEndpoints(params: {
      keyword: string;
      serviceId: string;
    }): Promise<AxiosResponse> {
      if (!params.keyword) {
        params.keyword = "";
      }
      const res: AxiosResponse = await graph
        .query("queryEndpoints")
        .params(params);
      return res;
    },
  },
});

export function useSelectorStore(): any {
  return selectorStore(store);
}
