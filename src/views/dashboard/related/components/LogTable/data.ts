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

export const ServiceLogConstants = [
  {
    label: "serviceName",
    value: "service",
    isVisible: true
  },
  {
    label: "serviceInstanceName",
    value: "instance",
    isVisible: true
  },
  {
    label: "endpointName",
    value: "endpoint",
    isVisible: true
  },
  {
    label: "timestamp",
    value: "time",
    isVisible: true
  },
  {
    label: "contentType",
    value: "contentType",
    isVisible: true
  },
  {
    label: "tags",
    value: "tags",
    isVisible: true
  },
  {
    label: "content",
    value: "content",
    isVisible: true
  },
  {
    label: "traceId",
    value: "traceID",
    isVisible: true
  },
];
export const ServiceLogDetail = [
  {
    label: "serviceName",
    value: "service",
  },
  {
    label: "serviceInstanceName",
    value: "instance",
  },
  {
    label: "timestamp",
    value: "time",
  },
  {
    label: "contentType",
    value: "contentType",
  },
  {
    label: "traceId",
    value: "traceID",
  },
  {
    label: "tags",
    value: "tags",
  },
  {
    label: "content",
    value: "content",
  },
];
// The order of columns should be time, service, error, stack, version, url, catalog, and grade.
export const BrowserLogConstants = [
  {
    label: "service",
    value: "service",
    isVisble: true,
  },
  {
    label: "serviceVersion",
    value: "serviceVersion",
    isVisble: true,
  },
  {
    label: "errorUrl",
    value: "errorPage",
    isVisble: true,
  },
  {
    label: "time",
    value: "time",
    isVisble: true,
  },
  {
    label: "message",
    value: "message",
    isVisble: true,
    // drag: true,
    method: 350,
  },
  {
    label: "stack",
    value: "stack",
    isVisble: true,
    // drag: true,
    method: 350,
  },
  {
    label: "category",
    value: "category",
    isVisble: true,
  },
  {
    label: "grade",
    value: "grade",
    isVisble: true,
  },
];
