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
import type { Instance, Endpoint, Service } from "@/types/selector";

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
          const values = item.values.map((d: { value: unknown }) => d.value) || [];
          const index = item.metric.labels[0].value;
          const indexNum = labels.findIndex((_, i: number) => i === Number(index));
          if (labels[indexNum] && indexNum > -1) {
            source[labels[indexNum]] = values;
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

export async function useExpressionsQueryPodsMetrics(
  pods: Array<(Instance | Endpoint | Service) & Indexable>,
  config: {
    expressions: string[];
    typesOfMQE: string[];
    subExpressions: string[];
    metricConfig: MetricConfigOpt[];
  },
  scope: string,
) {
  function expressionsGraphqlPods() {
    const metrics: string[] = [];
    const subMetrics: string[] = [];
    const metricTypes: string[] = [];
    config.expressions = config.expressions || [];
    config.subExpressions = config.subExpressions || [];
    config.typesOfMQE = config.typesOfMQE || [];

    for (let i = 0; i < config.expressions.length; i++) {
      if (config.expressions[i]) {
        metrics.push(config.expressions[i]);
        subMetrics.push(config.subExpressions[i]);
        metricTypes.push(config.typesOfMQE[i]);
      }
    }
    if (!metrics.length) {
      return;
    }
    const appStore = useAppStoreWithOut();
    const selectorStore = useSelectorStore();
    const conditions: { [key: string]: unknown } = {
      duration: appStore.durationTime,
    };
    const variables: string[] = [`$duration: Duration!`];
    const currentService = selectorStore.currentService || {};
    const fragmentList = pods.map((d: (Instance | Endpoint | Service) & Indexable, index: number) => {
      const entity = {
        serviceName: scope === "Service" ? d.label : currentService.label,
        serviceInstanceName: scope === "ServiceInstance" ? d.label : undefined,
        endpointName: scope === "Endpoint" ? d.label : undefined,
        normal: scope === "Service" ? d.normal : currentService.normal,
      };
      variables.push(`$entity${index}: Entity!`);
      conditions[`entity${index}`] = entity;
      const f = metrics.map((name: string, idx: number) => {
        variables.push(`$expression${index}${idx}: String!`);
        conditions[`expression${index}${idx}`] = name;
        let str = "";
        if (config.subExpressions[idx]) {
          variables.push(`$subExpression${index}${idx}: String!`);
          conditions[`subExpression${index}${idx}`] = config.subExpressions[idx];
          str = `subexpression${index}${idx}: execExpression(expression: $subExpression${index}${idx}, entity: $entity${index}, duration: $duration)${RespFields.execExpression}`;
        }

        return (
          str +
          `expression${index}${idx}: execExpression(expression: $expression${index}${idx}, entity: $entity${index}, duration: $duration)${RespFields.execExpression}`
        );
      });
      return f;
    });
    const fragment = fragmentList.flat(1).join(" ");
    const queryStr = `query queryData(${variables}) {${fragment}}`;

    return { queryStr, conditions };
  }

  function expressionsPodsSource(resp: { errors: string; data: Indexable }): Indexable {
    if (resp.errors) {
      ElMessage.error(resp.errors);
      return {};
    }
    const names: string[] = [];
    const metricConfigArr: MetricConfigOpt[] = [];
    const metricTypesArr: string[] = [];
    const data = pods.map((d: any, idx: number) => {
      for (let index = 0; index < config.expressions.length; index++) {
        const c: any = (config.metricConfig && config.metricConfig[index]) || {};
        const k = "expression" + idx + index;
        const sub = "subexpression" + idx + index;
        const results = (resp.data[k] && resp.data[k].results) || [];
        const subResults = (resp.data[sub] && resp.data[sub].results) || [];

        if (results.length > 1) {
          const labels = (c.label || "").split(",").map((item: string) => item.replace(/^\s*|\s*$/g, ""));
          const labelsIdx = (c.labelsIndex || "").split(",").map((item: string) => item.replace(/^\s*|\s*$/g, ""));
          for (let i = 0; i < results.length; i++) {
            let name = results[i].metric.labels[0].value || "";
            const subValues = subResults[i] && subResults[i].values.map((d: { value: unknown }) => d.value);
            const num = labelsIdx.findIndex((d: string) => d === results[i].metric.labels[0].value);

            if (labels[num]) {
              name = labels[num];
            }
            if (!d[name]) {
              d[name] = {};
            }
            if (subValues) {
              d[name]["values"] = subValues;
            }
            d[name]["avg"] = results[i].values[0].value;

            const j = names.find((d: string) => d === name);

            if (!j) {
              names.push(name);
              metricConfigArr.push({ ...c, index: i });
              metricTypesArr.push(config.typesOfMQE[index]);
            }
          }
        } else {
          if (!results[0]) {
            return d;
          }
          const name = results[0].metric.name || "";
          if (!d[name]) {
            d[name] = {};
          }
          d[name]["avg"] = [results[0].values[0].value];
          if (subResults[0]) {
            d[name]["values"] = subResults[0].values.map((d: { value: number }) => d.value);
          }
          const j = names.find((d: string) => d === name);
          if (!j) {
            names.push(name);
            metricConfigArr.push(c);
            metricTypesArr.push(config.typesOfMQE[index]);
          }
        }
      }
      return d;
    });

    return { data, names, metricConfigArr, metricTypesArr };
  }
  const dashboardStore = useDashboardStore();
  const params = await expressionsGraphqlPods();
  const json = await dashboardStore.fetchMetricValue(params);

  if (json.errors) {
    ElMessage.error(json.errors);
    return {};
  }
  const { data, names, metricTypesArr, metricConfigArr } = expressionsPodsSource(json);

  return { data, names, metricTypesArr, metricConfigArr };
}
