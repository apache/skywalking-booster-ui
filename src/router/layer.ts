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
import type { AppRouteRecordRaw } from "./types";
import { META_KEYS } from "./constants";
import Layout from "@/layout/Index.vue";
import { useAppStoreWithOut } from "@/store/modules/app";
import type { MenuOptions } from "@/types/app";
import Layer from "@/views/Layer.vue";

/**
 * Generate layer dashboard routes from app store menu configuration
 */
function generateLayerDashboards(): AppRouteRecordRaw[] {
  const appStore = useAppStoreWithOut();

  return appStore.allMenus.map((item: MenuOptions): AppRouteRecordRaw => {
    const route: AppRouteRecordRaw = {
      path: "",
      name: item.name,
      component: Layout,
      meta: {
        [META_KEYS.ICON]: item.icon || "cloud_queue",
        [META_KEYS.TITLE]: item.title,
        [META_KEYS.HAS_GROUP]: item.hasGroup,
        [META_KEYS.ACTIVATE]: item.activate,
        [META_KEYS.DESC_KEY]: item.descKey,
        [META_KEYS.I18N_KEY]: item.i18nKey,
        [META_KEYS.BREADCRUMB]: true,
      },
      children: item.subItems && item.subItems.length ? [] : undefined,
    };

    // Handle grouped items
    if (item.subItems && item.subItems.length) {
      for (const child of item.subItems) {
        const childRoute: AppRouteRecordRaw = {
          name: child.name,
          path: child.path || "",
          meta: {
            [META_KEYS.TITLE]: child.title,
            [META_KEYS.LAYER]: child.layer,
            [META_KEYS.ICON]: child.icon || "cloud_queue",
            [META_KEYS.ACTIVATE]: child.activate,
            [META_KEYS.DESC_KEY]: child.descKey,
            [META_KEYS.I18N_KEY]: child.i18nKey,
            [META_KEYS.BREADCRUMB]: true,
          },
          component: Layer,
        };

        route.children!.push(childRoute);

        // Add tab route for active tab index
        const tabRoute: AppRouteRecordRaw = {
          name: `${child.name}ActiveTabIndex`,
          path: `/${child.path}/tab/:activeTabIndex`,
          component: Layer,
          meta: {
            [META_KEYS.NOT_SHOW]: true,
            [META_KEYS.LAYER]: child.layer,
            [META_KEYS.TITLE]: child.title,
            [META_KEYS.BREADCRUMB]: false,
          },
        };

        route.children!.push(tabRoute);
      }
    } else {
      // Handle non-grouped items
      route.children = [
        {
          name: item.name,
          path: item.path || "",
          meta: {
            [META_KEYS.TITLE]: item.title,
            [META_KEYS.LAYER]: item.layer,
            [META_KEYS.ICON]: item.icon,
            [META_KEYS.ACTIVATE]: item.activate,
            [META_KEYS.DESC_KEY]: item.descKey,
            [META_KEYS.I18N_KEY]: item.i18nKey,
            [META_KEYS.BREADCRUMB]: true,
          },
          component: Layer,
        },
      ];
    }

    return route;
  });
}

export default generateLayerDashboards();
