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
import type { LayoutConfig } from "@/types/dashboard";
import graphql from "@/graphql";
import query from "@/graphql/fetch";
import type { DashboardItem } from "@/types/dashboard";
import { useSelectorStore } from "@/store/modules/selectors";
import { NewControl, TextConfig, TimeRangeConfig, ControlsTypes } from "../data";
import type { AxiosResponse } from "axios";
import { ElMessage } from "element-plus";
import { EntityType, MetricModes, WidgetType } from "@/views/dashboard/data";
interface DashboardState {
  showConfig: boolean;
  layout: LayoutConfig[];
  selectedGrid: Nullable<LayoutConfig>; // edit widgets
  entity: string;
  layerId: string;
  activedGridItem: string;
  selectorStore: Recordable;
  showTopology: boolean;
  currentTabItems: LayoutConfig[];
  dashboards: DashboardItem[];
  currentDashboard: Nullable<DashboardItem>;
  editMode: boolean;
  currentTabIndex: number;
  showLinkConfig: boolean;
}

export const dashboardStore = defineStore({
  id: "dashboard",
  state: (): DashboardState => ({
    layout: [],
    showConfig: false,
    selectedGrid: null,
    entity: "",
    layerId: "",
    activedGridItem: "",
    selectorStore: useSelectorStore(),
    showTopology: false,
    currentTabItems: [],
    dashboards: [],
    currentDashboard: null,
    editMode: false,
    currentTabIndex: 0,
    showLinkConfig: false,
  }),
  actions: {
    setLayout(data: LayoutConfig[]) {
      this.layout = data;
    },
    setMode(mode: boolean) {
      this.editMode = mode;
    },
    setWidgetLink(show: boolean) {
      this.showLinkConfig = show;
    },
    resetDashboards(list: DashboardItem[]) {
      this.dashboards = list;
      sessionStorage.setItem("dashboards", JSON.stringify(list));
    },
    setCurrentDashboard(item: DashboardItem) {
      this.currentDashboard = item;
    },
    addControl(type: WidgetType) {
      const arr = this.layout.map((d: Recordable) => Number(d.i));
      let index = String(Math.max(...arr) + 1);
      if (!this.layout.length) {
        index = "0";
      }
      const newItem: LayoutConfig = {
        ...NewControl,
        i: index,
        id: index,
        type,
        metricTypes: [""],
        metrics: [""],
      };

      if (type === WidgetType.Widget) {
        newItem.metricMode = MetricModes.Expression;
      }
      if (type === WidgetType.Tab) {
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
      if (type === WidgetType.Topology) {
        newItem.h = 36;
        newItem.graph = {
          showDepth: true,
          depth: this.entity === EntityType[1].value ? 1 : this.entity === EntityType[0].value ? 2 : 3,
        };
      }
      if (ControlsTypes.includes(type)) {
        newItem.h = 36;
      }
      if (type === WidgetType.Text) {
        newItem.h = 6;
        newItem.graph = TextConfig;
      }
      if (type === WidgetType.TimeRange) {
        newItem.w = 8;
        newItem.h = 6;
        newItem.graph = TimeRangeConfig;
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
    addTabControls(type: WidgetType) {
      const activedGridItem = this.activedGridItem.split("-")[0];
      const idx = this.layout.findIndex((d: LayoutConfig) => d.i === activedGridItem);
      if (idx < 0) {
        return;
      }
      const tabIndex = this.layout[idx].activedTabIndex || 0;
      const { children } = (this.layout[idx].children || [])[tabIndex];
      const arr = children.map((d: Recordable) => Number(d.i));
      let index = String(Math.max(...arr) + 1);
      if (!children.length) {
        index = "0";
      }
      const id = `${activedGridItem}-${tabIndex}-${index}`;
      const newItem: LayoutConfig = {
        ...NewControl,
        i: index,
        id,
        type,
        metricTypes: [""],
        metrics: [""],
      };
      if (type === WidgetType.Widget) {
        newItem.metricMode = MetricModes.Expression;
      }
      if (type === WidgetType.Topology) {
        newItem.h = 32;
        newItem.graph = {
          showDepth: true,
        };
        newItem.metricMode = MetricModes.Expression;
      }
      if (ControlsTypes.includes(type)) {
        newItem.h = 32;
      }
      if (type === WidgetType.Text) {
        newItem.h = 6;
        newItem.graph = TextConfig;
      }
      if (type === WidgetType.TimeRange) {
        newItem.w = 8;
        newItem.h = 6;
        newItem.graph = TextConfig;
      }
      if (this.layout[idx].children) {
        const items = children.map((d: LayoutConfig) => {
          d.y = d.y + newItem.h;
          return d;
        });
        items.push(newItem);
        (this.layout[idx].children || [])[tabIndex].children = items;
        this.currentTabItems = items;
      }
    },
    activeGridItem(index: string) {
      this.activedGridItem = index;
    },
    setActiveTabIndex(index: number, target?: number) {
      this.currentTabIndex = index;
      const m = target || this.activedGridItem;
      const idx = this.layout.findIndex((d: LayoutConfig) => d.i === m);
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
      const index = this.layout.findIndex((d: LayoutConfig) => actived[0] === d.i);

      if (this.selectedGrid && this.selectedGrid.i === item.i) {
        this.selectedGrid = null;
      }
      if (actived.length === 3) {
        const tabIndex = Number(actived[1]);
        this.currentTabItems = this.currentTabItems.filter((d: LayoutConfig) => actived[2] !== d.i);
        (this.layout[index].children || [])[tabIndex].children = this.currentTabItems;
        return;
      }
      this.layout = this.layout.filter((d: LayoutConfig) => d.i !== item.i);
    },
    removeTabItem(item: LayoutConfig, index: number) {
      const idx = this.layout.findIndex((d: LayoutConfig) => d.i === item.i);
      if (this.selectedGrid) {
        for (const item of (this.layout[idx].children || [])[index].children) {
          if (this.selectedGrid?.i === item.i) {
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
      const index = this.layout.findIndex((d: LayoutConfig) => actived[0] === d.i);
      if (actived.length === 3) {
        const tabIndex = Number(actived[1]);
        const itemIndex = (this.layout[index].children || [])[tabIndex].children.findIndex(
          (d: LayoutConfig) => actived[2] === d.i,
        );

        (this.layout[index].children || [])[tabIndex].children[itemIndex] = {
          ...(this.layout[index].children || [])[tabIndex].children[itemIndex],
          ...param,
        };
        this.selectedGrid = (this.layout[index].children || [])[tabIndex].children[itemIndex];
        this.setCurrentTabItems((this.layout[index].children || [])[tabIndex].children);
        return;
      }
      this.layout[index] = {
        ...this.layout[index],
        ...param,
      };
      this.selectedGrid = this.layout[index];
    },
    setWidget(param: LayoutConfig) {
      for (let i = 0; i < this.layout.length; i++) {
        if (this.layout[i].type === WidgetType.Tab) {
          if ((this.layout[i].children || []).length) {
            for (const child of this.layout[i].children || []) {
              if (child.children && child.children.length) {
                for (let c = 0; c < child.children.length; c++) {
                  if (child.children[c].id === param.id) {
                    child.children.splice(c, 1, param);
                    return;
                  }
                }
              }
            }
          }
        } else {
          if (this.layout[i].id === param.id) {
            this.layout.splice(i, 1, param);
          }
        }
      }
    },
    async fetchMetricType(item: string) {
      const res: AxiosResponse = await graphql.query("queryTypeOfMetrics").params({ name: item });

      return res.data;
    },
    async getTypeOfMQE(expression: string) {
      const res: AxiosResponse = await graphql.query("getTypeOfMQE").params({ expression });

      return res.data;
    },
    async fetchMetricList(regex: string) {
      const res: AxiosResponse = await graphql.query("queryMetrics").params({ regex });

      return res.data;
    },
    async fetchMetricValue(param: { queryStr: string; conditions: { [key: string]: unknown } }) {
      const res: AxiosResponse = await query(param);
      return res.data;
    },
    async fetchTemplates() {
      const res: AxiosResponse = await graphql.query("getTemplates").params({});

      if (res.data.errors) {
        return res.data;
      }
      const data = res.data.data.getAllTemplates;
      let list = [];
      for (const t of data) {
        const c = JSON.parse(t.configuration);
        const key = [c.layer, c.entity, c.name].join("_");

        list.push({
          ...c,
          id: t.id,
          children: undefined,
        });
        sessionStorage.setItem(key, JSON.stringify({ id: t.id, configuration: c }));
      }
      list = list.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
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
      this.dashboards = JSON.parse(sessionStorage.getItem("dashboards") || "[]");
    },
    async resetTemplates() {
      const res = await this.fetchTemplates();
      if (res.errors) {
        this.dashboards = [];
        ElMessage.error(res.errors);
        return;
      }
      this.dashboards = JSON.parse(sessionStorage.getItem("dashboards") || "[]");
    },
    async updateDashboard(setting: { id: string; configuration: string }) {
      const res: AxiosResponse = await graphql.query("updateTemplate").params({
        setting,
      });
      if (res.data.errors) {
        ElMessage.error(res.data.errors);
        return res.data;
      }
      const json = res.data.data.changeTemplate;
      if (!json.status) {
        ElMessage.error(json.message);
        return res.data;
      }
      ElMessage.success("Saved successfully");
      return res.data;
    },
    async saveDashboard() {
      if (!this.currentDashboard?.name) {
        ElMessage.error("The dashboard name is needed.");
        return;
      }
      const c = {
        children: this.layout,
        ...this.currentDashboard,
      };
      let res: Recordable;
      let json;

      if (this.currentDashboard.id) {
        res = await this.updateDashboard({
          id: this.currentDashboard.id,
          configuration: JSON.stringify(c),
        });
        json = res.data.changeTemplate;
      } else {
        c.isRoot = false;
        const index = this.dashboards.findIndex(
          (d: DashboardItem) =>
            d.name === this.currentDashboard?.name &&
            d.entity === this.currentDashboard.entity &&
            d.layer === this.currentDashboard?.layer,
        );
        if (index > -1) {
          ElMessage.error("The dashboard name cannot be duplicate");
          return;
        }
        res = await graphql.query("addNewTemplate").params({ setting: { configuration: JSON.stringify(c) } });

        json = res.data.data.addTemplate;
        if (!json.status) {
          ElMessage.error(json.message);
        }
      }
      if (res.data.errors || res.errors) {
        ElMessage.error(res.data.errors);
        return res.data;
      }
      if (!json.status) {
        return json;
      }
      if (!this.currentDashboard.id) {
        ElMessage.success("Saved successfully");
      }
      const key = [this.currentDashboard.layer, this.currentDashboard.entity, this.currentDashboard.name].join("_");
      this.currentDashboard.id = json.id;
      if (this.currentDashboard.id) {
        sessionStorage.removeItem(key);
        this.dashboards = this.dashboards.filter((d: DashboardItem) => d.id !== this.currentDashboard?.id);
      }
      this.dashboards.push(this.currentDashboard);
      const l = { id: json.id, configuration: c };

      sessionStorage.setItem(key, JSON.stringify(l));
      sessionStorage.setItem("dashboards", JSON.stringify(this.dashboards));
      return json;
    },
    async deleteDashboard() {
      const res: AxiosResponse = await graphql.query("removeTemplate").params({ id: this.currentDashboard?.id });

      if (res.data.errors) {
        ElMessage.error(res.data.errors);
        return res.data;
      }
      const json = res.data.data.disableTemplate;
      if (!json.status) {
        ElMessage.error(json.message);
        return res.data;
      }
      this.dashboards = this.dashboards.filter((d: Recordable) => d.id !== this.currentDashboard?.id);
      const key = [this.currentDashboard?.layer, this.currentDashboard?.entity, this.currentDashboard?.name].join("_");
      sessionStorage.removeItem(key);
    },
  },
});

export function useDashboardStore(): Recordable {
  return dashboardStore(store);
}
