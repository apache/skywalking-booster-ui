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
import {
  InstanceTopology,
  EndpointTopology,
  ServicesTopology,
  ProcessTopology,
  HierarchyServiceTopology,
  HierarchyInstanceTopology,
  ListLayerLevels,
} from "../fragments/topology";

export const getInstanceTopology = `query queryData(${InstanceTopology.variable}) {${InstanceTopology.query}}`;
export const getEndpointTopology = `query queryData(${EndpointTopology.variable}) {${EndpointTopology.query}}`;
export const getServicesTopology = `query queryData(${ServicesTopology.variable}) {${ServicesTopology.query}}`;
export const getProcessTopology = `query queryData(${ProcessTopology.variable}) {${ProcessTopology.query}}`;
export const getHierarchyInstanceTopology = `query queryData(${HierarchyInstanceTopology.variable}) {${HierarchyInstanceTopology.query}}`;
export const getHierarchyServiceTopology = `query queryData(${HierarchyServiceTopology.variable}) {${HierarchyServiceTopology.query}}`;
export const queryListLayerLevels = `query queryLayerLevels {${ListLayerLevels.query}}`;
