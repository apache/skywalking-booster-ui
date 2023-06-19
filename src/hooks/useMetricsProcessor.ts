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
import { ElMessage } from "element-plus";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useSelectorStore } from "@/store/modules/selectors";
import { useAppStoreWithOut } from "@/store/modules/app";
import type { Instance, Endpoint, Service } from "@/types/selector";
import type { MetricConfigOpt } from "@/types/dashboard";

export function useQueryProcessor(config: Indexable) {
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
    const metricType = config.metricTypes[index] || "";
    const c = (config.metricConfig && config.metricConfig[index]) || {};
    if ([MetricQueryTypes.ReadSampledRecords, MetricQueryTypes.SortMetrics].includes(metricType)) {
      variables.push(`$condition${index}: TopNCondition!`);
      conditions[`condition${index}`] = {
        name,
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
      if ([MetricQueryTypes.ReadRecords].includes(metricType)) {
        variables.push(`$condition${index}: RecordCondition!`);
        conditions[`condition${index}`] = {
          name,
          parentEntity: entity,
          topN: Number(c.topN) || 10,
          order: c.sortOrder || "DES",
        };
      } else {
        if (metricType === MetricQueryTypes.ReadLabeledMetricsValues) {
          const labels = (c.labelsIndex || "").split(",").map((item: string) => item.replace(/^\s*|\s*$/g, ""));
          variables.push(`$labels${index}: [String!]!`);
          conditions[`labels${index}`] = labels;
        }
        variables.push(`$condition${index}: MetricsCondition!`);
        conditions[`condition${index}`] = {
          name,
          entity,
        };
      }
    }
    if (metricType === MetricQueryTypes.ReadLabeledMetricsValues) {
      return `${name}${index}: ${metricType}(condition: $condition${index}, labels: $labels${index}, duration: $duration)${RespFields[metricType]}`;
    }
    const t = metricType === MetricQueryTypes.ReadMetricsValue ? MetricQueryTypes.ReadNullableMetricsValue : metricType;

    return `${name}${index}: ${t}(condition: $condition${index}, duration: $duration)${RespFields[t]}`;
  });
  const queryStr = `query queryData(${variables}) {${fragment}}`;

  return {
    queryStr,
    conditions,
  };
}
export function useSourceProcessor(
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

    if (type === MetricQueryTypes.ReadMetricsValues) {
      source[c.label || m] = (resp.data[keys[index]] && calculateExp(resp.data[keys[index]].values.values, c)) || [];
    }
    if (type === MetricQueryTypes.ReadLabeledMetricsValues) {
      const resVal = Object.values(resp.data)[0] || [];
      const labels = (c.label || "").split(",").map((item: string) => item.replace(/^\s*|\s*$/g, ""));
      const labelsIdx = (c.labelsIndex || "").split(",").map((item: string) => item.replace(/^\s*|\s*$/g, ""));
      for (const item of resVal) {
        const values = item.values.values.map((d: { value: number; isEmptyValue: boolean }) =>
          d.isEmptyValue ? NaN : aggregation(Number(d.value), c),
        );
        const indexNum = labelsIdx.findIndex((d: string) => d === item.label);
        if (labels[indexNum] && indexNum > -1) {
          source[labels[indexNum]] = values;
        } else {
          source[item.label] = values;
        }
      }
    }
    if (type === MetricQueryTypes.ReadMetricsValue) {
      const v = Object.values(resp.data)[0] || {};
      source[m] = v.isEmptyValue ? NaN : aggregation(Number(v.value), c);
    }
    if (
      (
        [MetricQueryTypes.ReadRecords, MetricQueryTypes.ReadSampledRecords, MetricQueryTypes.SortMetrics] as string[]
      ).includes(type)
    ) {
      source[m] = (Object.values(resp.data)[0] || []).map((d: { value: unknown; name: string }) => {
        d.value = aggregation(Number(d.value), c);

        return d;
      });
    }
    if (type === MetricQueryTypes.READHEATMAP) {
      const resVal = Object.values(resp.data)[0] || {};
      const nodes = [] as Indexable[];
      if (!(resVal && resVal.values)) {
        source[m] = { nodes: [] };
        return;
      }
      resVal.values.forEach((items: { values: number[] }, x: number) => {
        const grids = items.values.map((val: number, y: number) => [x, y, val]);

        nodes.push(...grids);
      });
      let buckets = [] as Indexable[];
      if (resVal.buckets.length) {
        buckets = [resVal.buckets[0].min, ...resVal.buckets.map((item: { min: string; max: string }) => item.max)];
      }

      source[m] = { nodes, buckets }; // nodes: number[][]
    }
  });

  return source;
}

