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
import { useAppStoreWithOut } from "@/store/modules/app";
import dateFormatStep from "@/utils/dateFormat";
import getLocalTime from "@/utils/localtime";

export default function associateProcessor() {
  function eventAssociate(props: any) {
    if (!props.filters) {
      return;
    }
    if (!props.filters.duration) {
      return props.option;
    }
    if (!props.option.series[0]) {
      return;
    }
    const list = props.option.series[0].data.map(
      (d: (number | string)[]) => d[0]
    );
    if (!list.includes(props.filters.duration.endTime)) {
      return;
    }
    const markArea = {
      silent: true,
      itemStyle: {
        opacity: 0.3,
      },
      data: [
        [
          {
            xAxis: props.filters.duration.startTime,
          },
          {
            xAxis: props.filters.duration.endTime,
          },
        ],
      ],
    };
    const series = (window as any).structuredClone(props.option.series);
    for (const [key, temp] of series.entries()) {
      if (key === 0) {
        temp.markArea = markArea;
      }
    }
    const options = {
      ...props.option,
      series,
    };
    return options;
  }
  function traceFilters(currentParams: any) {
    const appStore = useAppStoreWithOut();

    if (!currentParams.value) {
      return;
    }
    const start = appStore.intervalUnix[currentParams.value.dataIndex];
    const end = start;
    const { step } = appStore.durationRow;
    const item = {
      duration: {
        start: dateFormatStep(
          getLocalTime(appStore.utc, new Date(start)),
          step,
          true
        ),
        end: dateFormatStep(
          getLocalTime(appStore.utc, new Date(end)),
          step,
          true
        ),
        step,
      },
    };
    return item;
  }
  return { eventAssociate, traceFilters };
}
