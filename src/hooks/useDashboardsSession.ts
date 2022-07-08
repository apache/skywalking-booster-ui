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
  const widgets = [];
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
  return { dashboard, widgets };
}
