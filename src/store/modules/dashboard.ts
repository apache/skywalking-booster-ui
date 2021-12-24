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
import { defineStore } from "pinia";
import { store } from "@/store";
import { LayoutConfig } from "@/types/dashboard";

interface DashboardState {
  showConfig: boolean;
  layout: LayoutConfig[];
}

export const dashboardStore = defineStore({
  id: "dashboard",
  state: (): DashboardState => ({
    layout: [],
    showConfig: false,
  }),
  actions: {
    setLayout(data: LayoutConfig[]) {
      this.layout = data;
    },
    addWidget() {
      const newWidget: LayoutConfig = {
        x: 0,
        y: 0,
        w: 24,
        h: 12,
        i: String(this.layout.length),
      };
      this.layout = this.layout.map((d: LayoutConfig) => {
        d.y = d.y + newWidget.h;
        return d;
      });
      this.layout.push(newWidget);
    },
    removeWidget(item: LayoutConfig) {
      this.layout = this.layout.filter((d: LayoutConfig) => d.i !== item.i);
    },
    setConfigPanel(show: boolean) {
      this.showConfig = show;
    },
  },
});

export function useDashboardStore(): any {
  return dashboardStore(store);
}
