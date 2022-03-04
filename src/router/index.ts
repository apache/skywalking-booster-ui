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
// import Layout from "@/layout/Index.vue";
import { routesGen } from "./generalService";
import { routesMesh } from "./serviceMesh";
import { routesDatabase } from "./database";
import { routesInfra } from "./infrastructure";
import { routesDashboard } from "./dashboard";
// import { routesLog } from "./log";
import { routesEvent } from "./event";
import { routesAlert } from "./alert";
import { routesSetting } from "./setting";
import { routesAlarm } from "./alarm";
import { useTimeoutFn } from "@/hooks/useTimeout";

const routes: Array<RouteRecordRaw> = [
  ...routesGen,
  ...routesMesh,
  ...routesDatabase,
  ...routesInfra,
  ...routesDashboard,
  ...routesEvent,
  ...routesAlert,
  ...routesSetting,
  ...routesAlarm,
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
      useTimeoutFn(func(), 0);
    }
    (window as any).axiosCancel = [];
  }
  if (to.path === "/") {
    next({ path: "/generalService" });
  } else {
    next();
  }
});
export default router;
