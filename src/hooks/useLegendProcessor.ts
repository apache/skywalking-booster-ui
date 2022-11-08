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
import { LegendOptions } from "@/types/dashboard";

export default function useLegendProcess(legend?: LegendOptions) {
  let isRight = false;
  if (legend && legend.toTheRight) {
    isRight = true;
  }
  function showEchartsLegend(keys: string[]) {
    if (legend && !legend.show === undefined) {
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
  function aggregations(data: { [key: string]: number[] }) {
    const source: { [key: string]: unknown }[] = [];
    const keys = Object.keys(data);
    const headers = [];

    for (const [key, value] of keys.entries()) {
      const item: { [key: string]: unknown } = {
        name: value,
        linear: data[value],
      };
      if (legend) {
        if (legend.min) {
          item.min = Math.min(...data[value]);
          if (key === 0) {
            headers.push("min");
          }
        }
        if (legend.max) {
          item.max = Math.max(...data[value]);
          if (key === 0) {
            headers.push("max");
          }
        }
        if (legend.mean) {
          const total = data[value].reduce((prev: number, next: number) => {
            prev += next;
            return prev;
          }, 0);
          item.mean = total / data[value].length;
          if (key === 0) {
            headers.push("mean");
          }
        }
        if (legend.total) {
          item.total = data[value].reduce((prev: number, next: number) => {
            prev += next;
            return prev;
          }, 0);
          if (key === 0) {
            headers.push("total");
          }
        }
      }
      source.push(item);
    }

    return { source, headers };
  }
  return { showEchartsLegend, isRight, aggregations };
}
