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
  { value: "5", label: "5 min" },
  { value: "10", label: "10 min" },
  { value: "15", label: "15 min" },
];

export const ProfilingEvents = [
  { value: "CPU", label: "CPU" },
  { value: "ALLOC", label: "ALLOC" },
  { value: "WALL", label: "WALL" },
  { value: "LOCK", label: "LOCK" },
  { value: "CTIMER", label: "CTIMER" },
  { value: "ITIMER", label: "ITIMER" },
];

export enum EventsMap {
  CPU = "EXECUTION_SAMPLE",
  WALL = "EXECUTION_SAMPLE",
  CTIMER = "EXECUTION_SAMPLE",
  ITIMER = "EXECUTION_SAMPLE",
  LOCK = "JAVA_MONITOR_ENTER",
  ALLOC = "OBJECT_ALLOCATION_OUTSIDE_TLAB",
}
