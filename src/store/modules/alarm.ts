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
import type { AxiosResponse } from "axios";
import type { Alarm } from "@/types/alarm";
import { useAppStoreWithOut } from "@/store/modules/app";

interface AlarmState {
  loading: boolean;
  alarms: Alarm[];
  total: number;
}

export const alarmStore = defineStore({
  id: "alarm",
  state: (): AlarmState => ({
    loading: false,
    alarms: [],
    total: 0,
  }),
  actions: {
    async getAlarms(params: Recordable) {
      const res: AxiosResponse = await graphql.query("queryAlarms").params(params);
      if (res.data.errors) {
        return res.data;
      }
      if (res.data.data.getAlarm.items) {
        this.alarms = res.data.data.getAlarm.items;
        this.total = res.data.data.getAlarm.total;
      }
      return res.data;
    },
    async getAlarmTagKeys() {
      const res: AxiosResponse = await graphql
        .query("queryAlarmTagKeys")
        .params({ duration: useAppStoreWithOut().durationTime });

      return res.data;
    },
    async getAlarmTagValues(tagKey: string) {
      const res: AxiosResponse = await graphql
        .query("queryAlarmTagValues")
        .params({ tagKey, duration: useAppStoreWithOut().durationTime });

      return res.data;
    },
  },
});

export function useAlarmStore(): Recordable {
  return alarmStore(store);
}
