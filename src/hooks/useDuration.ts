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
import { useAppStoreWithOut, InitializationDurationRow } from "@/store/modules/app";
import type { Duration, DurationTime } from "@/types/app";
import getLocalTime from "@/utils/localtime";
import dateFormatStep from "@/utils/dateFormat";

export function useDuration() {
  let durationRow: Duration = InitializationDurationRow;

  function getDuration() {
    const appStore = useAppStoreWithOut();
    return {
      start: getLocalTime(appStore.utc, durationRow.start),
      end: getLocalTime(appStore.utc, durationRow.end),
      step: durationRow.step,
    };
  }
  function getDurationTime(): DurationTime {
    const { start, step, end } = getDuration();
    return {
      start: dateFormatStep(start, step, true),
      end: dateFormatStep(end, step, true),
      step: step,
    };
  }
  function setDurationRow(data: Duration) {
    durationRow = data;
  }
  function getMaxRange(day: number) {
    if (day === -1) {
      return [];
    }
    const gap = (day + 1) * 24 * 60 * 60 * 1000;
    const dates: Date[] = [new Date(new Date().getTime() - gap), new Date()];

    return dates;
  }

  return { setDurationRow, getDurationTime, getMaxRange };
}
