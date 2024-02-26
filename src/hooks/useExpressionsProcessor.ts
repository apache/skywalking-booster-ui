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
import { EntityType, ExpressionResultType } from "@/views/dashboard/data";
import { ElMessage } from "element-plus";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useSelectorStore } from "@/store/modules/selectors";
import { useAppStoreWithOut } from "@/store/modules/app";
import type { MetricConfigOpt } from "@/types/dashboard";
import type { Instance, Endpoint, Service } from "@/types/selector";
import type { Node, Call } from "@/types/topology";

export async function useExpressionsQueryProcessor(config: Indexable) {
  function expressionsGraphqlPods() {
    if (!(config.metrics && config.metrics[0])) {
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
        serviceInstanceName: ["ServiceInstance", "ServiceInstanceRelation", "ProcessRelation", "Process"].includes(
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

  function expressionsSource(resp: { errors: string; data: Indexable }) {
    if (resp.errors) {
      ElMessage.error(resp.errors);
      return { source: {}, tips: [], typesOfMQE: [] };
    }
    if (!resp.data) {
      ElMessage.error("The query is wrong");
      return { source: {}, tips: [], typesOfMQE: [] };
    }
    const tips: string[] = [];
    const source: { [key: string]: unknown } = {};
    const keys = Object.keys(resp.data);
    const typesOfMQE: string[] = [];

    for (let i = 0; i < config.metrics.length; i++) {
      const c: MetricConfigOpt = (config.metricConfig && config.metricConfig[i]) || {};
      const obj = resp.data[keys[i]] || {};
      const results = obj.results || [];
      const name = config.metrics[i];
      const type = obj.type;

      tips.push(obj.error);
      typesOfMQE.push(type);
      if (!obj.error) {
        if (type === ExpressionResultType.TIME_SERIES_VALUES) {
          if (results.length === 1) {
            const label = results[0].metric && results[0].metric.labels[0] && results[0].metric.labels[0].value;
            source[c.label || label || name] = results[0].values.map((d: { value: unknown }) => d.value) || [];
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
          source[c.label || name] = (results[0].values[0] || {}).value;
        }
        if (([ExpressionResultType.RECORD_LIST, ExpressionResultType.SORTED_LIST] as string[]).includes(type)) {
          source[name] = results[0].values;
        }
      }
    }

    return { source, tips, typesOfMQE };
  }

  const params = await expressionsGraphqlPods();
  if (!params) {
    return { source: {}, tips: [], typesOfMQE: [] };
  }

  const dashboardStore = useDashboardStore();
  const json = await dashboardStore.fetchMetricValue(params);
  if (json.errors) {
    ElMessage.error(json.errors);
    return { source: {}, tips: [], typesOfMQE: [] };
  }
  try {
    const data = expressionsSource(json);

    return data;
  } catch (error) {
    console.error(error);
    return { source: {}, tips: [], typesOfMQE: [] };
  }
}

export async function useExpressionsQueryPodsMetrics(
  pods: Array<(Instance | Endpoint | Service) & Indexable>,
  config: {
    expressions: string[];
    subExpressions: string[];
    metricConfig: MetricConfigOpt[];
  },
  scope: string,
) {
  function expressionsGraphqlPods() {
    const metrics: string[] = [];
    const subMetrics: string[] = [];
    config.expressions = config.expressions || [];
    config.subExpressions = config.subExpressions || [];

    for (let i = 0; i < config.expressions.length; i++) {
      if (config.expressions[i]) {
        metrics.push(config.expressions[i]);
        subMetrics.push(config.subExpressions[i]);
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
    const subNames: string[] = [];
    const metricConfigArr: MetricConfigOpt[] = [];
    const metricTypesArr: string[] = [];
    const expressionsTips: string[] = [];
    const subExpressionsTips: string[] = [];
    const data = pods.map((d: any, idx: number) => {
      for (let index = 0; index < config.expressions.length; index++) {
        const c: MetricConfigOpt = (config.metricConfig && config.metricConfig[index]) || {};
        const k = "expression" + idx + index;
        const sub = "subexpression" + idx + index;
        const obj = resp.data[k] || {};
        const results = obj.results || [];
        const typesOfMQE = obj.type || "";
        const subObj = resp.data[sub] || {};
        const subResults = subObj.results || [];

        expressionsTips.push(obj.error);
        subExpressionsTips.push(subObj.error);
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
            d[name]["avg"] = (results[i].values[0] || {}).value;

            const j = names.find((d: string) => d === name);

            if (!j) {
              names.push(name);
              metricConfigArr.push({ ...c, index: i });
              metricTypesArr.push(typesOfMQE);
            }
          }
        } else {
          if (!results[0]) {
            return d;
          }
          const name = config.expressions[index] || "";
          const subName = config.subExpressions[index] || "";
          if (!d[name]) {
            d[name] = {};
          }
          d[name]["avg"] = [(results[0].values[0] || {}).value];
          if (subResults[0]) {
            if (!d[subName]) {
              d[subName] = {};
            }
            d[subName]["values"] = subResults[0].values.map((d: { value: number }) => d.value);
          }
          const j = names.find((d: string) => d === name);
          if (!j) {
            names.push(name);
            subNames.push(subName);
            metricConfigArr.push(c);
            metricTypesArr.push(typesOfMQE);
          }
        }
      }
      return d;
    });

    return { data, names, subNames, metricConfigArr, metricTypesArr, expressionsTips, subExpressionsTips };
  }

  const dashboardStore = useDashboardStore();
  const params = await expressionsGraphqlPods();
  const json = await dashboardStore.fetchMetricValue(params);

  if (json.errors) {
    ElMessage.error(json.errors);
    return {};
  }
  const expressionParams = expressionsPodsSource(json);

  return expressionParams;
}

export function useQueryTopologyExpressionsProcessor(metrics: string[], instances: (Call | Node)[]) {
  const appStore = useAppStoreWithOut();
  const dashboardStore = useDashboardStore();

  function getExpressionQuery() {
    const conditions: { [key: string]: unknown } = {
      duration: appStore.durationTime,
    };
    const variables: string[] = [`$duration: Duration!`];
    const fragmentList = instances.map((d: any, index: number) => {
      let serviceName;
      let destServiceName;
      let endpointName;
      let serviceInstanceName;
      let destServiceInstanceName;
      let destEndpointName;
      let normal = false;
      let destNormal;
      if (d.sourceObj && d.targetObj) {
        // instances = Calls
        serviceName = d.sourceObj.serviceName || d.sourceObj.name;
        destServiceName = d.targetObj.serviceName || d.targetObj.name;
        normal = d.sourceObj.normal || d.sourceObj.isReal || false;
        destNormal = d.targetObj.normal || d.targetObj.isReal || false;
        if (EntityType[4].value === dashboardStore.entity) {
          serviceInstanceName = d.sourceObj.name;
          destServiceInstanceName = d.targetObj.name;
        }
        if (EntityType[2].value === dashboardStore.entity) {
          endpointName = d.sourceObj.name;
          destEndpointName = d.targetObj.name;
        }
      } else {
        // instances = Nodes
        serviceName = d.serviceName || d.name;
        normal = d.normal || d.isReal || false;
        if (EntityType[3].value === dashboardStore.entity) {
          serviceInstanceName = d.name;
        }
        if (EntityType[4].value === dashboardStore.entity) {
          serviceInstanceName = d.name;
        }
        if (EntityType[2].value === dashboardStore.entity) {
          endpointName = d.name;
        }
      }
      const entity = {
        serviceName,
        normal,
        serviceInstanceName,
        endpointName,
        destServiceName,
        destNormal: destServiceName ? destNormal : undefined,
        destServiceInstanceName,
        destEndpointName,
      };
      variables.push(`$entity${index}: Entity!`);
      conditions[`entity${index}`] = entity;
      const f = metrics.map((name: string, idx: number) => {
        if (index === 0) {
          variables.push(`$expression${idx}: String!`);
          conditions[`expression${idx}`] = name;
        }
        return `expression${index}${idx}: execExpression(expression: $expression${idx}, entity: $entity${index}, duration: $duration)${RespFields.execExpression}`;
      });
      return f;
    });
    const fragment = fragmentList.flat(1).join(" ");
    const queryStr = `query queryData(${variables}) {${fragment}}`;

    return { queryStr, conditions };
  }
  function handleExpressionValues(resp: { [key: string]: any }) {
    const obj: any = {};
    for (let idx = 0; idx < instances.length; idx++) {
      for (let index = 0; index < metrics.length; index++) {
        const k = "expression" + idx + index;
        if (metrics[index]) {
          if (!obj[metrics[index]]) {
            obj[metrics[index]] = {
              values: [],
            };
          }
          obj[metrics[index]].values.push({
            value: resp[k].results[0] && resp[k].results[0].values[0].value,
            id: instances[idx].id,
          });
        }
      }
    }
    return obj;
  }

  return { getExpressionQuery, handleExpressionValues };
}
