<!-- Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. -->
<template>
  <div class="dashboard-list">
    <div class="flex-h header" style="margin: 10px 0">
      <el-input
        v-model="searchText"
        placeholder="Please input name"
        class="input-with-search ml-10"
        size="small"
        @change="searchDashboards(1)"
      >
        <template #append>
          <el-button size="small">
            <Icon size="sm" iconName="search" />
          </el-button>
        </template>
      </el-input>
      <el-button class="ml-10 reload-btn" size="small" @click="reloadTemplates">
        <Icon size="sm" iconName="retry" class="reload" />
        {{ t("reloadDashboards") }}
      </el-button>
      <router-link to="/dashboard/new">
        <el-button size="small" type="primary"> + {{ t("newDashboard") }} </el-button>
      </router-link>
    </div>
    <div class="table">
      <el-table
        :data="dashboards"
        :style="{ fontSize: '13px', width: '100%' }"
        v-loading="loading"
        ref="multipleTableRef"
        :default-sort="{ prop: 'name', order: 'ascending' }"
        @selection-change="handleSelectionChange"
        height="calc(100% - 60px)"
        size="small"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="Name">
          <template #default="scope">
            <span class="cp name" @click="handleView(scope.row)">
              {{ scope.row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="layer" label="Layer" width="160" />
        <el-table-column prop="entity" label="Entity" width="200" />
        <el-table-column prop="isRoot" label="Root" width="150">
          <template #default="scope">
            <el-popconfirm
              :title="t('rootTitle')"
              @confirm="setRoot(scope.row)"
              v-if="[EntityType[0].value, EntityType[1].value].includes(scope.row.entity)"
            >
              <template #reference>
                <el-button size="small" style="width: 110px">
                  {{ scope.row.isRoot ? t("setNormal") : t("setRoot") }}
                </el-button>
              </template>
            </el-popconfirm>
            <span v-else> -- </span>
          </template>
        </el-table-column>
        <el-table-column label="Operations" width="400">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">
              {{ t("edit") }}
            </el-button>
            <el-button size="small" @click="handleRename(scope.row)">
              {{ t("rename") }}
            </el-button>
            <el-button
              v-if="[EntityType[0].value, EntityType[3].value].includes(scope.row.entity)"
              size="small"
              @click="handleEditMQE(scope.row)"
            >
              Hierarchy Graph
            </el-button>
            <span v-else class="placeholder"></span>
            <el-popconfirm :title="t('deleteTitle')" @confirm="handleDelete(scope.row)">
              <template #reference>
                <el-button size="small" type="danger">
                  {{ t("delete") }}
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="toggle-selection">
        <el-button size="default" class="btn" @click="exportTemplates">
          <Icon class="mr-5" iconName="save_alt" />
          {{ t("export") }}
        </el-button>
        <el-button class="ml-10 btn" size="default">
          <input
            ref="dashboardFile"
            id="dashboard-file"
            class="import-template"
            type="file"
            name="file"
            title=""
            accept=".json"
            @change="importTemplates"
          />
          <label for="dashboard-file" class="input-label">
            <Icon class="mr-5" iconName="folder_open" />
            {{ t("import") }}
          </label>
        </el-button>
        <el-pagination
          class="pagination"
          layout="prev, pager, next"
          :page-size="pageSize"
          :total="total"
          v-model="currentPage"
          @current-change="changePage"
          @prev-click="changePage"
          @next-click="changePage"
        />
      </div>
      <el-dialog v-model="MQEVisible" title="Hierarchy Graph" width="400px">
        <div class="mb-10">
          <span class="label mr-10">{{ t("hierarchyNodeDashboard") }}</span>
          <el-switch v-model="currentRow.isDefault" style="height: 25px" />
        </div>
        <div>
          <span class="label">{{ t("hierarchyNodeMetrics") }}</span>
          <el-popover placement="left" :width="400" trigger="click">
            <template #reference>
              <span>
                <Icon class="cp ml-5" iconName="mode_edit" size="middle" />
              </span>
            </template>
            <Metrics
              :type="'hierarchyServicesConfig'"
              :expressions="currentRow.expressions || []"
              :layer="currentRow.layer"
              :entity="currentRow.entity"
              @update="updateSettings"
            />
          </el-popover>
        </div>
        <div class="mt-10 expressions">
          <Tags
            :tags="currentRow.expressions || []"
            :vertical="true"
            :text="t('addExpressions')"
            @change="(param: string[]) => changeExpressions(param)"
          />
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="MQEVisible = false"> Cancel </el-button>
            <el-button type="primary" @click="saveMQE"> Confirm </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { ElMessageBox, ElMessage } from "element-plus";
  import { ElTable } from "element-plus";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import router from "@/router";
  import type { DashboardItem, LayoutConfig } from "@/types/dashboard";
  import { saveFile, readFile } from "@/utils/file";
  import { EntityType } from "./data";
  import { isEmptyObject } from "@/utils/is";
  import { WidgetType } from "@/views/dashboard/data";
  import Metrics from "@/views/dashboard/related/topology/config/Metrics.vue";

  /*global Nullable, Recordable*/
  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const pageSize = 20;
  const dashboards = ref<DashboardItem[]>([]);
  const searchText = ref<string>("");
  const loading = ref<boolean>(false);
  const currentPage = ref<number>(1);
  const total = ref<number>(0);
  const multipleTableRef = ref<InstanceType<typeof ElTable>>();
  const multipleSelection = ref<DashboardItem[]>([]);
  const dashboardFile = ref<Nullable<HTMLDivElement>>(null);
  const MQEVisible = ref<boolean>(false);
  const currentRow = ref<DashboardItem | Recordable>({});

  const handleSelectionChange = (val: DashboardItem[]) => {
    multipleSelection.value = val;
  };
  setList();
  async function setList() {
    await dashboardStore.setDashboards();
    searchDashboards(1);
  }

  function changeExpressions(params: string[]) {
    currentRow.value.expressions = params;
  }

  function updateSettings(config: Record<string, never>) {
    currentRow.value = {
      ...currentRow.value,
      expressionsConfig: config.hierarchyServicesConfig,
    };
  }

  function handleEditMQE(row: DashboardItem) {
    MQEVisible.value = !MQEVisible.value;
    currentRow.value = row;
  }

  async function saveMQE() {
    if (!currentRow.value.expressionsConfig) {
      return;
    }
    const items: DashboardItem[] = [];
    loading.value = true;
    for (const d of dashboardStore.dashboards) {
      if (d.id === currentRow.value.id) {
        d.isDefault = currentRow.value.isDefault || false;
        d.expressions = currentRow.value.expressions;
        d.expressionsConfig = currentRow.value.expressionsConfig;
        const key = [d.layer, d.entity, d.name].join("_");
        const layout = sessionStorage.getItem(key) || "{}";
        const c = {
          ...JSON.parse(layout).configuration,
          ...d,
        };
        delete c.id;
        const setting = {
          id: d.id,
          configuration: JSON.stringify(c),
        };

        const res = await dashboardStore.updateDashboard(setting);
        if (res.data.changeTemplate.status) {
          sessionStorage.setItem(
            key,
            JSON.stringify({
              id: d.id,
              configuration: c,
            }),
          );
        } else {
          loading.value = false;
          return;
        }
      } else {
        if (
          d.layer === currentRow.value.layer &&
          [EntityType[0].value].includes(d.entity) &&
          !currentRow.value.isDefault &&
          d.isDefault
        ) {
          d.isDefault = false;
          const key = [d.layer, d.entity, d.name].join("_");
          const layout = sessionStorage.getItem(key) || "{}";
          const c = {
            ...JSON.parse(layout).configuration,
            ...d,
          };
          const setting = {
            id: d.id,
            configuration: JSON.stringify(c),
          };
          const res = await dashboardStore.updateDashboard(setting);
          if (res.data.changeTemplate.status) {
            sessionStorage.setItem(
              key,
              JSON.stringify({
                id: d.id,
                configuration: c,
              }),
            );
          } else {
            loading.value = false;
            return;
          }
        }
      }
      items.push(d);
    }
    dashboardStore.resetDashboards(items);
    searchDashboards(currentPage.value);
    loading.value = false;
    MQEVisible.value = false;
  }

  async function importTemplates(event: any) {
    const arr: any = await readFile(event);
    for (const item of arr) {
      const { layer, name, entity } = item.configuration;
      const index = dashboardStore.dashboards.findIndex(
        (d: DashboardItem) => d.name === name && d.entity === entity && d.layer === layer && !item.id,
      );
      if (index > -1) {
        return ElMessage.error(t("nameError"));
      }
    }
    loading.value = true;
    for (const item of arr) {
      const { layer, name, entity, isRoot, children, isDefault, expressions, expressionsConfig } = item.configuration;
      const index = dashboardStore.dashboards.findIndex((d: DashboardItem) => d.id === item.id);
      const p: DashboardItem = {
        name: name.split(" ").join("-"),
        layer: layer,
        entity: entity,
        isRoot: isRoot || false,
        isDefault: isDefault || false,
        expressions: expressions,
        expressionsConfig: expressionsConfig,
      };
      if (index > -1) {
        p.id = item.id;
      }
      dashboardStore.setCurrentDashboard(p);
      dashboardStore.setLayout(children);
      await dashboardStore.saveDashboard();
    }
    dashboards.value = dashboardStore.dashboards;
    loading.value = false;
    dashboardFile.value = null;
    searchDashboards(currentPage.value);
  }
  function exportTemplates() {
    if (!multipleSelection.value.length) {
      return;
    }
    const arr = multipleSelection.value.sort((a: DashboardItem, b: DashboardItem) => {
      return a.name.localeCompare(b.name);
    });
    const templates = arr.map((d: DashboardItem) => {
      const key = [d.layer, d.entity, d.name].join("_");
      const layout = JSON.parse(sessionStorage.getItem(key) || "{}");
      return layout;
    });
    for (const item of templates) {
      optimizeTemplate(item.configuration.children);
    }
    const name = `dashboards.json`;
    saveFile(templates, name);
    setTimeout(() => {
      multipleTableRef.value!.clearSelection();
    }, 2000);
  }
  function optimizeTemplate(
    children: (LayoutConfig & {
      moved?: boolean;
      standard?: unknown;
      label?: string;
      value?: string;
      filters?: unknown;
    })[],
  ) {
    for (const child of children || []) {
      delete child.moved;
      delete child.activedTabIndex;
      delete child.standard;
      delete child.id;
      delete child.label;
      delete child.value;
      delete child.filters;
      if (isEmptyObject(child.graph)) {
        delete child.graph;
      }
      if (child.widget) {
        if (child.widget.title === "") {
          delete child.widget.title;
        }
        if (child.widget.tips === "") {
          delete child.widget.tips;
        }
      }
      if (isEmptyObject(child.widget)) {
        delete child.widget;
      }
      if (!(child.metrics && child.metrics.length && child.metrics[0])) {
        delete child.metrics;
      }
      if (!(child.metricTypes && child.metricTypes.length && child.metricTypes[0])) {
        delete child.metricTypes;
      }
      if (child.metricConfig && child.metricConfig.length) {
        child.metricConfig.forEach((c, index) => {
          if (!c.calculation) {
            delete c.calculation;
          }
          if (!c.unit) {
            delete c.unit;
          }
          if (!c.label) {
            delete c.label;
          }
          if (isEmptyObject(c)) {
            (child.metricConfig || []).splice(index, 1);
          }
        });
      }
      if (!(child.metricConfig && child.metricConfig.length)) {
        delete child.metricConfig;
      }
      if (child.type === WidgetType.Tab) {
        for (const item of child.children || []) {
          optimizeTemplate(item.children);
        }
      }
      if (
        (
          [
            WidgetType.Trace,
            WidgetType.Topology,
            WidgetType.Tab,
            WidgetType.Profile,
            WidgetType.Ebpf,
            WidgetType.Log,
          ] as string[]
        ).includes(child.type)
      ) {
        delete child.widget;
      }
    }
  }
  function handleEdit(row: DashboardItem) {
    dashboardStore.setMode(true);
    dashboardStore.setEntity(row.entity);
    dashboardStore.setLayer(row.layer);
    dashboardStore.setCurrentDashboard(row);
    router.push(`/dashboard/${row.layer}/${row.entity}/${row.name}`);
  }

  function handleView(row: DashboardItem) {
    dashboardStore.setMode(false);
    dashboardStore.setEntity(row.entity);
    dashboardStore.setLayer(row.layer);
    dashboardStore.setCurrentDashboard(row);
    router.push(`/dashboard/${row.layer}/${row.entity}/${row.name}`);
  }

  async function setRoot(row: DashboardItem) {
    const items: DashboardItem[] = [];
    loading.value = true;
    for (const d of dashboardStore.dashboards) {
      if (d.id === row.id) {
        d.isRoot = !row.isRoot;
        const key = [d.layer, d.entity, d.name].join("_");
        const layout = sessionStorage.getItem(key) || "{}";
        const c = {
          ...JSON.parse(layout).configuration,
          ...d,
        };
        delete c.id;

        const setting = {
          id: d.id,
          configuration: JSON.stringify(c),
        };
        const res = await dashboardStore.updateDashboard(setting);
        if (res.data.changeTemplate.status) {
          sessionStorage.setItem(
            key,
            JSON.stringify({
              id: d.id,
              configuration: c,
            }),
          );
        } else {
          loading.value = false;
          return;
        }
      } else {
        if (
          d.layer === row.layer &&
          [EntityType[0].value, EntityType[1].value].includes(d.entity) &&
          row.isRoot === false &&
          d.isRoot === true
        ) {
          d.isRoot = false;
          const key = [d.layer, d.entity, d.name].join("_");
          const layout = sessionStorage.getItem(key) || "{}";
          const c = {
            ...JSON.parse(layout).configuration,
            ...d,
          };
          const setting = {
            id: d.id,
            configuration: JSON.stringify(c),
          };
          const res = await dashboardStore.updateDashboard(setting);
          if (res.data.changeTemplate.status) {
            sessionStorage.setItem(
              key,
              JSON.stringify({
                id: d.id,
                configuration: c,
              }),
            );
          } else {
            loading.value = false;
            return;
          }
        }
      }
      items.push(d);
    }
    dashboardStore.resetDashboards(items);
    searchDashboards(currentPage.value);
    loading.value = false;
  }

  function handleRename(row: DashboardItem) {
    ElMessageBox.prompt("Please input dashboard name", "Edit", {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      inputValue: row.name,
    })
      .then(({ value }) => {
        updateName(row, value);
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "Input canceled",
        });
      });
  }
  async function updateName(d: DashboardItem, value: string) {
    if (new RegExp(/\s/).test(value)) {
      ElMessage.error("The name cannot contain spaces, carriage returns, etc");
      return;
    }
    const key = [d.layer, d.entity, d.name].join("_");
    const layout = sessionStorage.getItem(key) || "{}";
    const c = {
      ...JSON.parse(layout).configuration,
      ...d,
      name: value,
    };
    delete c.id;
    delete c.filters;
    const setting = {
      id: d.id,
      configuration: JSON.stringify(c),
    };
    loading.value = true;
    const res = await dashboardStore.updateDashboard(setting);
    loading.value = false;
    if (!res.data.changeTemplate.id) {
      return;
    }
    dashboardStore.setCurrentDashboard({
      ...d,
      name: value,
    });
    dashboards.value = dashboardStore.dashboards.map((item: DashboardItem) => {
      if (dashboardStore.currentDashboard.id === item.id) {
        item = dashboardStore.currentDashboard;
      }
      return item;
    });
    dashboardStore.resetDashboards(dashboards.value);
    sessionStorage.setItem("dashboards", JSON.stringify(dashboards.value));
    sessionStorage.removeItem(key);
    const str = [
      dashboardStore.currentDashboard.layer,
      dashboardStore.currentDashboard.entity,
      dashboardStore.currentDashboard.name,
    ].join("_");
    sessionStorage.setItem(
      str,
      JSON.stringify({
        id: d.id,
        configuration: c,
      }),
    );
    searchText.value = "";
  }
  async function handleDelete(row: DashboardItem) {
    dashboardStore.setCurrentDashboard(row);
    loading.value = true;
    await dashboardStore.deleteDashboard();
    dashboards.value = dashboardStore.dashboards;
    loading.value = false;
    sessionStorage.setItem("dashboards", JSON.stringify(dashboards.value));
    sessionStorage.removeItem(`${row.layer}_${row.entity}_${row.name}`);
    searchDashboards(currentPage.value);
  }
  function searchDashboards(pageIndex: number) {
    const list = JSON.parse(sessionStorage.getItem("dashboards") || "[]");
    const arr = list.filter((d: { name: string }) => d.name.includes(searchText.value));

    total.value = arr.length;
    dashboards.value = arr.filter(
      (d: { name: string }, index: number) => index < pageIndex * pageSize && index >= (pageIndex - 1) * pageSize,
    );
    currentPage.value = pageIndex;
  }

  async function reloadTemplates() {
    loading.value = true;
    await dashboardStore.resetTemplates();
    loading.value = false;
  }
  function changePage(pageIndex: number) {
    currentPage.value = pageIndex;
    searchDashboards(pageIndex);
  }
</script>
<style lang="scss" scoped>
  .header {
    flex-direction: row-reverse;
  }

  .dashboard-list {
    padding: 20px;
    width: 100%;
    overflow: auto;
  }

  .input-with-search {
    width: 250px;
  }

  .table {
    padding: 20px 10px;
    background-color: $theme-background;
    box-shadow: 0 1px 4px 0 #00000029;
    border-radius: 5px;
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  .toggle-selection {
    margin-top: 20px;
    background-color: $theme-background;
  }

  .pagination {
    float: right;
  }

  .btn {
    width: 220px;
    font-size: 13px;
  }

  .import-template {
    display: none;
  }

  .input-label {
    line-height: 30px;
    height: 30px;
    width: 220px;
    cursor: pointer;
  }

  .name {
    color: $active-color;
  }

  .reload {
    margin-right: 3px;
  }

  .reload-btn {
    display: inline-block;
    margin-left: 10px;
  }

  .placeholder {
    display: inline-block;
    width: 136px;
  }

  .expressions {
    height: 300px;
  }

  .label {
    font-size: 12px;
  }
</style>
