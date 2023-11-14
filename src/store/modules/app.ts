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
import type { Duration, DurationTime } from "@/types/app";
import getLocalTime from "@/utils/localtime";
import type { AxiosResponse } from "axios";
import dateFormatStep, { dateFormatTime } from "@/utils/dateFormat";
import { TimeType } from "@/constants/data";
import type { MenuOptions, SubItem } from "@/types/app";
import { Themes } from "@/constants/data";
/*global Nullable*/
interface AppState {
  durationRow: Recordable;
  utc: string;
  utcHour: number;
  utcMin: number;
  eventStack: (() => unknown)[];
  timer: Nullable<TimeoutHandle>;
  autoRefresh: boolean;
  version: string;
  isMobile: boolean;
  reloadTimer: Nullable<IntervalHandle>;
  allMenus: MenuOptions[];
  theme: string;
}

export const appStore = defineStore({
  id: "app",
  state: (): AppState => ({
    durationRow: {
      start: new Date(new Date().getTime() - 1800000),
      end: new Date(),
      step: TimeType.MINUTE_TIME,
    },
    utc: "",
    utcHour: 0,
    utcMin: 0,
    eventStack: [],
    timer: null,
    autoRefresh: false,
    version: "",
    isMobile: false,
    reloadTimer: null,
    allMenus: [],
    theme: Themes.Dark,
  }),
  getters: {
    duration(): Duration {
      return {
        start: getLocalTime(this.utc, this.durationRow.start),
        end: getLocalTime(this.utc, this.durationRow.end),
        step: this.durationRow.step,
      };
    },
    durationTime(): DurationTime {
      return {
        start: dateFormatStep(this.duration.start, this.duration.step, true),
        end: dateFormatStep(this.duration.end, this.duration.step, true),
        step: this.duration.step,
      };
    },
    intervalUnix(): number[] {
      let interval = 946080000000;
      switch (this.duration.step) {
        case "MINUTE":
          interval = 60000;
          break;
        case "HOUR":
          interval = 3600000;
          break;
        case "DAY":
          interval = 86400000;
          break;
        case "MONTH":
          interval =
            (this.duration.end.getTime() - this.duration.start.getTime()) /
            (this.duration.end.getFullYear() * 12 +
              this.duration.end.getMonth() -
              this.duration.start.getFullYear() * 12 -
              this.duration.start.getMonth());
          break;
      }
      const utcSpace = (this.utcHour + new Date().getTimezoneOffset() / 60) * 3600000 + this.utcMin * 60000;
      const startUnix: number = this.duration.start.getTime();
      const endUnix: number = this.duration.end.getTime();
      const timeIntervals: number[] = [];
      for (let i = 0; i <= endUnix - startUnix; i += interval) {
        timeIntervals.push(startUnix + i - utcSpace);
      }
      return timeIntervals;
    },
    intervalTime(): string[] {
      const arr = this.intervalUnix;
      const timeIntervals: string[] = [];
      for (const item of arr) {
        const temp: string = dateFormatTime(new Date(item), this.duration.step);
        timeIntervals.push(temp);
      }
      return timeIntervals;
    },
  },
  actions: {
    setDuration(data: Duration): void {
      this.durationRow = data;
      if ((window as any).axiosCancel.length !== 0) {
        for (const event of (window as any).axiosCancel) {
          setTimeout(event(), 0);
        }
        (window as any).axiosCancel = [];
      }
      this.runEventStack();
    },
    updateDurationRow(data: Duration) {
      this.durationRow = data;
    },
    setTheme(data: string) {
      this.theme = data;
    },
    setUTC(utcHour: number, utcMin: number): void {
      this.runEventStack();
      this.utcMin = utcMin;
      this.utcHour = utcHour;
      this.utc = `${utcHour}:${utcMin}`;
    },
    updateUTC(data: string) {
      this.utc = data;
    },
    setIsMobile(mode: boolean) {
      this.isMobile = mode;
    },
    setEventStack(funcs: (() => void)[]): void {
      this.eventStack = funcs;
    },
    setAutoRefresh(auto: boolean) {
      this.autoRefresh = auto;
    },
    runEventStack() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(
        () =>
          this.eventStack.forEach((event: Function) => {
            setTimeout(event(), 0);
          }),
        500,
      );
    },
    async getActivateMenus() {
      const resp = (await this.queryMenuItems()) || {};

      this.allMenus = (resp.getMenuItems || []).map((d: MenuOptions, index: number) => {
        const t = `${d.title.replace(/\s+/g, "-")}`;
        d.name = `${t}-${index}`;
        d.path = `/${t}`;
        d.descKey = `${d.i18nKey}_desc`;
        if (d.subItems && d.subItems.length) {
          d.hasGroup = true;
          d.subItems = d.subItems.map((item: SubItem, sub: number) => {
            const id = `${item.title.replace(/\s+/g, "-")}`;
            item.name = `${id}-${index}${sub}`;
            item.path = `/${t}/${id}`;
            item.descKey = `${item.i18nKey}_desc`;
            return item;
          });
        }

        return d;
      });
    },
    async queryOAPTimeInfo() {
      const res: AxiosResponse = await graphql.query("queryOAPTimeInfo").params({});
      if (res.data.errors) {
        this.utc = -(new Date().getTimezoneOffset() / 60) + ":0";
      } else {
        this.utc = res.data.data.getTimeInfo.timezone / 100 + ":0";
      }
      const utcArr = this.utc.split(":");
      this.utcHour = isNaN(Number(utcArr[0])) ? 0 : Number(utcArr[0]);
      this.utcMin = isNaN(Number(utcArr[1])) ? 0 : Number(utcArr[1]);

      return res.data;
    },
    async fetchVersion(): Promise<void> {
      const res: AxiosResponse = await graphql.query("queryOAPVersion").params({});
      if (res.data.errors) {
        return res.data;
      }
      this.version = res.data.data.version;
      return res.data;
    },
    async queryMenuItems() {
      const res: AxiosResponse = await graphql.query("queryMenuItems").params({});
      if (res.data.errors) {
        return res.data;
      }

      return res.data.data;
    },
    setReloadTimer(timer: IntervalHandle) {
      this.reloadTimer = timer;
    },
  },
});
export function useAppStoreWithOut(): Recordable {
  return appStore(store);
}
