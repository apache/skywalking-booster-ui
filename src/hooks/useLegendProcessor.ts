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
import type { LegendOptions } from "@/types/dashboard";
import { isDef } from "@/utils/is";

export default function useLegendProcess(legend?: LegendOptions) {
  let isRight = false;
  if (legend && legend.toTheRight) {
    isRight = true;
  }
  function showEchartsLegend(keys: string[]) {
    if (legend && isDef(legend.show)) {
      if (legend.asTable && legend.show) {
        return false;
      }
      return legend.show;
    }
    if (keys.length === 1) {
      return false;
    }
    if (legend && legend.asTable) {
      return false;
    }
    return true;
  }
  function aggregations(data: { [key: string]: number[] }, intervalTime: string[]) {
    const source: { [key: string]: unknown }[] = [];
    const keys = Object.keys(data || {}).filter((i: string) => Array.isArray(data[i]) && data[i].length);
    const headers = [];

    for (const [key, value] of keys.entries()) {
      const arr = JSON.parse(JSON.stringify(data[value]));
      const item: { [key: string]: unknown } = {
        name: value,
        topN: arr
          .map((d: number, index: number) => {
            return {
              key: intervalTime[index],
              value: d,
            };
          })
          .sort((a: { key: string; value: number }, b: { key: string; value: number }) => b.value - a.value)
          .filter((_: unknown, index: number) => index < 10),
      };
      if (legend) {
        if (legend.min) {
          item.min = Math.min(...data[value]).toFixed(2);
          if (key === 0) {
            headers.push({ value: "min", label: "Min" });
          }
        }
        if (legend.max) {
          item.max = Math.max(...data[value]).toFixed(2);
          if (key === 0) {
            headers.push({ value: "max", label: "Max" });
          }
        }
        if (legend.mean) {
          const total = data[value].reduce((prev: number, next: number) => {
            prev += Number(next);
            return prev;
          }, 0);
          item.mean = (total / data[value].length).toFixed(4);
          if (key === 0) {
            headers.push({ value: "mean", label: "Mean" });
          }
        }
        if (legend.total) {
          item.total = data[value]
            .reduce((prev: number, next: number) => {
              prev += Number(next);
              return prev;
            }, 0)
            .toFixed(2);
          if (key === 0) {
            headers.push({ value: "total", label: "Total" });
          }
        }
      }
      source.push(item);
    }

    return { source, headers };
  }
  function chartColors(keys: string[]) {
    let color: string[] = [];
    switch (keys.length) {
      case 2:
        color = ["#FF6A84", "#a0b1e6"];
        break;
      case 1:
        color = ["#3f96e3"];
        break;
      default:
        color = [
          "#30A4EB",
          "#45BFC0",
          "#FFCC55",
          "#FF6A84",
          "#a0a7e6",
          "#c23531",
          "#2f4554",
          "#61a0a8",
          "#d48265",
          "#91c7ae",
          "#749f83",
          "#ca8622",
          "#bda29a",
          "#6e7074",
          "#546570",
          "#c4ccd3",
        ];
        break;
    }
    return color;
  }
  return { showEchartsLegend, isRight, aggregations, chartColors };
}
