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
import { ElMessage } from "element-plus";

export function useQueryProcessor(
  config: any,
  selectorStore: any,
  dashboardStore: any,
  durationTime: Duration
) {
  if (!(config.metrics && config.metrics.length)) {
    return;
  }
  const conditions: { [key: string]: unknown } = {
    duration: durationTime,
  };
  const variables: string[] = [`$duration: Duration!`];
  const { currentPod, currentService, currentDestPod, currentDestService } =
    selectorStore;
  const { normal, destNormal, entity } = dashboardStore;
  const isRelation = [
    "ServiceRelation",
    "ServiceInstanceRelation",
    "EndpointRelation",
  ].includes(entity);
  const fragment = config.metrics.map((name: string, index: number) => {
    const metricTypes = config.metricTypes[index] || "";
    // const labels = config.metricType === 'LABELED_VALUE' ? labelsIndex : undefined;
    if (["readSampledRecords", "sortMetrics"].includes(metricTypes)) {
      variables.push(`$condition${index}: TopNCondition!`);
      conditions[`condition${index}`] = {
        name,
        parentService: entity === "All" ? null : currentService,
        normal: normal,
        scope: entity,
        topN: Number(config.standard.maxItemNum || 10),
        order: config.standard.sortOrder || "DES",
      };
    } else {
      variables.push(`$condition${index}: MetricsCondition!`);
      conditions[`condition${index}`] = {
        name,
        entity: {
          scope: entity,
          serviceName: entity === "All" ? undefined : currentService,
          normal: true,
          serviceInstanceName: entity.includes("ServiceInstance")
            ? currentPod
            : undefined,
          endpointName: entity.includes("Endpoint") ? currentPod : undefined,
          destNormal: entity === "All" ? undefined : destNormal,
          destServiceName: isRelation ? currentDestService : undefined,
          destServiceInstanceName:
            entity === "ServiceInstanceRelation" ? currentDestPod : undefined,
          destEndpointName:
            entity === "EndpointRelation" ? currentDestPod : undefined,
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
export function useSourceProcessor(
  resp: { errors: string; data: { [key: string]: any } },
  config: { metrics: string[] }
) {
  const source: { [key: string]: unknown } = {};
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return {};
  }
  const keys = Object.keys(resp.data);
  keys.forEach((key: string, index) => {
    const m = config.metrics[index];
    source[m] = resp.data[key].values.values.map(
      (d: { value: number }) => d.value
    );
  });

  return source;
}
