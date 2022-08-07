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
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { routesGen } from "./general";
import { routesMesh } from "./serviceMesh";
import { routesDatabase } from "./database";
import { routesInfra } from "./infrastructure";
import { routesDashboard } from "./dashboard";
import { routesSetting } from "./setting";
import { routesAlarm } from "./alarm";
import { routesSelf } from "./selfObservability";
import { routesFunctions } from "./functions";
import { routesBrowser } from "./browser";
import { routesK8s } from "./k8s";

const routes: Array<RouteRecordRaw> = [
  ...routesGen,
  ...routesMesh,
  ...routesFunctions,
  ...routesK8s,
  ...routesInfra,
  ...routesBrowser,
  ...routesDatabase,
  ...routesSelf,
  ...routesDashboard,
  ...routesAlarm,
  ...routesSetting,
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

(window as any).axiosCancel = [];

router.beforeEach((to, from, next) => {
  // const token = window.localStorage.getItem("skywalking-authority");
  if ((window as any).axiosCancel.length !== 0) {
    for (const func of (window as any).axiosCancel) {
      setTimeout(func(), 0);
    }
    (window as any).axiosCancel = [];
  }
  if (to.path === "/") {
    next({ path: "/general" });
  } else {
    next();
  }
});

export default router;
