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

export const DurationOptions = [
  { value: "30", label: "30 sec" },
  { value: "60", label: "1 min" },
  { value: "300", label: "5 min" },
  { value: "600", label: "10 min" },
  { value: "900", label: "15 min" },
  { value: "custom", label: "Custom" },
];

export const ProfilingEvents = ["CPU", "ALLOC", "LOCK", "WALL", "CTIMER", "ITIMER"];

export enum EventsMap {
  CPU = "EXECUTION_SAMPLE",
  WALL = "EXECUTION_SAMPLE",
  CTIMER = "EXECUTION_SAMPLE",
  ITIMER = "EXECUTION_SAMPLE",
  LOCK = "LOCK",
  OBJECT_ALLOCATION_IN_NEW_TLAB = "OBJECT_ALLOCATION_IN_NEW_TLAB",
  OBJECT_ALLOCATION_OUTSIDE_TLAB = "OBJECT_ALLOCATION_OUTSIDE_TLAB",
}

export enum JFREventType {
  EXECUTION_SAMPLE = "EXECUTION_SAMPLE",
  LOCK = "LOCK",
  OBJECT_ALLOCATION_IN_NEW_TLAB = "OBJECT_ALLOCATION_IN_NEW_TLAB",
  OBJECT_ALLOCATION_OUTSIDE_TLAB = "OBJECT_ALLOCATION_OUTSIDE_TLAB",
  PROFILER_LIVE_OBJECT = "PROFILER_LIVE_OBJECT",
}

export const ComponentType = "ASYNC_PROFILING";
