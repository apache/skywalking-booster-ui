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
        path: "",
        redirect: "/dashboard/:layerId/:entity/:name",
        name: "Create",
        component: () =>
          import(
            /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
          ),
        meta: {
          notShow: true,
        },
        children: [
          {
            path: "/dashboard/:layerId/:entity/:name",
            component: () =>
              import(
                /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
              ),
            name: "CreateChild",
          },
          {
            path: "/dashboard/:layerId/:entity/:name/tab/:activeTabIndex",
            component: () =>
              import(
                /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
              ),
            name: "CreateActiveTabIndex",
          },
        ],
      },
      {
        path: "",
        component: () =>
          import(
            /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
          ),
        name: "View",
        redirect: "/dashboard/:layerId/:entity/:serviceId/:name",
        meta: {
          notShow: true,
        },
        children: [
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:name",
            component: () =>
              import(
                /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
              ),
            name: "ViewChild",
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:name/tab/:activeTabIndex",
            component: () =>
              import(
                /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
              ),
            name: "ViewActiveTabIndex",
          },
        ],
      },
      {
        path: "",
        redirect:
          "/dashboard/related/:layerId/:entity/:serviceId/:destServiceId/:name",
        component: () =>
          import(
            /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
          ),
        name: "ViewServiceRelation",
        meta: {
          notShow: true,
        },
        children: [
          {
            path: "/dashboard/related/:layerId/:entity/:serviceId/:destServiceId/:name",
            component: () =>
              import(
                /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
              ),
            name: "ViewServiceRelation",
          },
          {
            path: "/dashboard/related/:layerId/:entity/:serviceId/:destServiceId/:name/tab/:activeTabIndex",
            component: () =>
              import(
                /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
              ),
            name: "ViewServiceRelationActiveTabIndex",
          },
        ],
      },
      {
        path: "",
        redirect: "/dashboard/:layerId/:entity/:serviceId/:podId/:name",
        component: () =>
          import(
            /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
          ),
        name: "ViewPod",
        meta: {
          notShow: true,
        },
        children: [
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:name",
            component: () =>
              import(
                /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
              ),
            name: "ViewPod",
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:name/tab/:activeTabIndex",
            component: () =>
              import(
                /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
              ),
            name: "ViewPodActiveTabIndex",
          },
        ],
      },
      {
        path: "",
        redirect:
          "/dashboard/:layerId/:entity/:serviceId/:podId/:destServiceId/:destPodId/:name",
        component: () =>
          import(
            /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
          ),
        name: "PodRelation",
        meta: {
          notShow: true,
        },
        children: [
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:destServiceId/:destPodId/:name",
            component: () =>
              import(
                /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
              ),
            name: "ViewPodRelation",
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:destServiceId/:destPodId/:name/tab/:activeTabIndex",
            component: () =>
              import(
                /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
              ),
            name: "ViewPodRelationActiveTabIndex",
          },
        ],
      },
      {
        path: "",
        redirect:
          "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:destServiceId/:destPodId/:destProcessId/:name",
        component: () =>
          import(
            /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
          ),
        name: "ProcessRelation",
        meta: {
          notShow: true,
        },
        children: [
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:destServiceId/:destPodId/:destProcessId/:name",
            component: () =>
              import(
                /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
              ),
            name: "ViewProcessRelation",
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:destServiceId/:destPodId/:destProcessId/:name/tab/:activeTabIndex",
            component: () =>
              import(
                /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
              ),
            name: "ViewProcessRelationActiveTabIndex",
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:destServiceId/:destPodId/:destProcessId/:name/duration/:duration",
            component: () =>
              import(
                /* webpackChunkName: "dashboards" */ "@/views/dashboard/Edit.vue"
              ),
            name: "ViewProcessRelationDuration",
          },
        ],
      },
    ],
  },
];
