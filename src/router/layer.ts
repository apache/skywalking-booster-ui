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
import Layout from "@/layout/Index.vue";
import { useAppStoreWithOut } from "@/store/modules/app";
import type { MenuOptions } from "@/types/app";
import Layer from "@/views/Layer.vue";

function layerDashboards() {
  const appStore = useAppStoreWithOut();
  const routes = appStore.allMenus.map((item: MenuOptions) => {
    const route: any = {
      path: "",
      name: item.name,
      component: Layout,
      meta: {
        icon: item.icon || "cloud_queue",
        title: item.title,
        hasGroup: item.hasGroup,
        activate: item.activate,
        descKey: item.descKey,
        i18nKey: item.i18nKey,
      },
      children: item.subItems && item.subItems.length ? [] : undefined,
    };
    for (const child of item.subItems || []) {
      const d = {
        name: child.name,
        path: child.path,
        meta: {
          title: child.title,
          layer: child.layer,
          icon: child.icon || "cloud_queue",
          activate: child.activate,
          descKey: child.descKey,
          i18nKey: child.i18nKey,
        },
        component: Layer,
      };
      route.children.push(d);
      const tab = {
        name: `${child.name}ActiveTabIndex`,
        path: `/${child.path}/tab/:activeTabIndex`,
        component: Layer,
        meta: {
          notShow: true,
          layer: child.layer,
        },
      };
      route.children.push(tab);
    }
    if (!item.hasGroup) {
      route.children = [
        {
          name: item.name,
          path: item.path,
          meta: {
            title: item.title,
            layer: item.layer,
            icon: item.icon,
            activate: item.activate,
            descKey: item.descKey,
            i18nKey: item.i18nKey,
          },
          component: Layer,
        },
      ];
    }
    return route;
  });
  return routes;
}

export default layerDashboards();
