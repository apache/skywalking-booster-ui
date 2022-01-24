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
import { RespFields, MetricQueryTypes, CalculationType } from "./data";
import { ElMessage } from "element-plus";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useSelectorStore } from "@/store/modules/selectors";
import { useAppStoreWithOut } from "@/store/modules/app";
import { Instance, Endpoint } from "@/types/selector";

export function useQueryProcessor(config: any) {
  if (!(config.metrics && config.metrics.length)) {
    return;
  }
  const appStore = useAppStoreWithOut();
  const dashboardStore = useDashboardStore();
  const selectorStore = useSelectorStore();
  const conditions: { [key: string]: unknown } = {
    duration: appStore.durationTime,
  };
  const variables: string[] = [`$duration: Duration!`];
  const { currentPod, currentService, currentDestPod, currentDestService } =
    selectorStore;
  const { entity } = dashboardStore;
  const isRelation = [
    "ServiceRelation",
    "ServiceInstanceRelation",
    "EndpointRelation",
  ].includes(entity);
  const fragment = config.metrics.map((name: string, index: number) => {
    const metricType = config.metricTypes[index] || "";
    const labels = ["0", "1", "2", "3", "4"];
    if (
      [
        MetricQueryTypes.ReadSampledRecords,
        MetricQueryTypes.SortMetrics,
      ].includes(metricType)
    ) {
      variables.push(`$condition${index}: TopNCondition!`);
      conditions[`condition${index}`] = {
        name,
        parentService: ["Service", "All"].includes(entity)
          ? null
          : currentService.value,
        normal: currentService.normal,
        scope: entity,
        topN: 10,
        order: "DES",
      };
    } else {
      if (metricType === MetricQueryTypes.ReadLabeledMetricsValues) {
        variables.push(`$labels${index}: [String!]!`);
        conditions[`labels${index}`] = labels;
      }
      variables.push(`$condition${index}: MetricsCondition!`);
      conditions[`condition${index}`] = {
        name,
        entity: {
          scope: entity,
          serviceName: entity === "All" ? undefined : currentService.value,
          normal: entity === "All" ? undefined : currentService.normal,
          serviceInstanceName: entity.includes("ServiceInstance")
            ? currentPod
            : undefined,
          endpointName: entity.includes("Endpoint") ? currentPod : undefined,
          destNormal: isRelation ? currentDestService.normal : undefined,
          destServiceName: isRelation ? currentDestService.value : undefined,
          destServiceInstanceName:
            entity === "ServiceInstanceRelation" ? currentDestPod : undefined,
          destEndpointName:
            entity === "EndpointRelation" ? currentDestPod : undefined,
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
  config: { metrics: string[]; metricTypes: string[] }
) {
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return {};
  }
  const source: { [key: string]: unknown } = {};
  const keys = Object.keys(resp.data);

  config.metricTypes.forEach((type: string, index) => {
    const m = config.metrics[index];

    if (type === MetricQueryTypes.ReadMetricsValues) {
      source[m] = resp.data[keys[index]].values.values.map(
        (d: { value: number }) => d.value
      );
    }
    if (type === MetricQueryTypes.ReadLabeledMetricsValues) {
      const resVal = Object.values(resp.data)[0] || [];
      const labelsIdx = ["0", "1", "2", "3", "4"];
      const labels = ["P50", "P75", "P90", "P95", "P99"];
      for (const item of resVal) {
        const values = item.values.values.map(
          (d: { value: number }) => d.value
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
      source[m] = Object.values(resp.data)[0];
    }
    if (
      type === MetricQueryTypes.SortMetrics ||
      type === MetricQueryTypes.ReadSampledRecords
    ) {
      source[m] = Object.values(resp.data)[0] || [];
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
function aggregation(json: {
  data: number;
  type: string;
  aggregationNum: number;
}) {
  if (isNaN(json.aggregationNum)) {
    return json.data;
  }
  if (json.type === CalculationType.Plus) {
    return json.data + json.aggregationNum;
  }
  if (json.type === CalculationType.Minus) {
    return json.data - json.aggregationNum;
  }
  if (json.type === CalculationType.Multiplication) {
    return json.data * json.aggregationNum;
  }
  if (json.type === CalculationType.Division) {
    return json.data / json.aggregationNum;
  }
  return json.data;
}

export function useQueryPodsMetrics(
  pods: Array<Instance | Endpoint>,
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

  const fragmentList = pods.map((d: Instance | Endpoint, index: number) => {
    const param = {
      scope,
      serviceName: currentService.label,
      serviceInstanceName: scope === "ServiceInstance" ? d.label : undefined,
      endpointName: scope === "Endpoint" ? d.label : undefined,
      normal: currentService.normal,
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
  });
  const fragment = fragmentList.flat(1).join(" ");
  const queryStr = `query queryData(${variables}) {${fragment}}`;

  return { queryStr, conditions };
}
export function usePodsSource(
  pods: Array<Instance | Endpoint>,
  resp: { errors: string; data: { [key: string]: any } },
  config: { metrics: string[]; metricTypes: string[] }
): any {
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return {};
  }
  const data = pods.map((d: Instance | any, idx: number) => {
    config.metrics.map((name: string, index: number) => {
      const key = name + idx + index;

      d[name] = resp.data[key].values.values.map(
        (d: { value: number }) => d.value
      );
    });

    return d;
  });
  return data;
}
