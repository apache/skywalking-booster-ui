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
import { RespFields } from "./data";
import { ExpressionResultType } from "@/views/dashboard/data";
import { ElMessage } from "element-plus";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useSelectorStore } from "@/store/modules/selectors";
import { useAppStoreWithOut } from "@/store/modules/app";
import type { MetricConfigOpt } from "@/types/dashboard";

export function useExpressionsQueryProcessor(config: Indexable) {
  if (!(config.metrics && config.metrics[0])) {
    return;
  }
  if (!(config.metricTypes && config.metricTypes[0])) {
    return;
  }
  const appStore = useAppStoreWithOut();
  const dashboardStore = useDashboardStore();
  const selectorStore = useSelectorStore();

  if (!selectorStore.currentService && dashboardStore.entity !== "All") {
    return;
  }
  const conditions: Recordable = {
    duration: appStore.durationTime,
  };
  const variables: string[] = [`$duration: Duration!`];
  const isRelation = ["ServiceRelation", "ServiceInstanceRelation", "EndpointRelation", "ProcessRelation"].includes(
    dashboardStore.entity,
  );
  if (isRelation && !selectorStore.currentDestService) {
    return;
  }
  const fragment = config.metrics.map((name: string, index: number) => {
    variables.push(`$expression${index}: String!`, `$entity${index}: Entity!`);
    conditions[`expression${index}`] = name;
    const entity = {
      serviceName: dashboardStore.entity === "All" ? undefined : selectorStore.currentService.value,
      normal: dashboardStore.entity === "All" ? undefined : selectorStore.currentService.normal,
      serviceInstanceName: ["ServiceInstance", "ServiceInstanceRelation", "ProcessRelation"].includes(
        dashboardStore.entity,
      )
        ? selectorStore.currentPod && selectorStore.currentPod.value
        : undefined,
      endpointName: dashboardStore.entity.includes("Endpoint")
        ? selectorStore.currentPod && selectorStore.currentPod.value
        : undefined,
      processName: dashboardStore.entity.includes("Process")
        ? selectorStore.currentProcess && selectorStore.currentProcess.value
        : undefined,
      destNormal: isRelation ? selectorStore.currentDestService.normal : undefined,
      destServiceName: isRelation ? selectorStore.currentDestService.value : undefined,
      destServiceInstanceName: ["ServiceInstanceRelation", "ProcessRelation"].includes(dashboardStore.entity)
        ? selectorStore.currentDestPod && selectorStore.currentDestPod.value
        : undefined,
      destEndpointName:
        dashboardStore.entity === "EndpointRelation"
          ? selectorStore.currentDestPod && selectorStore.currentDestPod.value
          : undefined,
      destProcessName: dashboardStore.entity.includes("ProcessRelation")
        ? selectorStore.currentDestProcess && selectorStore.currentDestProcess.value
        : undefined,
    };
    conditions[`entity${index}`] = entity;

    return `expression${index}: execExpression(expression: $expression${index}, entity: $entity${index}, duration: $duration)${RespFields.execExpression}`;
  });
  const queryStr = `query queryData(${variables}) {${fragment}}`;

  return {
    queryStr,
    conditions,
  };
}

export function useExpressionsSourceProcessor(
  resp: { errors: string; data: Indexable },
  config: {
    metrics: string[];
    metricTypes: string[];
    metricConfig: MetricConfigOpt[];
  },
) {
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return {};
  }
  if (!resp.data) {
    ElMessage.error("The query is wrong");
    return {};
  }
  const source: { [key: string]: unknown } = {};
  const keys = Object.keys(resp.data);
  for (let i = 0; i < config.metricTypes.length; i++) {
    const type = config.metricTypes[i];
    const c = (config.metricConfig && config.metricConfig[i]) || {};
    const results = (resp.data[keys[i]] && resp.data[keys[i]].results) || [];
    const name = ((results[0] || {}).metric || {}).name;

    if (type === ExpressionResultType.TIME_SERIES_VALUES) {
      if (results.length === 1) {
        source[c.label || name] = results[0].values.map((d: { value: unknown }) => d.value) || [];
      } else {
        const labels = (c.label || "").split(",").map((item: string) => item.replace(/^\s*|\s*$/g, ""));
        for (const item of results) {
          const values = item.values.map((d: { value: unknown }) => Number(d.value)) || [];
          const index = Number(item.metric.labels[0].value);
          if (labels[index]) {
            source[labels[index]] = values;
          } else {
            source[index] = values;
          }
        }
      }
    }
    if (type === ExpressionResultType.SINGLE_VALUE) {
      source[c.label || name] = results[0].values[0].value;
    }
    if (([ExpressionResultType.RECORD_LIST, ExpressionResultType.SORTED_LIST] as string[]).includes(type)) {
      source[name] = results[0].values;
    }
  }

  return source;
}
