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

export const routesSelf: Array<RouteRecordRaw> = [
  {
    path: "",
    name: "SelfObservability",
    redirect: "/self/skyWalkingServer",
    meta: {
      title: "selfObservability",
      icon: "logo",
      hasGroup: true,
    },
    component: Layout,
    children: [
      {
        path: "/self/skyWalkingServer",
        name: "SkyWalkingServer",
        meta: {
          title: "skyWalkingServer",
        },
        component: () =>
          import(/* webpackChunkName: "layer" */ "@/views/Layer.vue"),
      },
      {
        path: "/self/skyWalkingServer/tab/:activeTabIndex",
        name: "SkyWalkingServerActiveTabIndex",
        meta: {
          notShow: true,
        },
        component: () =>
          import(/* webpackChunkName: "layer" */ "@/views/Layer.vue"),
      },
      {
        path: "/self/satellite",
        name: "Satellite",
        meta: {
          title: "satellite",
        },
        component: () =>
          import(/* webpackChunkName: "layer" */ "@/views/Layer.vue"),
      },
      {
        path: "/self/satellite/tab/:activeTabIndex",
        name: "SatelliteActiveTabIndex",
        meta: {
          notShow: true,
        },
        component: () =>
          import(/* webpackChunkName: "layer" */ "@/views/Layer.vue"),
      },
    ],
  },
];
