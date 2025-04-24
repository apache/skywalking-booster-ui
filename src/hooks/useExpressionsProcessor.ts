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
import { RespFields, MaximumEntities, MaxQueryLength } from "./data";
import { EntityType, ExpressionResultType } from "@/views/dashboard/data";
import { ElMessage } from "element-plus";
import { useTopologyStore } from "@/store/modules/topology";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useSelectorStore } from "@/store/modules/selectors";
import { useAppStoreWithOut } from "@/store/modules/app";
import type { MetricConfigOpt } from "@/types/dashboard";
import type { Instance, Endpoint, Service } from "@/types/selector";
import type { Node, Call } from "@/types/topology";

function chunkArray(array: any[], chunkSize: number) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

export async function useDashboardQueryProcessor(configList: Indexable[]) {
  function expressionsGraphql(config: Indexable, idx: number) {
    if (!(config.metrics && config.metrics[0])) {
      return;
    }
    const dashboardStore = useDashboardStore();
    const selectorStore = useSelectorStore();

    if (!selectorStore.currentService && dashboardStore.entity !== "All") {
      return;
    }
    const conditions: Recordable = {};
    const variables: string[] = [];
    const isRelation = ["ServiceRelation", "ServiceInstanceRelation", "EndpointRelation", "ProcessRelation"].includes(
      dashboardStore.entity,
    );
    if (isRelation && !selectorStore.currentDestService) {
      return;
    }
    if (idx === 0) {
      variables.push(`$entity: Entity!`);
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
      conditions[`entity`] = entity;
    }
    const fragment = config.metrics.map((name: string, index: number) => {
      variables.push(`$expression${idx}${index}: String!`);
      conditions[`expression${idx}${index}`] = name;

      return `expression${idx}${index}: execExpression(expression: $expression${idx}${index}, entity: $entity, duration: $duration)${RespFields.execExpression}`;
    });
    return {
      variables,
      fragment,
      conditions,
    };
  }
  function expressionsSource(config: Indexable, resp: { errors: string; data: Indexable | any }) {
    if (resp.errors) {
      ElMessage.error(resp.errors);
      return { source: {}, tips: [], typesOfMQE: [] };
    }
    if (!resp.data) {
      ElMessage.error("The query is wrong");
      return { source: {}, tips: [], typesOfMQE: [] };
    }
    if (resp.data.error) {
      ElMessage.error(resp.data.error);
      return { source: {}, tips: [], typesOfMQE: [] };
    }
    const tips: string[] = [];
    const source: Indexable<unknown> = {};
    const keys = Object.keys(resp.data);
    const typesOfMQE: string[] = [];

    for (let i = 0; i < config.metrics.length; i++) {
      const metricConfig: MetricConfigOpt = (config.metricConfig && config.metricConfig[i]) || {};
      const obj = resp.data[keys[i]] || {};
      const results = obj.results || [];
      const name = config.metrics[i];
      const type = obj.type;

      tips.push(obj.error);
      typesOfMQE.push(type);
      if (!obj.error) {
        if ([ExpressionResultType.SINGLE_VALUE, ExpressionResultType.TIME_SERIES_VALUES].includes(type)) {
          for (const item of results) {
            let label =
              item.metric &&
              item.metric.labels.map((d: { key: string; value: string }) => `${d.key}=${d.value}`).join(",");
            const values = item.values.map((d: { value: unknown }) => d.value) || [];
            if (results.length === 1) {
              // If the metrics label does not exist, use the configuration label or expression
              label = label ? `${metricConfig.label || name}, ${label}` : metricConfig.label || name;
            }
            source[label] = values;
          }
        }
        if (([ExpressionResultType.RECORD_LIST, ExpressionResultType.SORTED_LIST] as string[]).includes(type)) {
          source[name] = results[0].values;
        }
      }
    }

    return { source, tips, typesOfMQE };
  }
  async function fetchMetrics(configArr: any) {
    const appStore = useAppStoreWithOut();
    const variables: string[] = [`$duration: Duration!`];
    let fragments = "";
    let conditions: Recordable<unknown> = {
      duration: appStore.durationTime,
    };
    for (let i = 0; i < configArr.length; i++) {
      const params = await expressionsGraphql(configArr[i], i);
      if (params) {
        fragments += params?.fragment;
        conditions = { ...conditions, ...params.conditions };
        variables.push(...params.variables);
      }
    }
    if (!fragments) {
      return { 0: { source: {}, tips: [], typesOfMQE: [] } };
    }
    const queryStr = `query queryData(${variables}) {${fragments}}`;
    const dashboardStore = useDashboardStore();
    const json = await dashboardStore.fetchMetricValue({
      queryStr,
      conditions,
    });
    if (json.errors) {
      ElMessage.error(json.errors);
      return { 0: { source: {}, tips: [], typesOfMQE: [] } };
    }
    try {
      const pageData: Recordable = {};

      for (let i = 0; i < configArr.length; i++) {
        const resp: any = {};
        for (let m = 0; m < configArr[i].metrics.length; m++) {
          resp[`expression${i}${m}`] = json.data[`expression${i}${m}`];
        }
        const data = expressionsSource(configArr[i], { ...json, data: resp });
        const id = configArr[i].id;
        pageData[id] = data;
      }
      return pageData;
    } catch (error) {
      console.error(error);
      return { 0: { source: {}, tips: [], typesOfMQE: [] } };
    }
  }

  const partArr = chunkArray(configList, 6);
  const promiseArr = partArr.map((d: Array<Indexable>) => fetchMetrics(d));
  const responseList = await Promise.all(promiseArr);
  let resp = {};
  for (const item of responseList) {
    resp = {
      ...resp,
      ...item,
    };
  }

  return resp;
}

