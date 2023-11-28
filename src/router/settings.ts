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
import Settings from "@/views/Settings.vue";

export const routesSettings: Array<RouteRecordRaw> = [
  {
    path: "",
    name: "Settings",
    meta: {
      i18nKey: "settings",
      icon: "settings",
      hasGroup: false,
      activate: true,
      title: "Settings",
    },
    component: Layout,
    children: [
      {
        path: "/settings",
        name: "Settings",
        component: Settings,
      },
    ],
  },
];
