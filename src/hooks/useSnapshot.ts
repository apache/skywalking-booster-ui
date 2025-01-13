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
import type { MetricsResults } from "@/types/dashboard";

export function useSnapshot(metrics: { name: string; results: MetricsResults[] }[]) {
  function processResults() {
    const sources = metrics.map((metric: { name: string; results: MetricsResults[] }) => {
      const values = metric.results.map(
        (r: { values: { value: string }[]; metric: { labels: { key: string; value: string }[] } }) => {
          const arr = r.values.map((v: { value: string }) => Number(v.value));
          if (!r.metric.labels.length) {
            return { values: arr };
          }
          const name = r.metric.labels
            .map(
              (label: { key: string; value: string }) =>
                `${metric.name}${label ? "{" : ""}${label.key}=${label.value}${label ? "}" : ""}`,
            )
            .join(",");
          return { name, values: arr };
        },
      );

      return { name: metric.name, values };
    });

    return sources;
  }

  return {
    processResults,
  };
}
