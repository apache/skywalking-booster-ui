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
import Marketplace from "@/views/Marketplace.vue";

export const routesMarketplace: AppRouteRecordRaw[] = [
  {
    path: "",
    name: ROUTE_NAMES.MARKETPLACE,
    meta: {
      [META_KEYS.I18N_KEY]: "marketplace",
      [META_KEYS.ICON]: "marketplace",
      [META_KEYS.HAS_GROUP]: false,
      [META_KEYS.ACTIVATE]: true,
      [META_KEYS.TITLE]: "Marketplace",
      [META_KEYS.BREADCRUMB]: true,
    },
    component: Layout,
    children: [
      {
        path: ROUTE_PATHS.MARKETPLACE,
        name: "MenusManagement",
        component: Marketplace,
        meta: {
          [META_KEYS.TITLE]: "Marketplace",
          [META_KEYS.BREADCRUMB]: true,
        },
      },
    ],
  },
];
