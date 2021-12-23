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
import { GridItemData } from "@/types/dashboard";

interface DashboardState {
  layouts: GridItemData[];
}

export const dashboardStore = defineStore({
  id: "dashboard",
  state: (): DashboardState => ({
    layouts: [],
  }),
  actions: {
    setLayouts(data: GridItemData[]) {
      this.layouts = data;
    },
    addWidget() {
      const newWidget: GridItemData = {
        x: 0,
        y: 0,
        w: 12,
        h: 3,
        i: String(this.layouts.length),
      };
      this.layouts = this.layouts.map((d: GridItemData) => {
        d.y = d.y + 3;
        return d;
      });
      this.layouts.push(newWidget);
    },
  },
});

export function useDashboardStore(): any {
  return dashboardStore(store);
}
