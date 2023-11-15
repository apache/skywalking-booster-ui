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
export enum MetricQueryTypes {
  ReadMetricsValue = "readMetricsValue",
  ReadMetricsValues = "readMetricsValues",
  SortMetrics = "sortMetrics",
  ReadLabeledMetricsValues = "readLabeledMetricsValues",
  READHEATMAP = "readHeatMap",
  ReadSampledRecords = "readSampledRecords",
  ReadRecords = "readRecords",
  ReadNullableMetricsValue = "readNullableMetricsValue",
}

export enum Calculations {
  Percentage = "percentage",
  ByteToKB = "byteToKB",
  ByteToMB = "byteToMB",
  ByteToGB = "byteToGB",
  Apdex = "apdex",
  ConvertSeconds = "convertSeconds",
  ConvertMilliseconds = "convertMilliseconds",
  MsToS = "msTos",
  Average = "average",
  PercentageAvg = "percentageAvg",
  ApdexAvg = "apdexAvg",
  SecondToDay = "secondToDay",
  NanosecondToMillisecond = "nanosecondToMillisecond",
}
export enum sizeEnum {
  XS = "XS",
  SM = "SM",
  MD = "MD",
  LG = "LG",
  XL = "XL",
  XXL = "XXL",
}

export enum screenEnum {
  XS = 480,
  SM = 576,
  MD = 768,
  LG = 992,
  XL = 1200,
  XXL = 1600,
}

export const screenMap = new Map<sizeEnum, number>();

screenMap.set(sizeEnum.XS, screenEnum.XS);
screenMap.set(sizeEnum.SM, screenEnum.SM);
screenMap.set(sizeEnum.MD, screenEnum.MD);
screenMap.set(sizeEnum.LG, screenEnum.LG);
screenMap.set(sizeEnum.XL, screenEnum.XL);
screenMap.set(sizeEnum.XXL, screenEnum.XXL);

export const RespFields: Indexable = {
  readMetricsValues: `{
    label
    values {
      values {value isEmptyValue}
    }
  }`,
  readMetricsValue: ``,
  readNullableMetricsValue: `{
    value
    isEmptyValue
  }`,
  sortMetrics: `{
    name
    id
    value
    refId
  }`,
  readLabeledMetricsValues: `{
    label
    values {
      values {value isEmptyValue}
    }
  }`,
  readHeatMap: `{
    values {
      id
      values
    }
    buckets {
      min
      max
    }
  }`,
  readSampledRecords: `{
    name
    value
    refId
  }`,
  readRecords: `{
    id
    name
    value
    refId
  }`,
  execExpression: `{
    type
    results {
      metric {
        labels {
          key
          value
        }
      }
      values {
        name: id
        value
        refId: traceID
      }
    }
    error
  }`,
};

export const DarkChartColors = [
  "#79bbff",
  "#a0a7e6",
  "#30A4EB",
  "#45BFC0",
  "#ebbf93",
  "#884dde",
  "#1bbf93",
  "#7289ab",
  "#f56c6c",
  "#81feb7",
  "#4094fa",
  "#ff894d",
  "#884dde",
  "#ebbf93",
  "#fedc6d",
  "#da7cfa",
  "#b88230",
  "#a0cfff",
];

export const LightChartColors = [
  "#3f96e3",
  "#a0a7e6",
  "#45BFC0",
  "#FFCC55",
  "#FF6A84",
  "#c23531",
  "#2f4554",
  "#61a0a8",
  "#d48265",
  "#91c7ae",
  "#749f83",
  "#ca8622",
  "#bda29a",
  "#6e7074",
  "#546570",
  "#c4ccd3",
];
