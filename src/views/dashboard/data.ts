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
export const EntityType = [
  { value: "service", label: "Service" },
  { value: "all", label: "All" },
  { value: "endpoint", label: "Service Endpoint" },
  { value: "serviceInstance", label: "Service Instance" },
  { value: "serviceRelationClient", label: "Service Relation(client)" },
  { value: "serviceRelationServer", label: "Service Relation(server)" },
  {
    value: "serviceInstanceRelationClient",
    label: "Service Instance Relation(client)",
  },
  {
    value: "serviceInstanceRelationServer",
    label: "Service Instance Relation(server)",
  },
  { value: "endpointRelation", label: "Endpoint Relation" },
];
export const Options = [
  {
    value: "layer1",
    label: "layer1",
  },
  {
    value: "layer2",
    label: "layer2",
  },
  {
    value: "layer3",
    label: "layer3",
  },
  {
    value: "layer4",
    label: "layer4",
  },
  {
    value: "layer5",
    label: "layer5",
  },
];
