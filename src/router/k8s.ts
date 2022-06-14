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

export const routesK8s: Array<RouteRecordRaw> = [
  {
    path: "",
    name: "Kubernetes",
    meta: {
      title: "kubernetes",
      icon: "donut_small",
      hasGroup: true,
    },
    redirect: "/kubernetes/cluster",
    component: Layout,
    children: [
      {
        path: "/kubernetes/cluster",
        name: "KubernetesCluster",
        meta: {
          notShow: false,
          title: "kubernetesCluster",
        },
        component: () =>
          import(/* webpackChunkName: "layer" */ "@/views/Layer.vue"),
      },
      {
        path: "/kubernetes/cluster/tab/:activeTabIndex",
        name: "KubernetesClusterActiveTabIndex",
        meta: {
          notShow: true,
          title: "kubernetesClusterActiveTabIndex",
        },
        component: () =>
          import(/* webpackChunkName: "layer" */ "@/views/Layer.vue"),
      },
      {
        path: "/kubernetes/service",
        name: "KubernetesService",
        meta: {
          notShow: false,
          title: "kubernetesService",
        },
        component: () =>
          import(/* webpackChunkName: "layer" */ "@/views/Layer.vue"),
      },
      {
        path: "/kubernetes/service/tab/:activeTabIndex",
        name: "KubernetesServiceActiveTabIndex",
        meta: {
          notShow: true,
          title: "kubernetesServiceActiveTabIndex",
        },
        component: () =>
          import(/* webpackChunkName: "layer" */ "@/views/Layer.vue"),
      },
    ],
  },
];
