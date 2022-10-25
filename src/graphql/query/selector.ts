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
  Services,
  Layers,
  Endpoints,
  Instances,
  getService,
  getInstance,
  getEndpoint,
  Processes,
  getProcess,
} from "../fragments/selector";

export const queryServices = `query queryServices(${Services.variable}) {${Services.query}}`;
export const queryEndpoints = `query queryEndpoints(${Endpoints.variable}) {${Endpoints.query}}`;
export const queryInstances = `query queryInstances(${Instances.variable}) {${Instances.query}}`;
export const queryLayers = `query listLayer {${Layers.query}}`;
export const queryService = `query queryService(${getService.variable}) {${getService.query}}`;
export const queryInstance = `query queryInstance(${getInstance.variable}) {${getInstance.query}}`;
export const queryEndpoint = `query queryEndpoint(${getEndpoint.variable}) {${getEndpoint.query}}`;
export const queryProcesses = `query queryProcesses(${Processes.variable}) {${Processes.query}}`;
export const queryProcess = `query queryProcess(${getProcess.variable}) {${getProcess.query}}`;
