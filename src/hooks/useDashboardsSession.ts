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
import { ElMessage } from "element-plus";
import { useDashboardStore } from "@/store/modules/dashboard";
import type { LayoutConfig } from "@/types/dashboard";
import { ConfigFieldTypes } from "@/views/dashboard/data";

export default function getDashboard(param?: { name?: string; layer: string; entity: string }, t?: string) {
  const type = t || ConfigFieldTypes.NAME; // "NAME" or "ISDEFAULT"
  const dashboardStore = useDashboardStore();
  const opt = param || dashboardStore.currentDashboard;
  const list = JSON.parse(sessionStorage.getItem("dashboards") || "[]");
  let dashboard: Recordable;
  if (type === ConfigFieldTypes.NAME) {
    dashboard = list.find(
      (d: { name: string; layer: string; entity: string }) =>
        d.name === opt.name && d.entity === opt.entity && d.layer === opt.layer,
    );
  } else {
    dashboard = list.find(
      (d: { name: string; layer: string; entity: string; isDefault: boolean }) =>
        d.isDefault && d.entity === opt.entity && d.layer === opt.layer,
    );
  }
  const all = dashboardStore.layout;
  const widgets: LayoutConfig[] = [];
  for (const item of all) {
    if (item.type === "Tab") {
      widgets.push(item);
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
    const widget = widgets.find((d: { type: string }) => d.type === type);
    if (!widget) {
      return ElMessage.info(`There has no a ${type} widget in the dashboard`);
    }
    const item = {
      ...widget,
      filters,
    };
    dashboardStore.setWidget(item);
    if (widget.id === sourceId) {
      return;
    }
    const targetTabIndex = (widget.id || "").split("-");
    const sourceTabindex = (sourceId || "").split("-") || [];
    let container: Nullable<Element>;

    if (targetTabIndex[1] === undefined) {
      container = document.querySelector(".ds-main");
    } else {
      const w = widgets.find((d: Indexable) => d.id === targetTabIndex[0]);
      container = document.querySelector(".tab-layout");
      const layout: Nullable<Element> = document.querySelector(".ds-main");
      if (w && layout) {
        layout.scrollTop = w.y * 10 + w.h * 5;
      }
    }
    if (targetTabIndex[1] && targetTabIndex[1] !== sourceTabindex[1]) {
      dashboardStore.setActiveTabIndex(Number(targetTabIndex[1]));
    }
    if (container && widget) {
      container.scrollTop = widget.y * 10 + widget.h * 5;
    }
  }
  return { dashboard, widgets, associationWidget };
}
