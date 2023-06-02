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
import dayjs from "dayjs";
import { RespFields, MetricQueryTypes, Calculations } from "./data";
import { ExpressionResultType } from "@/views/dashboard/data";
import { ElMessage } from "element-plus";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useSelectorStore } from "@/store/modules/selectors";
import { useAppStoreWithOut } from "@/store/modules/app";
import type { Instance, Endpoint, Service } from "@/types/selector";
import type { MetricConfigOpt } from "@/types/dashboard";
import { MetricCatalog } from "@/views/dashboard/data";
import { calculateExp, aggregation } from "./useMetricsProcessor";

export function useExpressionsQueryProcessor(config: {
  metrics: string[];
  metricTypes: string[];
  metricConfig: MetricConfigOpt[];
}) {
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
    variables.push(`expression${index}: String!`, `$entity${index}: Entity!`);
    const metricType = config.metricTypes[index] || "";
    const c = (config.metricConfig && config.metricConfig[index]) || {};
    conditions[`expression${index}`] = name;
    if ([ExpressionResultType.RECORD_LIST, ExpressionResultType.SORTED_LIST as string].includes(metricType)) {
      conditions[`entity${index}`] = {
        parentService: ["All"].includes(dashboardStore.entity) ? null : selectorStore.currentService.value,
        normal: selectorStore.currentService ? selectorStore.currentService.normal : true,
        topN: Number(c.topN) || 10,
        order: c.sortOrder || "DES",
      };
    } else {
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
      if ([ExpressionResultType.RECORD_LIST as string].includes(metricType)) {
        conditions[`entity${index}`] = {
          parentEntity: entity,
          topN: Number(c.topN) || 10,
          order: c.sortOrder || "DES",
        };
      } else {
        // if (metricType === ExpressionResultType.TIME_SERIES_VALUES) {
        //   const labels = (c.labelsIndex || "").split(",").map((item: string) => item.replace(/^\s*|\s*$/g, ""));
        //   variables.push(`$labels${index}: [String!]!`);
        //   conditions[`labels${index}`] = labels;
        // }
        conditions[`entity${index}`] = {
          entity,
        };
      }
    }
    // if (metricType === MetricQueryTypes.ReadLabeledMetricsValues) {
    //   return `${name}${index}: ${metricType}(condition: $condition${index}, labels: $labels${index}, duration: $duration)${RespFields[metricType]}`;
    // }

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

  config.metricTypes.forEach((type: string, index) => {
    const m = config.metrics[index];
    const c = (config.metricConfig && config.metricConfig[index]) || {};

    if (type === ExpressionResultType.TIME_SERIES_VALUES) {
      source[c.label || m] = (resp.data[keys[index]] && calculateExp(resp.data.results[keys[index]].values, c)) || [];
    }
    if (type === ExpressionResultType.SINGLE_VALUE) {
      const v = Object.values(resp.data)[0] || {};
      source[m] = v.isEmptyValue ? NaN : aggregation(Number(v.value), c);
    }
    if (([ExpressionResultType.RECORD_LIST, ExpressionResultType.SORTED_LIST] as string[]).includes(type)) {
      source[m] = (Object.values(resp.data)[0] || []).map((d: { value: unknown; name: string }) => {
        d.value = aggregation(Number(d.value), c);

        return d;
      });
    }
  });

  return source;
}
