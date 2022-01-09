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
import graph from "@/graph";
import { AxiosResponse } from "axios";
import { ConfigData } from "./data";
import { useAppStoreWithOut } from "@/store/modules/app";
interface DashboardState {
  showConfig: boolean;
  layout: LayoutConfig[];
  selectedGrid: Nullable<LayoutConfig>; // edit widgets
  entity: string;
  layerId: string;
  activedGridItem: string;
}

export const dashboardStore = defineStore({
  id: "dashboard",
  state: (): DashboardState => ({
    layout: [ConfigData],
    showConfig: false,
    selectedGrid: ConfigData,
    entity: "",
    layerId: "",
    activedGridItem: "",
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
        type: "Widget",
        widget: {},
        graph: {},
        standard: {},
      };
      this.layout = this.layout.map((d: LayoutConfig) => {
        d.y = d.y + newWidget.h;
        return d;
      });
      this.layout.push(newWidget);
      this.activedGridItem = newWidget.i;
    },
    addTab() {
      const newWidget: LayoutConfig = {
        x: 0,
        y: 0,
        w: 24,
        h: 20,
        i: String(this.layout.length),
        type: "Tab",
        children: [
          {
            name: "Tab1",
            children: [],
          },
          {
            name: "Tab2",
            children: [],
          },
        ],
        widget: {},
        graph: {},
        standard: {},
      };
      this.layout = this.layout.map((d: LayoutConfig) => {
        d.y = d.y + newWidget.h;
        return d;
      });
      this.layout.push(newWidget);
      this.activedGridItem = newWidget.i;
    },
    addTabItem(item: LayoutConfig) {
      const idx = this.layout.findIndex((d: LayoutConfig) => d.i === item.i);
      if (!this.layout[idx].children) {
        return;
      }
      const len = this.layout[idx].children?.length || 0;
      const i = {
        name: "Tab" + (len + 1),
        children: [],
      };
      this.layout[idx].children?.push(i);
    },
    addTabWidget(tabIndex: number) {
      const idx = this.layout.findIndex(
        (d: LayoutConfig) => d.i === this.activedGridItem
      );
      const newWidget = {
        x: 0,
        y: 0,
        w: 24,
        h: 12,
        i: String(this.layout[idx].children[tabIndex].children.length),
        type: "Widget",
        widget: {},
        graph: {},
        standard: {},
      };
      if (this.layout[idx].children) {
        this.layout[idx].children[tabIndex].children.push(newWidget);
      }
    },
    activeGridItem(index: string) {
      this.activedGridItem = index;
    },
    removeControls(item: LayoutConfig) {
      this.layout = this.layout.filter((d: LayoutConfig) => d.i !== item.i);
    },
    removeTabItem(item: LayoutConfig, index: number) {
      const idx = this.layout.findIndex((d: LayoutConfig) => d.i === item.i);
      if (this.layout[idx].children) {
        this.layout[idx].children?.splice(index, 1);
      }
    },
    setConfigPanel(show: boolean) {
      this.showConfig = show;
    },
    selectWidget(widget: Nullable<LayoutConfig>) {
      this.selectedGrid = ConfigData || widget; //todo
    },
    setLayer(id: string) {
      this.layerId = id;
    },
    setEntity(type: string) {
      this.entity = type;
    },
    setConfigs(param: { [key: string]: unknown }) {
      const index = this.layout.findIndex((d: LayoutConfig) => d.i === param.i);
      this.layout[index] = {
        ...this.layout[index],
        ...param,
      };
    },
    async fetchMetricType(item: string) {
      const res: AxiosResponse = await graph
        .query("queryTypeOfMetrics")
        .params({ name: item });

      return res.data;
    },
    async fetchMetricValue(config: LayoutConfig) {
      if (!config.queryMetricType) {
        return;
      }
      const appStoreWithOut = useAppStoreWithOut();
      const variable = {
        condition: {
          name: "service_resp_time",
          entity: {
            normal: true,
            scope: "Service",
            serviceName: "agentless::app",
          },
        },
        duration: appStoreWithOut.durationTime,
      };
      const res: AxiosResponse = await graph
        .query(config.queryMetricType)
        .params(variable);

      return res.data;
    },
  },
});

export function useDashboardStore(): any {
  return dashboardStore(store);
}
