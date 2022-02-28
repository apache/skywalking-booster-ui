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
  ConfigData,
  ConfigData1,
  ConfigData2,
  ConfigData3,
  ConfigData4,
  ConfigData5,
  ConfigData6,
} from "../data";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import { NewControl } from "../data";
import { Duration } from "@/types/app";
import { AxiosResponse } from "axios";
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
}

export const dashboardStore = defineStore({
  id: "dashboard",
  state: (): DashboardState => ({
    layout: [ConfigData],
    showConfig: false,
    selectedGrid: null,
    entity: "",
    layerId: "",
    activedGridItem: "",
    durationTime: useAppStoreWithOut().durationTime,
    selectorStore: useSelectorStore(),
    showTopology: false,
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
        newItem.h = 24;
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
      if (type === "Trace" || type === "Profile") {
        newItem.h = 24;
      }
      this.layout = this.layout.map((d: LayoutConfig) => {
        d.y = d.y + newItem.h;
        return d;
      });
      this.layout.push(newItem);
      this.activedGridItem = newItem.i;
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
      const activedGridItem = this.activedGridItem.split("-")[0];
      const idx = this.layout.findIndex(
        (d: LayoutConfig) => d.i === activedGridItem
      );
      if (idx < 0) {
        return;
      }
      const { children } = this.layout[idx].children[tabIndex];
      const newWidget = {
        x: 0,
        y: 0,
        w: 24,
        h: 12,
        i: String(children.length),
        type: "Widget",
        widget: {
          title: "Title",
        },
        graph: {},
        standard: {},
      };
      if (this.layout[idx].children) {
        const items = children.map((d: LayoutConfig) => {
          d.y = d.y + newWidget.h;
          return d;
        });
        items.push(newWidget);
        this.layout[idx].children[tabIndex].children = items;
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
    selectWidget(item: Nullable<LayoutConfig>) {
      this.selectedGrid = item;
    },
    setLayer(id: string) {
      this.layerId = id;
    },
    setEntity(type: string) {
      this.entity = type;
      // todo
      if (type === "ServiceInstance") {
        this.layout = [ConfigData1];
      }
      if (type === "Endpoint") {
        this.layout = [ConfigData2];
      }
      if (type == "All") {
        this.layout = ConfigData3;
      }
      if (type == "Service") {
        this.layout = [ConfigData];
      }
      if (type == "ServiceRelation") {
        this.layout = [ConfigData4];
      }
      if (type == "ServiceInstanceRelation") {
        this.layout = [ConfigData6];
      }
      if (type == "EndpointRelation") {
        this.layout = [ConfigData5];
      }
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
        this.layout[index].children[actived[1]].children[actived[2]] = {
          ...this.layout[index],
          ...param,
        };
        this.selectedGrid = this.layout[index];
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
  },
});

export function useDashboardStore(): any {
  return dashboardStore(store);
}
