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
import type { AppRouteRecordRaw } from "@/types/router";
import { ROUTE_NAMES, ROUTE_PATHS, META_KEYS } from "./constants";
import Layout from "@/layout/Index.vue";
import Trace from "@/views/dashboard/Trace.vue";

export const routesTrace: AppRouteRecordRaw[] = [
  {
    path: "",
    name: ROUTE_NAMES.TRACE,
    meta: {
      [META_KEYS.NOT_SHOW]: false,
    },
    component: Layout,
    children: [
      {
        path: ROUTE_PATHS.TRACE,
        name: "ViewTrace",
        component: Trace,
        meta: {
          [META_KEYS.NOT_SHOW]: false,
        },
      },
    ],
  },
];
