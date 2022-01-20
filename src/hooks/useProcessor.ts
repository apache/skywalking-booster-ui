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
import { Duration } from "@/types/app";
import { RespFields } from "./data";

export function useQueryProcessor(
  config: any,
  selectorStore: any,
  dashboardStore: any,
  durationTime: Duration
) {
  if (!(config.metrics && config.metrics.length)) {
    return;
  }
  const conditions: any = {
    duration: durationTime,
  };
  const variables: string[] = [`$duration: Duration!`];
  const { currentPod, currentService, currentDestPod, currentDestService } =
    selectorStore;
  const isRelation = [
    "ServiceRelation",
    "ServiceInstanceRelation",
    "EndpointRelation",
  ].includes(dashboardStore.entity);
  const fragment = config.metrics.map((name: string, index: number) => {
    const metricTypes = config.metricTypes[index] || "";
    if (["readSampledRecords", "sortMetrics"].includes(metricTypes)) {
      variables.push(`$condition${index}: TopNCondition!`);
      conditions[`condition${index}`] = {
        name,
        parentService: currentService,
        normal: true,
        scope: dashboardStore.entity,
        topN: Number(config.standard.maxItemNum || 10),
        order: config.standard.sortOrder || "DES",
      };
    } else {
      variables.push(`$condition${index}: MetricsCondition!`);
      conditions[`condition${index}`] = {
        name,
        entity: {
          scope: dashboardStore.entity,
          serviceName: currentService,
          normal: true,
          serviceInstanceName: dashboardStore.entity.includes("ServiceInstance")
            ? currentPod
            : undefined,
          endpointName: dashboardStore.entity.includes("Endpoint")
            ? currentPod
            : undefined,
          destNormal: true,
          destServiceName: isRelation ? currentDestService : undefined,
          destServiceInstanceName:
            dashboardStore.entity === "ServiceInstanceRelation"
              ? currentDestPod
              : undefined,
          destEndpointName:
            dashboardStore.entity === "EndpointRelation"
              ? currentDestPod
              : undefined,
        },
      };
    }

    return `${name}${index}: ${metricTypes}(condition: $condition${index}, duration: $duration)${RespFields[metricTypes]}`;
  });
  const queryStr = `query queryData(${variables}) {${fragment}}`;
  return {
    queryStr,
    conditions,
  };
}
// export function useSourceProcessor() {
// }
