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
import type { AppRouteRecordRaw } from "@/types/router";
import { ROUTE_NAMES, ROUTE_PATHS, META_KEYS } from "./constants";
import Layout from "@/layout/Index.vue";

// Lazy load components for better performance
const List = () => import("@/views/dashboard/List.vue");
const New = () => import("@/views/dashboard/New.vue");
const Edit = () => import("@/views/dashboard/Edit.vue");
const Widget = () => import("@/views/dashboard/Widget.vue");

export const routesDashboard: AppRouteRecordRaw[] = [
  {
    path: "",
    component: Layout,
    name: ROUTE_NAMES.DASHBOARD,
    meta: {
      [META_KEYS.I18N_KEY]: "dashboards",
      [META_KEYS.ICON]: "dashboard_customize",
      [META_KEYS.HAS_GROUP]: true,
      [META_KEYS.ACTIVATE]: true,
      [META_KEYS.TITLE]: "Dashboards",
      [META_KEYS.BREADCRUMB]: true,
    },
    children: [
      // Dashboard List
      {
        path: ROUTE_PATHS.DASHBOARD.LIST,
        component: List,
        name: "DashboardList",
        meta: {
          [META_KEYS.I18N_KEY]: "dashboardList",
          [META_KEYS.ACTIVATE]: true,
          [META_KEYS.TITLE]: "Dashboard List",
          [META_KEYS.BREADCRUMB]: true,
        },
      },

      // New Dashboard
      {
        path: ROUTE_PATHS.DASHBOARD.NEW,
        component: New,
        name: "DashboardNew",
        meta: {
          [META_KEYS.I18N_KEY]: "dashboardNew",
          [META_KEYS.ACTIVATE]: true,
          [META_KEYS.TITLE]: "New Dashboard",
          [META_KEYS.BREADCRUMB]: true,
        },
      },

      // Dashboard Edit/Create Routes
      {
        path: "",
        redirect: ROUTE_PATHS.DASHBOARD.EDIT,
        name: "DashboardCreate",
        component: Edit,
        meta: {
          [META_KEYS.NOT_SHOW]: true,
        },
        children: [
          {
            path: ROUTE_PATHS.DASHBOARD.EDIT,
            component: Edit,
            name: "DashboardCreateChild",
            meta: {
              [META_KEYS.TITLE]: "Create Dashboard",
              [META_KEYS.BREADCRUMB]: true,
            },
          },
          {
            path: "/dashboard/:layerId/:entity/:name/tab/:activeTabIndex",
            component: Edit,
            name: "DashboardCreateActiveTabIndex",
            meta: {
              [META_KEYS.TITLE]: "Create Dashboard",
              [META_KEYS.BREADCRUMB]: true,
            },
          },
        ],
      },

      // Dashboard View Routes
      {
        path: "",
        component: Edit,
        name: "DashboardView",
        redirect: "/dashboard/:layerId/:entity/:serviceId/:name",
        meta: {
          [META_KEYS.NOT_SHOW]: true,
        },
        children: [
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:name",
            component: Edit,
            name: "DashboardViewChild",
            meta: {
              [META_KEYS.TITLE]: "View Dashboard",
              [META_KEYS.BREADCRUMB]: true,
            },
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:name/tab/:activeTabIndex",
            component: Edit,
            name: "DashboardViewActiveTabIndex",
            meta: {
              [META_KEYS.TITLE]: "View Dashboard",
              [META_KEYS.BREADCRUMB]: true,
            },
          },
        ],
      },

      // Service Relations Routes
      {
        path: "",
        redirect: "/dashboard/related/:layerId/:entity/:serviceId/:destServiceId/:name",
        component: Edit,
        name: "DashboardServiceRelations",
        meta: {
          [META_KEYS.NOT_SHOW]: true,
        },
        children: [
          {
            path: "/dashboard/related/:layerId/:entity/:serviceId/:destServiceId/:name",
            component: Edit,
            name: "DashboardViewServiceRelation",
            meta: {
              [META_KEYS.TITLE]: "Service Relations",
              [META_KEYS.BREADCRUMB]: true,
            },
          },
          {
            path: "/dashboard/related/:layerId/:entity/:serviceId/:destServiceId/:name/tab/:activeTabIndex",
            component: Edit,
            name: "DashboardViewServiceRelationActiveTabIndex",
            meta: {
              [META_KEYS.TITLE]: "Service Relations",
              [META_KEYS.BREADCRUMB]: true,
            },
          },
        ],
      },

      // Pod Routes
      {
        path: "",
        redirect: "/dashboard/:layerId/:entity/:serviceId/:podId/:name",
        component: Edit,
        name: "DashboardPods",
        meta: {
          [META_KEYS.NOT_SHOW]: true,
        },
        children: [
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:name",
            component: Edit,
            name: "DashboardViewPod",
            meta: {
              [META_KEYS.TITLE]: "Pod Dashboard",
              [META_KEYS.BREADCRUMB]: true,
            },
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:name/tab/:activeTabIndex",
            component: Edit,
            name: "DashboardViewPodActiveTabIndex",
            meta: {
              [META_KEYS.TITLE]: "Pod Dashboard",
              [META_KEYS.BREADCRUMB]: true,
            },
          },
        ],
      },

      // Process Routes
      {
        path: "",
        redirect: "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:name",
        component: Edit,
        name: "DashboardProcesses",
        meta: {
          [META_KEYS.NOT_SHOW]: true,
        },
        children: [
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:name",
            component: Edit,
            name: "DashboardViewProcess",
            meta: {
              [META_KEYS.TITLE]: "Process Dashboard",
              [META_KEYS.BREADCRUMB]: true,
            },
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:name/tab/:activeTabIndex",
            component: Edit,
            name: "DashboardViewProcessActiveTabIndex",
            meta: {
              [META_KEYS.TITLE]: "Process Dashboard",
              [META_KEYS.BREADCRUMB]: true,
            },
          },
        ],
      },

      // Pod Relations Routes
      {
        path: "",
        redirect: "/dashboard/:layerId/:entity/:serviceId/:podId/:destServiceId/:destPodId/:name",
        component: Edit,
        name: "DashboardPodRelations",
        meta: {
          [META_KEYS.NOT_SHOW]: true,
        },
        children: [
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:destServiceId/:destPodId/:name",
            component: Edit,
            name: "DashboardViewPodRelation",
            meta: {
              [META_KEYS.TITLE]: "Pod Relations",
              [META_KEYS.BREADCRUMB]: true,
            },
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:destServiceId/:destPodId/:name/tab/:activeTabIndex",
            component: Edit,
            name: "DashboardViewPodRelationActiveTabIndex",
            meta: {
              [META_KEYS.TITLE]: "Pod Relations",
              [META_KEYS.BREADCRUMB]: true,
            },
          },
        ],
      },

      // Process Relations Routes
      {
        path: "",
        redirect:
          "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:destServiceId/:destPodId/:destProcessId/:name",
        component: Edit,
        name: "DashboardProcessRelations",
        meta: {
          [META_KEYS.NOT_SHOW]: true,
        },
        children: [
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:destServiceId/:destPodId/:destProcessId/:name",
            component: Edit,
            name: "DashboardViewProcessRelation",
            meta: {
              [META_KEYS.TITLE]: "Process Relations",
              [META_KEYS.BREADCRUMB]: true,
            },
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:destServiceId/:destPodId/:destProcessId/:name/tab/:activeTabIndex",
            component: Edit,
            name: "DashboardViewProcessRelationActiveTabIndex",
            meta: {
              [META_KEYS.TITLE]: "Process Relations",
              [META_KEYS.BREADCRUMB]: true,
            },
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:destServiceId/:destPodId/:destProcessId/:name/duration/:duration",
            component: Edit,
            name: "DashboardViewProcessRelationDuration",
            meta: {
              [META_KEYS.TITLE]: "Process Relations",
              [META_KEYS.BREADCRUMB]: true,
            },
          },
        ],
      },

      // Widget Routes
      {
        path: "",
        name: "DashboardWidget",
        component: Widget,
        meta: {
          [META_KEYS.NOT_SHOW]: true,
        },
        children: [
          {
            path: ROUTE_PATHS.DASHBOARD.WIDGET,
            component: Widget,
            name: "DashboardViewWidget",
            meta: {
              [META_KEYS.TITLE]: "Dashboard Widget",
              [META_KEYS.BREADCRUMB]: true,
            },
          },
        ],
      },
    ],
  },
];
