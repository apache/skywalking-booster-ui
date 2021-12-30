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

export const routesAlert: Array<RouteRecordRaw> = [
  {
    path: "",
    name: "Alerts",
    meta: {
      title: "alerts",
      icon: "notification_important",
      hasGroup: true,
      exact: true,
    },
    component: Layout,
    children: [
      {
        path: "/alerts",
        name: "alertSettings",
        meta: {
          title: "Alert Settings",
          icon: "notification_important",
          hasGroup: false,
          exact: false,
        },
        component: () => import("@/views/alert/Settings.vue"),
      },
      {
        path: "/alert/channels",
        name: "alertChannels",
        meta: {
          title: "Alert Channels",
          icon: "notification_important",
          hasGroup: false,
          exact: false,
        },
        component: () => import("@/views/alert/Channels.vue"),
      },
    ],
  },
];