export async function useExpressionsQueryPodsMetrics(
  allPods: Array<(Instance | Endpoint | Service) & Indexable>,
  config: {
    expressions: string[];
    subExpressions: string[];
    metricConfig: MetricConfigOpt[];
  },
  scope: string,
) {
  function expressionsGraphqlPods(pods: Array<(Instance | Endpoint | Service) & Indexable>) {
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
        if (index === 0) {
          variables.push(`$expression${idx}: String!`);
          conditions[`expression${idx}`] = name;
        }
        let str = "";
        if (config.subExpressions[idx]) {
          if (index === 0) {
            variables.push(`$subExpression${idx}: String!`);
            conditions[`subExpression${idx}`] = config.subExpressions[idx];
          }
          str = `subexpression${index}${idx}: execExpression(expression: $subExpression${idx}, entity: $entity${index}, duration: $duration)${RespFields.execExpression}`;
        }

        return (
          str +
          `expression${index}${idx}: execExpression(expression: $expression${idx}, entity: $entity${index}, duration: $duration)${RespFields.execExpression}`
        );
      });
      return f;
    });
    const fragment = fragmentList.flat(1).join(" ");
    const queryStr = `query queryData(${variables}) {${fragment}}`;

    return { queryStr, conditions };
  }

  function expressionsPodsSource(
    resp: { errors: string; data: Indexable },
    pods: Array<(Instance | Endpoint | Service) & Indexable>,
  ): Indexable {
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

  async function fetchPodsExpressionValues(pods: Array<(Instance | Endpoint | Service) & Indexable>) {
    const dashboardStore = useDashboardStore();
    const params = await expressionsGraphqlPods(pods);

    const json = await dashboardStore.fetchMetricValue(params);

    if (json.errors) {
      ElMessage.error(json.errors);
      return {};
    }
    const expressionParams = expressionsPodsSource(json, pods);

    return expressionParams;
  }

  const result = [];
  for (let i = 0; i < allPods.length; i += MaximumEntities) {
    result.push(allPods.slice(i, i + MaximumEntities));
  }
  const promiseArr = result.map((d: Array<(Instance | Endpoint | Service) & Indexable>) =>
    fetchPodsExpressionValues(d),
  );
  const responseList = await Promise.all(promiseArr);
  let resp: Indexable = { data: [], expressionsTips: [], subExpressionsTips: [] };
  for (const item of responseList) {
    resp = {
      ...item,
      data: [...resp.data, ...item.data],
      expressionsTips: [...resp.expressionsTips, ...item.expressionsTips],
      subExpressionsTips: [...resp.subExpressionsTips, ...item.subExpressionsTips],
    };
  }
  return resp;
}

export function useQueryTopologyExpressionsProcessor(metrics: string[], instances: (Call | Node)[]) {
  const appStore = useAppStoreWithOut();
  const dashboardStore = useDashboardStore();

  function getExpressionQuery(partMetrics?: string[]) {
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
      const f = (partMetrics || metrics).map((name: string, idx: number) => {
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
  function handleExpressionValues(partMetrics: string[], resp: { [key: string]: any }) {
    const obj: Indexable = {};
    for (let idx = 0; idx < instances.length; idx++) {
      for (let index = 0; index < partMetrics.length; index++) {
        const k = "expression" + idx + index;
        if (partMetrics[index]) {
          if (!obj[partMetrics[index]]) {
            obj[partMetrics[index]] = {
              values: [],
            };
          }
          obj[partMetrics[index]].values.push({
            value: resp[k] && resp[k].results[0] && resp[k].results[0].values[0].value,
            id: instances[idx].id,
          });
        }
      }
    }
    return obj;
  }
  async function fetchMetrics(partMetrics: string[]) {
    const topologyStore = useTopologyStore();
    const param = getExpressionQuery(partMetrics);
    const res = await topologyStore.getTopologyExpressionValue(param);
    if (res.errors) {
      ElMessage.error(res.errors);
      return;
    }
    return handleExpressionValues(partMetrics, res.data);
  }

  async function getMetrics() {
    const count = Math.floor(MaxQueryLength / instances.length);
    const metricsArr = chunkArray(metrics, count);
    const promiseArr = metricsArr.map((d: string[]) => fetchMetrics(d));
    const responseList = await Promise.all(promiseArr);
    let resp = {};
    for (const item of responseList) {
      resp = {
        ...resp,
        ...item,
      };
    }
    return resp;
  }

  return { getMetrics, getExpressionQuery };
}
