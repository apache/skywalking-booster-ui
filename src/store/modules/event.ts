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
import type { Event, QueryEventCondition } from "@/types/events";
import type { Instance, Endpoint } from "@/types/selector";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import { EndpointsTopNDefault } from "../data";

interface eventState {
  loading: boolean;
  events: Event[];
  instances: Instance[];
  endpoints: Endpoint[];
  condition: Nullable<QueryEventCondition>;
}

export const eventStore = defineStore({
  id: "event",
  state: (): eventState => ({
    loading: false,
    events: [],
    instances: [{ value: "", label: "All" }],
    endpoints: [{ value: "", label: "All" }],
    condition: null,
  }),
  actions: {
    setEventCondition(data: QueryEventCondition) {
      this.condition = data;
    },
    async getInstances() {
      const serviceId = useSelectorStore().currentService ? useSelectorStore().currentService.id : "";
      const response = await graphql.query("queryInstances").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
      });

      if (response.errors) {
        return response;
      }
      this.instances = [{ value: "", label: "All" }, ...response.data.pods];
      return response;
    },
    async getEndpoints(keyword: string) {
      const serviceId = useSelectorStore().currentService ? useSelectorStore().currentService.id : "";
      if (!serviceId) {
        return;
      }
      const response = await graphql.query("queryEndpoints").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
        keyword: keyword || "",
        limit: EndpointsTopNDefault,
      });
      if (response.errors) {
        return response;
      }
      this.endpoints = [{ value: "", label: "All" }, ...response.data.pods];
      return response;
    },
    async getEvents() {
      this.loading = true;
      const response = await graphql.query("queryEvents").params({
        condition: {
          ...this.condition,
          time: useAppStoreWithOut().durationTime,
        },
      });
      this.loading = false;
      if (response.errors) {
        return response;
      }
      if (response.data.fetchEvents) {
        this.events = (response.data.fetchEvents.events || []).map((item: Event) => {
          let scope = "Service";
          if (item.source.serviceInstance) {
            scope = "ServiceInstance";
          }
          if (item.source.endpoint) {
            scope = "Endpoint";
          }
          item.scope = scope;
          if (!item.endTime || item.endTime === item.startTime) {
            item.endTime = Number(item.startTime) + 60000;
          }
          return item;
        });
      }
      return response;
    },
  },
});

export function useEventStore(): Recordable {
  return eventStore(store);
}
