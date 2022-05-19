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
import { store } from "@/store";
import graphql from "@/graphql";
import { AxiosResponse } from "axios";
import { Event, QueryEventCondition } from "@/types/events";
import { Instance, Endpoint, Service } from "@/types/selector";
import { useAppStoreWithOut } from "@/store/modules/app";

interface eventState {
  loading: boolean;
  events: Event[];
  services: Service[];
  instances: Instance[];
  endpoints: Endpoint[];
  condition: QueryEventCondition | any;
}

export const eventStore = defineStore({
  id: "event",
  state: (): eventState => ({
    loading: false,
    events: [],
    services: [{ value: "", label: "All" }],
    instances: [{ value: "", label: "All" }],
    endpoints: [{ value: "", label: "All" }],
    condition: {
      paging: { pageNum: 1, pageSize: 15 },
    },
  }),
  actions: {
    setEventCondition(data: any) {
      this.condition = { ...this.condition, ...data };
    },
    async getServices(layer: string) {
      if (!layer) {
        this.services = [{ value: "", label: "All" }];
        return new Promise((resolve) => resolve([]));
      }
      const res: AxiosResponse = await graphql.query("queryServices").params({
        layer,
      });
      if (res.data.errors) {
        return res.data;
      }
      this.services = res.data.data.services;
      return res.data;
    },
    async getInstances(serviceId: string) {
      const res: AxiosResponse = await graphql.query("queryInstances").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
      });

      if (res.data.errors) {
        return res.data;
      }
      this.instances = [{ value: "", label: "All" }, ...res.data.data.pods] || [
        { value: "", label: "All" },
      ];
      return res.data;
    },
    async getEndpoints(serviceId: string) {
      const res: AxiosResponse = await graphql.query("queryEndpoints").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
        keyword: "",
      });
      if (res.data.errors) {
        return res.data;
      }
      this.endpoints = [{ value: "", label: "All" }, ...res.data.data.pods] || [
        { value: "", label: "All" },
      ];
      return res.data;
    },
    async getEvents() {
      this.loading = true;
      const res: AxiosResponse = await graphql.query("queryEvents").params({
        condition: {
          ...this.condition,
          time: useAppStoreWithOut().durationTime,
        },
      });
      this.loading = false;
      if (res.data.errors) {
        return res.data;
      }
      if (res.data.data.fetchEvents) {
        this.events = (res.data.data.fetchEvents.events || []).map(
          (item: Event) => {
            let scope = "Service";
            if (item.source.serviceInstance) {
              scope = "ServiceInstance";
            }
            if (item.source.endpoint) {
              scope = "Endpoint";
            }
            item.scope = scope;
            return item;
          }
        );
      }
      return res.data;
    },
  },
});

export function useEventStore(): any {
  return eventStore(store);
}
