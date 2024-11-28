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
export const ProfileMode: any[] = [
  { label: "Include Children", value: "include" },
  { label: "Exclude Children", value: "exclude" },
];
export const NewTaskField = {
  service: { key: "", label: "None" },
  monitorTime: { key: "0", label: "monitor now" },
  monitorDuration: { key: 5, label: "5 min" },
  minThreshold: 0,
  dumpPeriod: { key: 10, label: "10ms" },
  endpointName: "",
  maxSamplingCount: { key: 5, label: "5" },
};

export const TargetTypes = [
  { label: "ON_CPU", value: "ON_CPU" },
  { label: "OFF_CPU", value: "OFF_CPU" },
];

export const AggregateTypes = [
  { label: "Count", value: "COUNT" },
  { label: "Duration", value: "DURATION" },
];

export const InitTaskField = {
  monitorTimeEn: [
    { value: "0", label: "monitor now" },
    { value: "1", label: "set start time" },
  ],
  monitorTimeCn: [
    { value: "0", label: "此刻" },
    { value: "1", label: "设置时间" },
  ],
  monitorDuration: [
    { value: "5", label: "5 min" },
    { value: "10", label: "10 min" },
    { value: "15", label: "15 min" },
  ],
};
export const TableHeader = [
  { property: "name", label: "Name" },
  { property: "instanceName", label: "Instance Name" },
];
