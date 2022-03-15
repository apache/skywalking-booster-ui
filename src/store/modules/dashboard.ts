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
import graphql from "@/graphql";
import query from "@/graphql/fetch";
import {
  ServiceLayout,
  AllLayout,
  EndpointLayout,
  InstanceLayout,
  ServiceRelationLayout,
  InstanceRelationLayout,
  EndpointRelationLayout,
} from "@/constants/templates";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import { NewControl } from "../data";
import { Duration } from "@/types/app";
import { AxiosResponse } from "axios";
import { ElMessage } from "element-plus";
interface DashboardState {
  showConfig: boolean;
  layout: LayoutConfig[];
  selectedGrid: Nullable<LayoutConfig>; // edit widgets
  entity: string;
  layerId: string;
  activedGridItem: string;
  durationTime: Duration;
  selectorStore: any;
  showTopology: boolean;
  currentTabItems: LayoutConfig[];
  dashboards: { name: string; layer: string; entity: string }[];
}

export const dashboardStore = defineStore({
  id: "dashboard",
  state: (): DashboardState => ({
    layout: ServiceLayout.configuration.children,
    showConfig: false,
    selectedGrid: null,
    entity: "",
    layerId: "",
    activedGridItem: "",
    durationTime: useAppStoreWithOut().durationTime,
    selectorStore: useSelectorStore(),
    showTopology: false,
    currentTabItems: [],
    dashboards: [],
  }),
  actions: {
    setLayout(data: LayoutConfig[]) {
      this.layout = data;
    },
    addControl(type: string) {
      const newItem: LayoutConfig = {
        ...NewControl,
        i: String(this.layout.length),
        type,
        metricTypes: [""],
        metrics: [""],
      };
      if (type === "Tab") {
        newItem.h = 36;
        newItem.activedTabIndex = 0;
        newItem.children = [
          {
            name: "Tab1",
            children: [],
          },
          {
            name: "Tab2",
            children: [],
          },
        ];
      }
      if (type === "Topology") {
        newItem.w = 4;
        newItem.h = 6;
        newItem.graph = {
          fontColor: "white",
          backgroundColor: "green",
          iconTheme: true,
          content: "Topology",
          fontSize: 18,
          showDepth: true,
        };
      }
      if (type === "Trace" || type === "Profile" || type === "Log") {
        newItem.h = 36;
      }
      this.activedGridItem = newItem.i;
      this.selectedGrid = newItem;
      this.layout = this.layout.map((d: LayoutConfig) => {
        d.y = d.y + newItem.h;
        return d;
      });
      this.layout.push(newItem);
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
    addTabControls(type: string) {
      const activedGridItem = this.activedGridItem.split("-")[0];
      const idx = this.layout.findIndex(
        (d: LayoutConfig) => d.i === activedGridItem
      );
      if (idx < 0) {
        return;
      }
      const tabIndex = this.layout[idx].activedTabIndex || 0;
      const { children } = this.layout[idx].children[tabIndex];
      const newItem: LayoutConfig = {
        ...NewControl,
        i: String(children.length),
        type,
        metricTypes: [""],
        metrics: [""],
      };
      if (type === "Topology") {
        newItem.w = 4;
        newItem.h = 6;
        newItem.graph = {
          fontColor: "white",
          backgroundColor: "green",
          iconTheme: true,
          content: "Topology",
          fontSize: 18,
          showDepth: true,
        };
      }
      if (type === "Trace" || type === "Profile" || type === "Log") {
        newItem.h = 24;
      }
      if (this.layout[idx].children) {
        const items = children.map((d: LayoutConfig) => {
          d.y = d.y + newItem.h;
          return d;
        });
        items.push(newItem);
        this.layout[idx].children[tabIndex].children = items;
        this.currentTabItems = items;
      }
    },
    activeGridItem(index: string) {
      this.activedGridItem = index;
    },
    setActiveTabIndex(index: number) {
      const idx = this.layout.findIndex(
        (d: LayoutConfig) => d.i === this.activedGridItem
      );
      if (idx < 0) {
        return;
      }
      this.layout[idx].activedTabIndex = index;
    },
    setCurrentTabItems(items: LayoutConfig[]) {
      this.currentTabItems = items;
    },
    removeTab(item: LayoutConfig) {
      if (this.selectedGrid && this.selectedGrid.i === item.i) {
        this.selectedGrid = null;
      }
      this.layout = this.layout.filter((d: LayoutConfig) => d.i !== item.i);
    },
    removeControls(item: LayoutConfig) {
      const actived = this.activedGridItem.split("-");
      const index = this.layout.findIndex(
        (d: LayoutConfig) => actived[0] === d.i
      );

      if (this.selectedGrid && this.selectedGrid.i === item.i) {
        this.selectedGrid = null;
      }
      if (actived.length === 3) {
        const tabIndex = Number(actived[1]);
        const itemIndex = this.layout[index].children[
          tabIndex
        ].children.findIndex((d: LayoutConfig) => actived[2] === d.i);

        this.layout[index].children[tabIndex].children.splice(itemIndex, 1);
        this.setCurrentTabItems(this.layout[index].children[tabIndex].children);
        return;
      }
      this.layout = this.layout.filter((d: LayoutConfig) => d.i !== item.i);
    },
    removeTabItem(item: LayoutConfig, index: number) {
      const idx = this.layout.findIndex((d: LayoutConfig) => d.i === item.i);
      if (this.selectedGrid) {
        for (const item of this.layout[idx].children[index].children) {
          if (this.selectedGrid.i === item.i) {
            this.selectedGrid = null;
          }
        }
      }
      if (this.layout[idx].children) {
        this.layout[idx].children?.splice(index, 1);
      }
    },
    setConfigPanel(show: boolean) {
      this.showConfig = show;
    },
    selectWidget(item: Nullable<LayoutConfig>) {
      this.selectedGrid = item;
    },
    setLayer(id: string) {
      this.layerId = id;
    },
    setEntity(type: string) {
      this.entity = type;
    },
    setTopology(show: boolean) {
      this.showTopology = show;
    },
    setConfigs(param: { [key: string]: unknown }) {
      const actived = this.activedGridItem.split("-");
      const index = this.layout.findIndex(
        (d: LayoutConfig) => actived[0] === d.i
      );

      if (actived.length === 3) {
        const tabIndex = Number(actived[1]);
        const itemIndex = this.layout[index].children[
          tabIndex
        ].children.findIndex((d: LayoutConfig) => actived[2] === d.i);

        this.layout[index].children[tabIndex].children[itemIndex] = {
          ...this.layout[index].children[tabIndex].children[itemIndex],
          ...param,
        };
        this.selectedGrid =
          this.layout[index].children[tabIndex].children[itemIndex];
        this.setCurrentTabItems(this.layout[index].children[tabIndex].children);
        return;
      }
      this.layout[index] = {
        ...this.layout[index],
        ...param,
      };
      this.selectedGrid = this.layout[index];
    },
    async fetchMetricType(item: string) {
      const res: AxiosResponse = await graphql
        .query("queryTypeOfMetrics")
        .params({ name: item });

      return res.data;
    },
    async fetchMetricList(regex: string) {
      const res: AxiosResponse = await graphql
        .query("queryMetrics")
        .params({ regex });

      return res.data;
    },
    async fetchMetricValue(param: {
      queryStr: string;
      conditions: { [key: string]: unknown };
    }) {
      const res: AxiosResponse = await query(param);
      return res.data;
    },
    async fetchTemplates() {
      const res: AxiosResponse = await graphql.query("getTemplates").params({});

      if (res.data.errors) {
        return res.data;
      }
      const data = [
        ServiceLayout,
        AllLayout,
        EndpointLayout,
        InstanceLayout,
        ServiceRelationLayout,
        InstanceRelationLayout,
        EndpointRelationLayout,
      ].map((t: any) => {
        t.configuration = JSON.stringify(t.configuration);
        return t;
      });
      const list = [];
      for (const t of data) {
        const c = JSON.parse(t.configuration);
        const key = [c.layer, c.entity, c.name.split(" ").join("-")].join("_");

        list.push({
          id: t.id,
          layer: c.layer,
          entity: c.entity,
          name: c.name,
          isRoot: c.isRoot,
        });
        sessionStorage.setItem(key, JSON.stringify(t));
      }
      sessionStorage.setItem("dashboards", JSON.stringify(list));
      return res.data;
    },
    async setDashboards() {
      if (!sessionStorage.getItem("dashboards")) {
        const res = await this.fetchTemplates();
        if (res.errors) {
          this.dashboards = [];
          ElMessage.error(res.errors);
          return;
        }
      }
      this.dashboards = JSON.parse(
        sessionStorage.getItem("dashboards") || "[]"
      );
    },
  },
});

export function useDashboardStore(): any {
  return dashboardStore(store);
}
