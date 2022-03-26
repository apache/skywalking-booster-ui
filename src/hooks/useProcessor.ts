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
import { Instance, Endpoint, Service } from "@/types/selector";
import { MetricConfigOpt } from "@/types/dashboard";

export function useQueryProcessor(config: any) {
  if (!(config.metrics && config.metrics[0])) {
    return;
  }
  const appStore = useAppStoreWithOut();
  const dashboardStore = useDashboardStore();
  const selectorStore = useSelectorStore();

  if (!selectorStore.currentService && dashboardStore.entity !== "All") {
    return;
  }
  const conditions: { [key: string]: unknown } = {
    duration: appStore.durationTime,
  };
  const variables: string[] = [`$duration: Duration!`];
  const isRelation = [
    "ServiceRelation",
    "ServiceInstanceRelation",
    "EndpointRelation",
  ].includes(dashboardStore.entity);
  if (isRelation && !selectorStore.currentDestService) {
    return;
  }
  const fragment = config.metrics.map((name: string, index: number) => {
    const metricType = config.metricTypes[index] || "";
    const c = (config.metricConfig && config.metricConfig[index]) || {};
    if (
      [
        MetricQueryTypes.ReadSampledRecords,
        MetricQueryTypes.SortMetrics,
      ].includes(metricType)
    ) {
      variables.push(`$condition${index}: TopNCondition!`);
      conditions[`condition${index}`] = {
        name,
        parentService: ["All"].includes(dashboardStore.entity)
          ? null
          : selectorStore.currentService.value,
        normal: selectorStore.currentService.normal,
        scope: dashboardStore.entity,
        topN: 10,
        order: c.sortOrder || "DES",
      };
    } else {
      if (metricType === MetricQueryTypes.ReadLabeledMetricsValues) {
        const labels = (c.labelsIndex || "")
          .split(",")
          .map((item: string) => item.replace(/^\s*|\s*$/g, ""));
        variables.push(`$labels${index}: [String!]!`);
        conditions[`labels${index}`] = labels;
      }
      variables.push(`$condition${index}: MetricsCondition!`);
      conditions[`condition${index}`] = {
        name,
        entity: {
          scope: dashboardStore.entity,
          serviceName:
            dashboardStore.entity === "All"
              ? undefined
              : selectorStore.currentService.value,
          normal:
            dashboardStore.entity === "All"
              ? undefined
              : selectorStore.currentService.normal,
          serviceInstanceName: dashboardStore.entity.includes("ServiceInstance")
            ? selectorStore.currentPod && selectorStore.currentPod.value
            : undefined,
          endpointName: dashboardStore.entity.includes("Endpoint")
            ? selectorStore.currentPod && selectorStore.currentPod.value
            : undefined,
          destNormal: isRelation
            ? selectorStore.currentDestService.normal
            : undefined,
          destServiceName: isRelation
            ? selectorStore.currentDestService.value
            : undefined,
          destServiceInstanceName:
            dashboardStore.entity === "ServiceInstanceRelation"
              ? selectorStore.currentDestPod &&
                selectorStore.currentDestPod.value
              : undefined,
          destEndpointName:
            dashboardStore.entity === "EndpointRelation"
              ? selectorStore.currentDestPod &&
                selectorStore.currentDestPod.value
              : undefined,
        },
      };
    }
    if (metricType === MetricQueryTypes.ReadLabeledMetricsValues) {
      return `${name}${index}: ${metricType}(condition: $condition${index}, labels: $labels${index}, duration: $duration)${RespFields[metricType]}`;
    } else {
      return `${name}${index}: ${metricType}(condition: $condition${index}, duration: $duration)${RespFields[metricType]}`;
    }
  });
  const queryStr = `query queryData(${variables}) {${fragment}}`;
  return {
    queryStr,
    conditions,
  };
}
export function useSourceProcessor(
  resp: { errors: string; data: { [key: string]: any } },
  config: {
    metrics: string[];
    metricTypes: string[];
    metricConfig: MetricConfigOpt[];
  }
) {
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return {};
  }
  const source: { [key: string]: unknown } = {};
  const keys = Object.keys(resp.data);

  config.metricTypes.forEach((type: string, index) => {
    const m = config.metrics[index];
    const c = (config.metricConfig && config.metricConfig[index]) || {};

    if (type === MetricQueryTypes.ReadMetricsValues) {
      source[m] = resp.data[keys[index]].values.values.map(
        (d: { value: number }) => aggregation(d.value, c)
      );
    }
    if (type === MetricQueryTypes.ReadLabeledMetricsValues) {
      const resVal = Object.values(resp.data)[0] || [];
      const labels = (c.label || "")
        .split(",")
        .map((item: string) => item.replace(/^\s*|\s*$/g, ""));
      const labelsIdx = (c.labelsIndex || "")
        .split(",")
        .map((item: string) => item.replace(/^\s*|\s*$/g, ""));
      for (const item of resVal) {
        const values = item.values.values.map((d: { value: number }) =>
          aggregation(Number(d.value), c)
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
      source[m] = aggregation(Number(Object.values(resp.data)[0]), c);
    }
    if (
      type === MetricQueryTypes.SortMetrics ||
      type === MetricQueryTypes.ReadSampledRecords
    ) {
      source[m] = (Object.values(resp.data)[0] || []).map(
        (d: { value: unknown; name: string }) => {
          d.value = aggregation(Number(d.value), c);

          return d;
        }
      );
    }
    if (type === MetricQueryTypes.READHEATMAP) {
      const resVal = Object.values(resp.data)[0] || {};
      const nodes = [] as any;
      if (!(resVal && resVal.values)) {
        source[m] = { nodes: [] };
        return;
      }
      resVal.values.forEach((items: { values: number[] }, x: number) => {
        const grids = items.values.map((val: number, y: number) => [x, y, val]);

        nodes.push(...grids);
      });
      let buckets = [] as any;
      if (resVal.buckets.length) {
        buckets = [
          resVal.buckets[0].min,
          ...resVal.buckets.map(
            (item: { min: string; max: string }) => item.max
          ),
        ];
      }

      source[m] = { nodes, buckets }; // nodes: number[][]
    }
  });

  return source;
}

export function useQueryPodsMetrics(
  pods: Array<Instance | Endpoint | Service | any>,
  config: { metrics: string[]; metricTypes: string[] },
  scope: string
) {
  const appStore = useAppStoreWithOut();
  const selectorStore = useSelectorStore();
  const conditions: { [key: string]: unknown } = {
    duration: appStore.durationTime,
  };
  const variables: string[] = [`$duration: Duration!`];
  const { currentService } = selectorStore;
  const fragmentList = pods.map(
    (
      d: (Instance | Endpoint | Service) & { normal: boolean },
      index: number
    ) => {
      const param = {
        scope,
        serviceName: scope === "Service" ? d.label : currentService.label,
        serviceInstanceName: scope === "ServiceInstance" ? d.label : undefined,
        endpointName: scope === "Endpoint" ? d.label : undefined,
        normal: scope === "Service" ? d.normal : currentService.normal,
      };
      const f = config.metrics.map((name: string, idx: number) => {
        const metricType = config.metricTypes[idx] || "";
        conditions[`condition${index}${idx}`] = {
          name,
          entity: param,
        };
        variables.push(`$condition${index}${idx}: MetricsCondition!`);
        return `${name}${index}${idx}: ${metricType}(condition: $condition${index}${idx}, duration: $duration)${RespFields[metricType]}`;
      });
      return f;
    }
  );
  const fragment = fragmentList.flat(1).join(" ");
  const queryStr = `query queryData(${variables}) {${fragment}}`;

  return { queryStr, conditions };
}
export function usePodsSource(
  pods: Array<Instance | Endpoint>,
  resp: { errors: string; data: { [key: string]: any } },
  config: {
    metrics: string[];
    metricTypes: string[];
    metricConfig: MetricConfigOpt[];
  }
): any {
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return {};
  }
  const data = pods.map((d: Instance | any, idx: number) => {
    config.metrics.map((name: string, index: number) => {
      const c = (config.metricConfig && config.metricConfig[index]) || {};
      const key = name + idx + index;
      if (config.metricTypes[index] === MetricQueryTypes.ReadMetricsValue) {
        d[name] = aggregation(resp.data[key], c);
      }
      if (config.metricTypes[index] === MetricQueryTypes.ReadMetricsValues) {
        d[name] = resp.data[key].values.values.map((d: { value: number }) =>
          aggregation(d.value, c)
        );
      }
    });

    return d;
  });
  return data;
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

export function aggregation(val: number, config: any): number | string {
  let data: number | string = Number(val);

  switch (config.calculation) {
    case Calculations.Percentage:
      data = val / 100;
      break;
    case Calculations.ByteToKB:
      data = val / 1024;
      break;
    case Calculations.Apdex:
      data = val / 10000;
      break;
    case Calculations.ConvertSeconds:
      data = dayjs(val).format("YYYY-MM-DD HH:mm:ss");
      break;
    case Calculations.ConvertMilliseconds:
      data = dayjs.unix(val).format("YYYY-MM-DD HH:mm:ss");
      break;
    default:
      data;
      break;
  }

  return data;
}
