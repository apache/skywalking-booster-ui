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
import { createRouter, createWebHistory } from "vue-router";
import { routesDashboard } from "./dashboard";
import { routesMarketplace } from "./marketplace";
import { routesAlarm } from "./alarm";
import routesLayers from "./layer";
import { routesSettings } from "./settings";

const routes: Array<RouteRecordRaw> = [
  ...routesMarketplace,
  ...routesLayers,
  ...routesDashboard,
  ...routesAlarm,
  ...routesSettings,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

(window as any).axiosCancel = [];

const defaultPath = (routesLayers[0] && routesLayers[0].children[0].path) || "";

router.beforeEach((to, from, next) => {
  // const token = window.localStorage.getItem("skywalking-authority");
  if ((window as any).axiosCancel.length !== 0) {
    for (const func of (window as any).axiosCancel) {
      setTimeout(func(), 0);
    }
    (window as any).axiosCancel = [];
  }

  if (to.path === "/") {
    next({ path: defaultPath });
  } else {
    next();
  }
});

export default router;
