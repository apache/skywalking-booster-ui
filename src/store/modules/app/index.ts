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
import { Duration, DurationTime } from "@/types/app";
import getLocalTime from "@/utils/localtime";
import getDurationRow from "@/utils/dateTime";
import dateFormatStep, { dateFormatTime } from "@/utils/dateFormat";

interface AppState {
  durationRow: any;
  utc: string;
  utcHour: number;
  utcMin: number;
}

export const appStore = defineStore({
  id: "app",
  state: (): AppState => ({
    durationRow: getDurationRow(),
    utc: "",
    utcHour: 0,
    utcMin: 0,
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
    intervalTime(): string[] {
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
      const utcArr = this.utc.split(":");
      const utcHour = isNaN(Number(utcArr[0])) ? 0 : Number(utcArr[0]);
      const utcMin = isNaN(Number(utcArr[1])) ? 0 : Number(utcArr[1]);
      const utcSpace =
        (utcHour + new Date().getTimezoneOffset() / 60) * 3600000 +
        utcMin * 60000;
      const startUnix: number = this.duration.start.getTime();
      const endUnix: number = this.duration.end.getTime();
      const timeIntervals: string[] = [];
      for (let i = 0; i <= endUnix - startUnix; i += interval) {
        const temp: string = dateFormatTime(
          new Date(startUnix + i - utcSpace),
          this.duration.step
        );
        timeIntervals.push(temp);
      }
      return timeIntervals;
    },
  },
  actions: {
    setDuration(data: Duration) {
      this.durationRow = data;
    },
    setUTC(utcHour: number, utcMin: number) {
      this.utcMin = utcMin;
      this.utcHour = utcHour;
      this.utc = `${utcHour}:${utcMin}`;
      localStorage.setItem("utc", this.utc);
    },
  },
});
export function useAppStoreWithOut() {
  return appStore(store);
}
