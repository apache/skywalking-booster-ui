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
  <div v-if="type === 'statistics'">
    <div class="trace-item">
      <div :class="['method']">
        <el-tooltip :content="data.groupRef.endpointName" placement="bottom" :show-after="300">
          <span>
            {{ data.groupRef.endpointName }}
          </span>
        </el-tooltip>
      </div>
      <div :class="['type']">
        <el-tooltip :content="data.groupRef.type" placement="bottom" :show-after="300">
          <span>
            {{ data.groupRef.type }}
          </span>
        </el-tooltip>
      </div>
      <div class="max-time">
        {{ data.maxTime }}
      </div>
      <div class="min-time">
        {{ data.minTime }}
      </div>
      <div class="sum-time">
        {{ data.sumTime }}
      </div>
      <div class="avg-time">
        {{ parseInt(data.avgTime) }}
      </div>
      <div class="count">
        {{ data.count }}
      </div>
    </div>
  </div>
  <div v-else>
    <div
      @click="selectSpan"
      :class="[
        'trace-item',
        'level' + (data.level - 1),
        { 'trace-item-error': data.isError },
        { profiled: data.profiled === false },
      ]"
      :data-text="data.profiled === false ? 'No Thread Dump' : ''"
    >
      <div
        :class="['method', 'level' + (data.level - 1)]"
        :style="{
          'text-indent': (data.level - 1) * 10 + 'px',
          width: `${method}px`,
        }"
      >
        <Icon
          :style="!displayChildren ? 'transform: rotate(-90deg);' : ''"
          @click.stop="toggle"
          v-if="data.children && data.children.length"
          iconName="arrow-down"
          size="sm"
          class="mr-5"
        />
        <el-tooltip
          :content="data.type === 'Entry' ? 'Entry' : 'Exit'"
          placement="bottom"
          :show-after="300"
          v-if="['Entry', 'Exit'].includes(data.type)"
        >
          <span>
            <Icon :iconName="data.type === 'Entry' ? 'entry' : 'exit'" size="sm" class="mr-5" />
          </span>
        </el-tooltip>
        <el-tooltip v-if="isCrossThread" content="CROSS_THREAD" placement="bottom" :show-after="300">
          <span>
            <Icon iconName="cross" size="sm" class="mr-5" />
          </span>
        </el-tooltip>
        <el-tooltip :content="data.endpointName" placement="bottom" :show-after="300">
          <span>
            {{ data.endpointName }}
          </span>
        </el-tooltip>
      </div>
      <div class="start-time">
        {{ dateFormat(data.startTime) }}
      </div>
      <div class="exec-ms">
        {{ data.endTime - data.startTime ? data.endTime - data.startTime : "0" }}
      </div>
      <div class="exec-percent">
        <div class="outer-progress_bar" :style="{ width: outterPercent }">
          <div class="inner-progress_bar" :style="{ width: innerPercent }"></div>
        </div>
      </div>
      <div class="self">
        {{ data.dur ? data.dur + "" : "0" }}
      </div>
      <div class="api">
        <el-tooltip :show-after="300" :content="data.component || '-'" placement="bottom">
          <span>{{ data.component || "-" }}</span>
        </el-tooltip>
      </div>
      <div class="application">
        <el-tooltip :show-after="300" :content="data.serviceCode || '-'" placement="bottom">
          <span>{{ data.serviceCode }}</span>
        </el-tooltip>
      </div>
      <div class="application" v-show="headerType === 'profile'" @click="viewSpan($event)">
        <span>{{ t("view") }}</span>
      </div>
      <div class="application" v-show="headerType !== 'profile'">
        <span>{{ data.attachedEvents && data.attachedEvents.length }}</span>
      </div>
    </div>
    <div v-show="data.children && data.children.length > 0 && displayChildren" class="children-trace">
      <table-item
        :method="method"
        v-for="(child, index) in data.children"
        :key="index"
        :data="child"
        :type="type"
        :headerType="headerType"
        @select="selectedItem(child)"
      />
    </div>
    <el-dialog v-model="showDetail" :destroy-on-close="true" fullscreen @closed="showDetail = false">
      <SpanDetail :currentSpan="data" :traceId="traceId" />
    </el-dialog>
  </div>
