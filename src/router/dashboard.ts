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
import { RouteRecordRaw } from "vue-router";
import Layout from "@/layout/Index.vue";

export const routesDashboard: Array<RouteRecordRaw> = [
  {
    path: "",
    component: Layout,
    name: "Dashboard",
    meta: {
      title: "dashboards",
      icon: "dashboard_customize",
      hasGroup: true,
      exact: true,
    },
    children: [
      {
        path: "/dashboard/list",
        component: () => import("@/views/dashboard/List.vue"),
        name: "List",
        meta: {
          title: "dashboardList",
          exact: false,
        },
      },
      {
        path: "/dashboard/new",
        component: () => import("@/views/dashboard/New.vue"),
        name: "New",
        meta: {
          title: "dashboardNew",
          exact: false,
        },
      },
      {
        path: "/dashboard/edit/service/:serviceId",
        component: () => import("@/views/dashboard/Edit.vue"),
        name: "serviceEdit",
        meta: {
          title: "dashboardEdit",
          exact: false,
          notShow: true,
        },
      },
      {
        path: "/dashboard/edit/endpoint/:serviceId/:endpointId",
        component: () => import("@/views/dashboard/Edit.vue"),
        name: "endpointEdit",
        meta: {
          title: "dashboardEdit",
          exact: false,
          notShow: true,
        },
      },
      {
        path: "/dashboard/edit/instance/:serviceId/:instanceId",
        component: () => import("@/views/dashboard/Edit.vue"),
        name: "instanceEdit",
        meta: {
          title: "dashboardEdit",
          exact: false,
          notShow: true,
        },
      },
    ],
  },
];