export function useQueryPodsMetrics(
  pods: Array<(Instance | Endpoint | Service) & Indexable>,
  config: {
    metrics: string[];
    metricTypes: string[];
    metricConfig: MetricConfigOpt[];
  },
  scope: string,
) {
  const metricTypes = (config.metricTypes || []).filter((m: string) => m);
  if (!metricTypes.length) {
    return;
  }
  const metrics = (config.metrics || []).filter((m: string) => m);
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
    const param = {
      serviceName: scope === "Service" ? d.label : currentService.label,
      serviceInstanceName: scope === "ServiceInstance" ? d.label : undefined,
      endpointName: scope === "Endpoint" ? d.label : undefined,
      normal: scope === "Service" ? d.normal : currentService.normal,
    };
    const f = metrics.map((name: string, idx: number) => {
      const metricType = metricTypes[idx] || "";
      variables.push(`$condition${index}${idx}: MetricsCondition!`);
      conditions[`condition${index}${idx}`] = {
        name,
        entity: param,
      };
      let labelStr = "";
      if (metricType === MetricQueryTypes.ReadLabeledMetricsValues) {
        const c = config.metricConfig[idx] || {};
        variables.push(`$labels${index}${idx}: [String!]!`);
        labelStr = `labels: $labels${index}${idx}, `;
        const labels = (c.labelsIndex || "").split(",").map((item: string) => item.replace(/^\s*|\s*$/g, ""));
        conditions[`labels${index}${idx}`] = labels;
      }
      const t =
        metricType === MetricQueryTypes.ReadMetricsValue ? MetricQueryTypes.ReadNullableMetricsValue : metricType;
      return `${name}${index}${idx}: ${t}(condition: $condition${index}${idx}, ${labelStr}duration: $duration)${RespFields[t]}`;
    });
    return f;
  });
  const fragment = fragmentList.flat(1).join(" ");
  const queryStr = `query queryData(${variables}) {${fragment}}`;

  return { queryStr, conditions };
}

