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
import type { RouteRecordRaw } from "vue-router";
import Layout from "@/layout/Index.vue";
import List from "@/views/dashboard/List.vue";
import New from "@/views/dashboard/New.vue";
import Edit from "@/views/dashboard/Edit.vue";
import Widget from "@/views/dashboard/Widget.vue";

export const routesDashboard: Array<RouteRecordRaw> = [
  {
    path: "",
    component: Layout,
    name: "Dashboard",
    meta: {
      i18nKey: "dashboards",
      icon: "dashboard_customize",
      hasGroup: true,
      activate: true,
      title: "Dashboards",
    },
    children: [
      {
        path: "/dashboard/list",
        component: List,
        name: "List",
        meta: {
          i18nKey: "dashboardList",
          activate: true,
          title: "Dashboard List",
        },
      },
      {
        path: "/dashboard/new",
        component: New,
        name: "New",
        meta: {
          i18nKey: "dashboardNew",
          activate: true,
          title: "New Dashboard",
        },
      },
      {
        path: "",
        redirect: "/dashboard/:layerId/:entity/:name",
        name: "Create",
        component: Edit,
        meta: {
          notShow: true,
        },
        children: [
          {
            path: "/dashboard/:layerId/:entity/:name",
            component: Edit,
            name: "CreateChild",
          },
          {
            path: "/dashboard/:layerId/:entity/:name/tab/:activeTabIndex",
            component: Edit,
            name: "CreateActiveTabIndex",
          },
        ],
      },
      {
        path: "",
        component: Edit,
        name: "View",
        redirect: "/dashboard/:layerId/:entity/:serviceId/:name",
        meta: {
          notShow: true,
        },
        children: [
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:name",
            component: Edit,
            name: "ViewChild",
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:name/tab/:activeTabIndex",
            component: Edit,
            name: "ViewActiveTabIndex",
          },
        ],
      },
      {
        path: "",
        redirect: "/dashboard/related/:layerId/:entity/:serviceId/:destServiceId/:name",
        component: Edit,
        name: "ViewServiceRelation",
        meta: {
          notShow: true,
        },
        children: [
          {
            path: "/dashboard/related/:layerId/:entity/:serviceId/:destServiceId/:name",
            component: Edit,
            name: "ViewServiceRelation",
          },
          {
            path: "/dashboard/related/:layerId/:entity/:serviceId/:destServiceId/:name/tab/:activeTabIndex",
            component: Edit,
            name: "ViewServiceRelationActiveTabIndex",
          },
        ],
      },
      {
        path: "",
        redirect: "/dashboard/:layerId/:entity/:serviceId/:podId/:name",
        component: Edit,
        name: "ViewPod",
        meta: {
          notShow: true,
        },
        children: [
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:name",
            component: Edit,
            name: "ViewPod",
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:name/tab/:activeTabIndex",
            component: Edit,
            name: "ViewPodActiveTabIndex",
          },
        ],
      },
      {
        path: "",
        redirect: "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:name",
        component: Edit,
        name: "ViewProcess",
        meta: {
          notShow: true,
        },
        children: [
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:name",
            component: Edit,
            name: "ViewProcess",
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:name/tab/:activeTabIndex",
            component: Edit,
            name: "ViewProcessActiveTabIndex",
          },
        ],
      },
      {
        path: "",
        redirect: "/dashboard/:layerId/:entity/:serviceId/:podId/:destServiceId/:destPodId/:name",
        component: Edit,
        name: "PodRelation",
        meta: {
          notShow: true,
        },
        children: [
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:destServiceId/:destPodId/:name",
            component: Edit,
            name: "ViewPodRelation",
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:destServiceId/:destPodId/:name/tab/:activeTabIndex",
            component: Edit,
            name: "ViewPodRelationActiveTabIndex",
          },
        ],
      },
      {
        path: "",
        redirect:
          "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:destServiceId/:destPodId/:destProcessId/:name",
        component: Edit,
        name: "ProcessRelation",
        meta: {
          notShow: true,
        },
        children: [
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:destServiceId/:destPodId/:destProcessId/:name",
            component: Edit,
            name: "ViewProcessRelation",
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:destServiceId/:destPodId/:destProcessId/:name/tab/:activeTabIndex",
            component: Edit,
            name: "ViewProcessRelationActiveTabIndex",
          },
          {
            path: "/dashboard/:layerId/:entity/:serviceId/:podId/:processId/:destServiceId/:destPodId/:destProcessId/:name/duration/:duration",
            component: Edit,
            name: "ViewProcessRelationDuration",
          },
        ],
      },
      {
        path: "",
        name: "Widget",
        component: Widget,
        meta: {
          notShow: true,
        },
        children: [
          {
            path: "/page/:layer/:entity/:serviceId/:podId/:processId/:destServiceId/:destPodId/:destProcessId/:config/:duration?",
            component: Widget,
            name: "ViewWidget",
          },
        ],
      },
    ],
  },
];
