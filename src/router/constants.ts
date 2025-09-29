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

// Route Names
export const ROUTE_NAMES = {
  MARKETPLACE: "Marketplace",
  DASHBOARD: "Dashboard",
  ALARM: "Alarm",
  SETTINGS: "Settings",
  NOT_FOUND: "NotFound",
  LAYER: "Layer",
  TRACE: "Trace",
} as const;

// Route Paths
export const ROUTE_PATHS = {
  ROOT: "/",
  MARKETPLACE: "/marketplace",
  DASHBOARD: {
    LIST: "/dashboard/list",
    NEW: "/dashboard/new",
    EDIT: "/dashboard/:layerId/:entity/:name",
    VIEW: "/dashboard/:layerId/:entity/:serviceId/:name",
    WIDGET:
      "/page/:layer/:entity/:serviceId/:podId/:processId/:destServiceId/:destPodId/:destProcessId/:config/:duration?",
  },
  ALARM: "/alerting",
  SETTINGS: "/settings",
  TRACE: "/traces/:traceId",
  NOT_FOUND: "/:pathMatch(.*)*",
} as const;

// Route Meta Keys
export const META_KEYS = {
  I18N_KEY: "i18nKey",
  ICON: "icon",
  HAS_GROUP: "hasGroup",
  ACTIVATE: "activate",
  TITLE: "title",
  DESC_KEY: "descKey",
  LAYER: "layer",
  NOT_SHOW: "notShow",
  REQUIRES_AUTH: "requiresAuth",
  BREADCRUMB: "breadcrumb",
} as const;

// Default Route
export const DEFAULT_ROUTE = ROUTE_PATHS.MARKETPLACE;
