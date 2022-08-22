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
export enum TimeType {
  MINUTE_TIME = "MINUTE",
  HOUR_TIME = "HOUR",
  DAY_TIME = "DAY",
}

export const Languages = [
  { label: "English", value: "en" },
  { label: "Chinese", value: "zh" },
  { label: "Spanish", value: "es" },
];

export const RoutesMap: { [key: string]: string } = {
  GeneralServices: "GENERAL",
  GeneralServicesActiveTabIndex: "GENERAL",
  VirtualDatabase: "VIRTUAL_DATABASE",
  VirtualDatabaseActiveTabIndex: "VIRTUAL_DATABASE",
  MeshServices: "MESH",
  MeshServicesActiveTabIndex: "MESH",
  ControlPanel: "MESH_CP",
  ControlPanelActiveTabIndex: "MESH_CP",
  DataPanel: "MESH_DP",
  DataPanelActiveTabIndex: "MESH_DP",
  Linux: "OS_LINUX",
  SkyWalkingServer: "SO11Y_OAP",
  SkyWalkingServerActiveTabIndex: "SO11Y_OAP",
  SatelliteActiveTabIndex: "SO11Y_SATELLITE",
  Satellite: "SO11Y_SATELLITE",
  Functions: "FAAS",
  FunctionsActiveTabIndex: "FAAS",
  Browser: "BROWSER",
  BrowserActiveTabIndex: "BROWSER",
  KubernetesCluster: "K8S",
  KubernetesClusterActiveTabIndex: "K8S",
  KubernetesService: "K8S_SERVICE",
  KubernetesServiceActiveTabIndex: "K8S_SERVICE",
  MySQL: "MYSQL",
  MySQLActiveTabIndex: "MYSQL",
  PostgreSQL: "POSTGRESQL",
  PostgreSQLActiveTabIndex: "POSTGRESQL",
};
