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
export const TabsConfig: { [key: string]: any } = {
  GeneralService: [
    { name: "metrics", path: "/generalService/metrics" },
    { name: "traces", path: "/generalService/traces" },
    { name: "profiles", path: "/generalService/profiles" },
    { name: "services", path: "/generalService" },
  ],
  ServiceMesh: [
    { name: "services", path: "/serviceMesh" },
    { name: "metrics", path: "/serviceMesh/metrics" },
    { name: "traces", path: "/serviceMesh/traces" },
    { name: "profiles", path: "/serviceMesh/profiles" },
  ],
};
export const PagesConfig = [
  { label: "generalService", name: "GeneralService" },
  { label: "serviceMesh", name: "ServiceMesh" },
  { label: "virtualMachine", name: "VirtualMachine" },
  { label: "dashboardHome", name: "DashboardHome" },
  { label: "dashboardList", name: "DashboardList" },
  { label: "logs", name: "Logs" },
  { label: "settings", name: "Settings" },
  { label: "events", name: "Events" },
  { label: "alerts", name: "Alerts" },
];