</template>
<script lang="ts">
  import { useI18n } from "vue-i18n";
  import { ref, computed, defineComponent, watch } from "vue";
  import type { PropType } from "vue";
  import SpanDetail from "../D3Graph/SpanDetail.vue";
  import { dateFormat } from "@/utils/dateFormat";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { Themes } from "@/constants/data";

  /*global Recordable*/
  const props = {
    data: { type: Object as PropType<Recordable>, default: () => ({}) },
    method: { type: Number, default: 0 },
    type: { type: String, default: "" },
    headerType: { type: String, default: "" },
    traceId: { type: String, traceId: "" },
  };
  export default defineComponent({
    name: "TableItem",
    props,
    emits: ["select"],
    components: { SpanDetail },
    setup(props, { emit }) {
      const appStore = useAppStoreWithOut();
      const displayChildren = ref<boolean>(true);
      const showDetail = ref<boolean>(false);
      const { t } = useI18n();
      const selfTime = computed(() => (props.data.dur ? props.data.dur : 0));
      const execTime = computed(() =>
        props.data.endTime - props.data.startTime ? props.data.endTime - props.data.startTime : 0,
      );
      const outterPercent = computed(() => {
        if (props.data.level === 1) {
          return "100%";
        } else {
          const data = props.data;
          const exec = data.endTime - data.startTime ? data.endTime - data.startTime : 0;
          let result = (exec / data.totalExec) * 100;
          result = result > 100 ? 100 : result;
          const resultStr = result.toFixed(4) + "%";
          return resultStr === "0.0000%" ? "0.9%" : resultStr;
        }
      });
      const innerPercent = computed(() => {
        const result = (selfTime.value / execTime.value) * 100;
        const resultStr = result.toFixed(4) + "%";
        return resultStr === "0.0000%" ? "0.9%" : resultStr;
      });
      const isCrossThread = computed(() => {
        const key = props.data.refs.findIndex((d: { type: string }) => d.type === "CROSS_THREAD");
        return key > -1 ? true : false;
      });

      function toggle() {
        displayChildren.value = !displayChildren.value;
      }
      function showSelectSpan(dom: HTMLSpanElement) {
        if (!dom) {
          return;
        }
        const items: any = document.querySelectorAll(".trace-item");
        for (const item of items) {
          item.style.background = appStore.theme === Themes.Dark ? "#212224" : "#fff";
        }
        dom.style.background = appStore.theme === Themes.Dark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
        const p: any = document.getElementsByClassName("profiled")[0];
        if (p) {
          p.style.background = appStore.theme === Themes.Dark ? "#333" : "#eee";
        }
      }
      function selectSpan(event: Recordable) {
        const dom = event.composedPath().find((d: Recordable) => d.className.includes("trace-item"));

        emit("select", props.data);
        if (props.headerType === "profile") {
          showSelectSpan(dom);
          return;
        }
        viewSpanDetail(dom);
      }
      function viewSpan(event: Recordable) {
        const dom = event.composedPath().find((d: Recordable) => d.className.includes("trace-item"));
        emit("select", props.data);
        viewSpanDetail(dom);
      }

      function selectedItem(data: HTMLSpanElement) {
        emit("select", data);
      }
      function viewSpanDetail(dom: HTMLSpanElement) {
        showSelectSpan(dom);
        showDetail.value = true;
      }
      watch(
        () => appStore.theme,
        () => {
          const items: any = document.querySelectorAll(".trace-item");
          for (const item of items) {
            item.style.background = appStore.theme === Themes.Dark ? "#212224" : "#fff";
          }
          const p: any = document.getElementsByClassName("profiled")[0];
          if (p) {
            p.style.background = appStore.theme === Themes.Dark ? "#333" : "#eee";
          }
        },
      );
      return {
        displayChildren,
        outterPercent,
        innerPercent,
        isCrossThread,
        viewSpanDetail,
        toggle,
        dateFormat,
        showSelectSpan,
        showDetail,
        selectSpan,
        selectedItem,
        viewSpan,
        t,
        appStore,
      };
    },
  });
</script>
<style lang="scss" scoped>
  @import url("./table.scss");

  .event-tag {
    width: 12px;
    height: 12px;
    border-radius: 12px;
    border: 1px solid #e66;
    color: #e66;
    display: inline-block;
  }

  .trace-item.level0 {
    color: #448dfe;

    &:hover {
      background: rgb(0 0 0 / 4%);
    }
  }

  .profiled {
    background-color: var(--sw-table-header);
    position: relative;
  }

  .profiled::before {
    content: attr(data-text);
    position: absolute;
    top: 30px;
    left: 220px;
    width: 100px;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid $disabled-color;
    background-color: $font-color;
    color: $text-color;
    text-align: center;
    box-shadow: var(--box-shadow-color) 0 2px 3px;
    display: none;
  }

  .profiled::after {
    content: "";
    position: absolute;
    left: 250px;
    top: 20px;
    border: 6px solid $font-color;
    border-color: transparent transparent $font-color;
    display: none;
  }

  .profiled:hover::before,
  .profiled:hover::after {
    display: block;
    z-index: 999;
  }

  .trace-item-error {
    color: #e54c17;
  }

  .trace-item {
    white-space: nowrap;
    position: relative;
    cursor: pointer;
  }

  .trace-item.selected {
    background-color: var(--sw-list-selected);
  }

  .trace-item:not(.level0):hover {
    background-color: var(--sw-list-hover);
  }

  .trace-item > div {
    padding: 0 5px;
    display: inline-block;
    border: 1px solid transparent;
    border-right: 1px dotted silver;
    overflow: hidden;
    line-height: 30px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .trace-item > div.method {
    padding-left: 10px;
  }

  .trace-item div.exec-percent {
    width: 100px;
    height: 30px;
    padding: 0 8px;

    .outer-progress_bar {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: rgb(63 177 227);
      position: relative;
      margin-top: 11px;
      border: none;
    }

    .inner-progress_bar {
      position: absolute;
      background: rgb(110 64 170);
      height: 4px;
      border-radius: 2px;
      left: 0;
      border: none;
      top: 1px;
    }
  }
</style>
