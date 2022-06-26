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

export const routesMesh: Array<RouteRecordRaw> = [
  {
    path: "",
    name: "ServiceMesh",
    redirect: "/mesh/services",
    meta: {
      title: "serviceMesh",
      icon: "epic",
      hasGroup: true,
    },
    component: Layout,
    children: [
      {
        path: "/mesh/services",
        name: "MeshServices",
        meta: {
          notShow: false,
          title: "services",
        },
        component: () =>
          import(/* webpackChunkName: "layer" */ "@/views/Layer.vue"),
      },
      {
        path: "/mesh/services/tab/:activeTabIndex",
        name: "MeshServicesActiveTabIndex",
        meta: {
          notShow: true,
        },
        component: () =>
          import(/* webpackChunkName: "layer" */ "@/views/Layer.vue"),
      },
      {
        path: "/mesh/controlPanel",
        name: "ControlPanel",
        meta: {
          notShow: false,
          title: "controlPanel",
        },
        component: () =>
          import(/* webpackChunkName: "layer" */ "@/views/Layer.vue"),
      },
      {
        path: "/mesh/controlPanel/tab/:activeTabIndex",
        name: "ControlPanelActiveTabIndex",
        meta: {
          notShow: true,
        },
        component: () =>
          import(/* webpackChunkName: "layer" */ "@/views/Layer.vue"),
      },
      {
        path: "/mesh/dataPanel",
        name: "DataPanel",
        meta: {
          notShow: false,
          title: "dataPanel",
        },
        component: () =>
          import(/* webpackChunkName: "layer" */ "@/views/Layer.vue"),
      },
      {
        path: "/mesh/dataPanel/tab/:activeTabIndex",
        name: "DataPanelActiveTabIndex",
        meta: {
          notShow: true,
          title: "dataPanelActiveTabIndex",
        },
        component: () =>
          import(/* webpackChunkName: "layer" */ "@/views/Layer.vue"),
      },
    ],
  },
];
