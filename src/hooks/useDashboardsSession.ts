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
import { useDashboardStore } from "@/store/modules/dashboard";
import { LayoutConfig } from "@/types/dashboard";

export default function getDashboard(param: {
  name: string;
  layer: string;
  entity: string;
}) {
  const dashboardStore = useDashboardStore();
  const list = JSON.parse(sessionStorage.getItem("dashboards") || "[]");
  const dashboard = list.find(
    (d: { name: string; layer: string; entity: string }) =>
      d.name === param.name &&
      d.entity === param.entity &&
      d.layer === param.layer
  );
  const all = dashboardStore.layout;
  const widgets: LayoutConfig[] = [];
  for (const item of all) {
    if (item.type === "Tab") {
      if (item.children && item.children.length) {
        for (const child of item.children) {
          if (child.children && child.children.length) {
            widgets.push(...child.children);
          }
        }
      }
    } else {
      widgets.push(item);
    }
  }
  function associationWidget(sourceId: string, filters: unknown, type: string) {
    const widget = widgets.filter((d: { type: string }) => d.type === type)[0];
    if (!widget) {
      return;
    }
    const item = {
      ...widget,
      filters,
    };
    dashboardStore.setWidget(item);
    const targetTabIndex = (widget.id || "").split("-");
    const sourceTabindex = (sourceId || "").split("-") || [];
    let container: Nullable<Element>;

    if (targetTabIndex[1] === undefined) {
      container = document.querySelector(".ds-main");
    } else {
      container = document.querySelector(".tab-layout");
    }
    if (targetTabIndex[1] && targetTabIndex[1] !== sourceTabindex[1]) {
      dashboardStore.setActiveTabIndex(Number(targetTabIndex[1]));
    }
    if (container && widget) {
      container.scrollTop = widget.y * 10;
    }
  }
  return { dashboard, widgets, associationWidget };
}
