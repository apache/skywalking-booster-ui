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

export const MonitorType: any = [
  { label: "PROCESS_CPU", value: "PROCESS_CPU" },
  { label: "PROCESS_THREAD_COUNT", value: "PROCESS_THREAD_COUNT" },
  { label: "SYSTEM_LOAD", value: "SYSTEM_LOAD" },
  { label: "HTTP_ERROR_RATE", value: "HTTP_ERROR_RATE" },
  { label: "HTTP_AVG_RESPONSE_TIME", value: "HTTP_AVG_RESPONSE_TIME" },
];

export const TargetTypes = [
  { label: "ON_CPU", value: "ON_CPU" },
  { label: "OFF_CPU", value: "OFF_CPU" },
  { label: "NETWORK", value: "NETWORK" },
];

export const ComponentType = "CONTINOUS_PROFILING";

export const HeaderLabels = [
  { value: "triggeredCount", label: "Triggered Count", width: 150 },
  { value: "lastTriggerTime", label: "Last Trigger Time", width: 170 },
];

export const HeaderChildLabels = [
  { value: "detectType", label: "Detect Type", width: 100 },
  { value: "triggeredCount", label: "Triggered Count", width: 120 },
  { value: "lastTriggerTime", label: "Last Trigger Time", width: 160 },
  { value: "labels", label: "Labels" },
];
