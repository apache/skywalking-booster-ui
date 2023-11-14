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
import type { BarSeriesOption, LineSeriesOption, HeatmapSeriesOption, SankeySeriesOption } from "echarts/charts";
import type {
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  DatasetComponentOption,
  LegendComponentOption,
} from "echarts/components";
import type { Ref } from "vue";
import { useTimeoutFn } from "./useTimeout";
import { tryOnUnmounted } from "@vueuse/core";
import { unref, nextTick, watch, computed, ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useEventListener } from "./useEventListener";
import { useBreakpoint } from "./useBreakpoint";
import echarts from "@/utils/echarts";
import { useAppStoreWithOut } from "@/store/modules/app";
import { Themes } from "@/constants/data";

export type ECOption = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | LegendComponentOption
  | HeatmapSeriesOption
  | SankeySeriesOption
>;

export function useECharts(elRef: Ref<HTMLDivElement>, theme: "light" | "dark" | "default" = "default"): Indexable {
  const appStore = useAppStoreWithOut();
  const getDarkMode = computed(() => {
    return appStore.theme === "default" ? Themes.Light : theme;
  });
  let chartInstance: Nullable<echarts.ECharts> = null;
  let resizeFn: Fn = resize;
  const cacheOptions = ref({}) as Ref<ECOption>;
  let removeResizeFn: Fn = () => ({});

  resizeFn = useDebounceFn(resize, 200);

  const getOptions = computed(() => {
    if (getDarkMode.value !== Themes.Dark) {
      return cacheOptions.value as ECOption;
    }
    return {
      backgroundColor: "transparent",
      ...cacheOptions.value,
    } as ECOption;
  });

  function initCharts(t = theme) {
    const el = unref(elRef);
    if (!el || !unref(el)) {
      return;
    }
    const { width, height } = el.getBoundingClientRect();

    if (!width || !height) {
      return;
    }
    chartInstance = echarts.init(el, t);
    const { removeEvent } = useEventListener({
      el: window,
      name: "resize",
      listener: resizeFn,
    });
    removeResizeFn = removeEvent;
    const { widthRef, screenEnum } = useBreakpoint();
    if (unref(widthRef) <= screenEnum.MD || el.offsetHeight === 0) {
      useTimeoutFn(() => {
        resizeFn();
      }, 30);
    }
  }

  function setOptions(options: ECOption, clear = true) {
    cacheOptions.value = options;
    if (unref(elRef)?.offsetHeight === 0) {
      useTimeoutFn(() => {
        setOptions(unref(getOptions));
      }, 30);
      return;
    }
    nextTick(() => {
      useTimeoutFn(() => {
        if (!chartInstance) {
          initCharts(getDarkMode.value as "default");

          if (!chartInstance) return;
        }
        clear && chartInstance?.clear();

        chartInstance?.setOption(unref(getOptions));
      }, 30);
    });
  }

  function resize() {
    chartInstance?.resize();
  }

  watch(
    () => getDarkMode.value,
    (theme) => {
      if (chartInstance) {
        chartInstance.dispose();
        initCharts(theme as "default");
        setOptions(cacheOptions.value);
      }
    },
  );

  tryOnUnmounted(() => {
    if (!chartInstance) return;
    removeResizeFn();
    chartInstance.dispose();
    chartInstance = null;
  });

  function getInstance(): Nullable<echarts.ECharts> {
    if (!chartInstance) {
      initCharts(getDarkMode.value as "default");
    }
    return chartInstance;
  }

  return {
    setOptions,
    resize,
    echarts,
    getInstance,
  };
}
