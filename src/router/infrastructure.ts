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

export const routesInfra: Array<RouteRecordRaw> = [
  {
    path: "",
    name: "Infrastructure",
    meta: {
      title: "infrastructure",
      icon: "scatter_plot",
      exact: true,
      hasGroup: true,
    },
    redirect: "/linux",
    component: Layout,
    children: [
      {
        path: "/linux",
        name: "Linux",
        meta: {
          title: "linux",
        },
        component: () =>
          import(/* webpackChunkName: "layer" */ "@/views/Layer.vue"),
      },
      {
        path: "/linux/tab/:activeTabIndex",
        name: "LinuxActiveTabIndex",
        meta: {
          title: "linux",
          notShow: true,
        },
        component: () =>
          import(/* webpackChunkName: "layer" */ "@/views/Layer.vue"),
      },
      // {
      //   path: "/infrastructure/vm",
      //   name: "VirtualMachine",
      //   meta: {
      //     title: "virtualMachine",
      //   },
      //   component: () => import("@/views/infrastructure/Infrastructure.vue"),
      // },
      // {
      //   path: "/infrastructure/k8s",
      //   name: "Kubernetes",
      //   meta: {
      //     title: "kubernetes",
      //   },
      //   component: () => import("@/views/infrastructure/Infrastructure.vue"),
      // },
    ],
  },
];