export function usePodsSource(
  pods: Array<Instance | Endpoint>,
  resp: { errors: string; data: Indexable },
  config: {
    metrics: string[];
    metricTypes: string[];
    metricConfig: MetricConfigOpt[];
  },
): Indexable {
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return {};
  }
  const names: string[] = [];
  const metricConfigArr: MetricConfigOpt[] = [];
  const metricTypesArr: string[] = [];
  const data = pods.map((d: any, idx: number) => {
    config.metrics.map((name: string, index: number) => {
      const c: any = (config.metricConfig && config.metricConfig[index]) || {};
      const key = name + idx + index;
      if (config.metricTypes[index] === MetricQueryTypes.ReadMetricsValue) {
        const v = resp.data[key];
        d[name] = v.isEmptyValue ? NaN : aggregation(v.value, c);
        if (idx === 0) {
          names.push(name);
          metricConfigArr.push(c);
          metricTypesArr.push(config.metricTypes[index]);
        }
      }
      if (config.metricTypes[index] === MetricQueryTypes.ReadMetricsValues) {
        d[name] = {};
        if ([Calculations.Average, Calculations.ApdexAvg, Calculations.PercentageAvg].includes(c.calculation)) {
          d[name]["avg"] = calculateExp(resp.data[key].values.values, c);
        }
        d[name]["values"] = resp.data[key].values.values.map((val: { value: number; isEmptyValue: boolean }) =>
          val.isEmptyValue ? NaN : aggregation(val.value, c),
        );
        if (idx === 0) {
          names.push(name);
          metricConfigArr.push(c);
          metricTypesArr.push(config.metricTypes[index]);
        }
      }
      if (config.metricTypes[index] === MetricQueryTypes.ReadLabeledMetricsValues) {
        const resVal = resp.data[key] || [];
        const labels = (c.label || "").split(",").map((item: string) => item.replace(/^\s*|\s*$/g, ""));
        const labelsIdx = (c.labelsIndex || "").split(",").map((item: string) => item.replace(/^\s*|\s*$/g, ""));
        for (let i = 0; i < resVal.length; i++) {
          const item = resVal[i];
          const values = item.values.values.map((d: { value: number; isEmptyValue: boolean }) =>
            d.isEmptyValue ? NaN : aggregation(Number(d.value), c),
          );
          const indexNum = labelsIdx.findIndex((d: string) => d === item.label);
          let key = item.label;
          if (labels[indexNum] && indexNum > -1) {
            key = labels[indexNum];
          }
          if (!d[key]) {
            d[key] = {};
          }
          if ([Calculations.Average, Calculations.ApdexAvg, Calculations.PercentageAvg].includes(c.calculation)) {
            d[key]["avg"] = calculateExp(item.values.values, c);
          }
          d[key]["values"] = values;
          if (idx === 0) {
            names.push(key);
            metricConfigArr.push({ ...c, index: i });
            metricTypesArr.push(config.metricTypes[index]);
          }
        }
      }
    });
    return d;
  });
  return { data, names, metricConfigArr, metricTypesArr };
}
export function useQueryTopologyMetrics(metrics: string[], ids: string[]) {
  const appStore = useAppStoreWithOut();
  const conditions: { [key: string]: unknown } = {
    duration: appStore.durationTime,
    ids,
  };
  const variables: string[] = [`$duration: Duration!`, `$ids: [ID!]!`];
  const fragmentList = metrics.map((d: string, index: number) => {
    conditions[`m${index}`] = d;
    variables.push(`$m${index}: String!`);

    return `${d}: getValues(metric: {
      name: $m${index}
      ids: $ids
    }, duration: $duration) {
      values {
        id
        value
      }
    }`;
  });
  const queryStr = `query queryData(${variables}) {${fragmentList.join(" ")}}`;

  return { queryStr, conditions };
}
export function calculateExp(
  list: { value: number; isEmptyValue: boolean }[],
  config: { calculation?: string },
): (number | string)[] {
  const arr = list.filter((d: { value: number; isEmptyValue: boolean }) => !d.isEmptyValue);
  const sum = arr.length ? arr.map((d: { value: number }) => Number(d.value)).reduce((a, b) => a + b) : 0;
  let data: (number | string)[] = [];
  switch (config.calculation) {
    case Calculations.Average:
      data = [(sum / arr.length).toFixed(2)];
      break;
    case Calculations.PercentageAvg:
      data = [(sum / arr.length / 100).toFixed(2)];
      break;
    case Calculations.ApdexAvg:
      data = [(sum / arr.length / 10000).toFixed(2)];
      break;
    default:
      data = list.map((d: { value: number; isEmptyValue: boolean }) =>
        d.isEmptyValue ? NaN : aggregation(d.value, config),
      );
      break;
  }
  return data;
}

export function aggregation(val: number, config: { calculation?: string }): number | string {
  let data: number | string = Number(val);

  switch (config.calculation) {
    case Calculations.Percentage:
      data = (val / 100).toFixed(2);
      break;
    case Calculations.PercentageAvg:
      data = (val / 100).toFixed(2);
      break;
    case Calculations.ByteToKB:
      data = (val / 1024).toFixed(2);
      break;
    case Calculations.ByteToMB:
      data = (val / 1024 / 1024).toFixed(2);
      break;
    case Calculations.ByteToGB:
      data = (val / 1024 / 1024 / 1024).toFixed(2);
      break;
    case Calculations.Apdex:
      data = (val / 10000).toFixed(2);
      break;
    case Calculations.ConvertSeconds:
      data = dayjs(val * 1000).format("YYYY-MM-DD HH:mm:ss");
      break;
    case Calculations.ConvertMilliseconds:
      data = dayjs(val).format("YYYY-MM-DD HH:mm:ss");
      break;
    case Calculations.MsToS:
      data = (val / 1000).toFixed(2);
      break;
    case Calculations.SecondToDay:
      data = (val / 86400).toFixed(2);
      break;
    case Calculations.NanosecondToMillisecond:
      data = (val / 1000 / 1000).toFixed(2);
      break;
    case Calculations.ApdexAvg:
      data = (val / 10000).toFixed(2);
      break;
    default:
      data;
      break;
  }

  return data;
}
