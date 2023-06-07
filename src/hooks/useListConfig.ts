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
import { MetricQueryTypes, Calculations } from "./data";
import { MetricModes } from "@/views/dashboard/data";

export function useListConfig(config: Indexable, index: number) {
  if (config.metricModes === MetricModes.Expression) {
    return {
      isLinear: false,
      isAvg: true,
    };
  }
  const i = Number(index);
  const types = [Calculations.Average, Calculations.ApdexAvg, Calculations.PercentageAvg];
  const calculation = config.metricConfig && config.metricConfig[i] && config.metricConfig[i].calculation;
  const isLinear =
    [MetricQueryTypes.ReadMetricsValues, MetricQueryTypes.ReadLabeledMetricsValues].includes(config.metricTypes[i]) &&
    !types.includes(calculation);
  const isAvg =
    [MetricQueryTypes.ReadMetricsValues, MetricQueryTypes.ReadLabeledMetricsValues].includes(config.metricTypes[i]) &&
    types.includes(calculation);

  return {
    isLinear,
    isAvg,
  };
}
