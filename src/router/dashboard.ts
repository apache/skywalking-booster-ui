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
        component: () =>
          import(
            /* webpackChunkName: "dashboards" */ "@/views/dashboard/List.vue"
          ),
        name: "List",
        meta: {
          title: "dashboardList",
          exact: false,
        },
      },
      {
        path: "/dashboard/new",
        component: () =>
          import(
            /* webpackChunkName: "dashboards" */ "@/views/dashboard/New.vue"
          ),
        name: "New",
        meta: {
          title: "dashboardNew",
          exact: false,
        },
      },
      {
        path: "/dashboard/:layerId/:entity/:name",
        component: () =>
          import(
            /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
          ),
        name: "Create",
        meta: {
          title: "dashboardEdit",
          exact: false,
          notShow: true,
        },
      },
      {
        path: "/dashboard/:layerId/:entity/:serviceId/:name",
        component: () =>
          import(
            /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
          ),
        name: "View",
        meta: {
          title: "dashboardEdit",
          exact: false,
          notShow: true,
        },
      },
      {
        path: "/dashboard/related/:layerId/:entity/:serviceId/:destServiceId/:name",
        component: () =>
          import(
            /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
          ),
        name: "ViewServiceRelation",
        meta: {
          title: "dashboardEdit",
          exact: false,
          notShow: true,
        },
      },
      {
        path: "/dashboard/:layerId/:entity/:serviceId/:podId/:name",
        component: () =>
          import(
            /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
          ),
        name: "ViewPod",
        meta: {
          title: "dashboardEdit",
          exact: false,
          notShow: true,
        },
      },
      {
        path: "/dashboard/:layerId/:entity/:serviceId/:podId/:destServiceId/:destPodId/:name",
        component: () =>
          import(
            /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
          ),
        name: "ViewPodRelation",
        meta: {
          title: "dashboardEdit",
          exact: true,
          notShow: true,
        },
      },
    ],
  },
];
