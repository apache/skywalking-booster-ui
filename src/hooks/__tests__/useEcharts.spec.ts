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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref, nextTick, reactive } from "vue";
import { useECharts } from "../useEcharts";
import { Themes } from "@/constants/data";

// echarts mock
const initMock = vi.fn();
const instanceFactory = () => ({
  setOption: vi.fn(),
  clear: vi.fn(),
  dispose: vi.fn(),
  resize: vi.fn(),
});
let lastInstance: any;
vi.mock("@/utils/echarts", () => ({
  default: {
    init: vi.fn((el: any, theme: string) => {
      lastInstance = instanceFactory();
      (initMock as any).calls ??= [];
      initMock(el, theme);
      return lastInstance;
    }),
  },
}));

// reactive app store mock; we'll reassign per test
let appStoreMock: any;
vi.mock("@/store/modules/app", () => ({
  useAppStoreWithOut: () => appStoreMock,
}));

// provide useBreakpoint to avoid accessing undefined globals
vi.mock("../useBreakpoint", () => ({
  useBreakpoint: () => ({ widthRef: 2000, screenEnum: { MD: 768 } }),
}));

function makeDiv(width = 300, height = 200) {
  const div = document.createElement("div");
  Object.defineProperty(div, "offsetHeight", { value: height, configurable: true });
  div.getBoundingClientRect = () => ({
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON() {},
  });
  document.body.appendChild(div);
  return div as HTMLDivElement;
}

describe("useECharts", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.clearAllTimers();
    appStoreMock = reactive({ theme: "default" });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("initializes and sets options (light mode)", async () => {
    const el = makeDiv();
    const elRef = ref<HTMLDivElement>(el);
    const { setOptions } = useECharts(elRef, "dark");

    const options: any = { title: { text: "Hello" } };
    setOptions(options);

    // flush nextTick and the internal 30ms timeout
    await nextTick();
    vi.advanceTimersByTime(35);
    await nextTick();

    expect(initMock).toHaveBeenCalledTimes(1);
    expect(initMock).toHaveBeenCalledWith(el, Themes.Light);
    expect(lastInstance.clear).toHaveBeenCalledTimes(1);
    expect(lastInstance.setOption).toHaveBeenCalledTimes(1);
    expect(lastInstance.setOption.mock.calls[0][0]).toStrictEqual(options);
  });

  it("handles window resize via debounced listener", async () => {
    const el = makeDiv();
    const elRef = ref<HTMLDivElement>(el);
    const { setOptions } = useECharts(elRef, "dark");
    setOptions({} as any);

    await nextTick();
    vi.advanceTimersByTime(35);

    // trigger resize event
    window.dispatchEvent(new Event("resize"));

    // two layers of debounce: 80 (listener) + 200 (resizeFn)
    vi.advanceTimersByTime(300);
    expect(lastInstance.resize).toHaveBeenCalledTimes(1);
  });

  it("applies dark theme background and uses provided theme string", async () => {
    appStoreMock.theme = Themes.Dark;
    const el = makeDiv();
    const elRef = ref<HTMLDivElement>(el);
    const { setOptions } = useECharts(elRef, "dark");

    const options: any = { title: { text: "Dark" } };
    setOptions(options);

    await nextTick();
    vi.advanceTimersByTime(35);
    await nextTick();

    expect(initMock).toHaveBeenCalledWith(el, "dark");
    expect(lastInstance.setOption).toHaveBeenCalledTimes(1);
    const passed = lastInstance.setOption.mock.calls[0][0];
    expect(passed).toMatchObject({ backgroundColor: "transparent", title: { text: "Dark" } });
  });

  it("getInstance initializes chart on demand", () => {
    const el = makeDiv();
    const elRef = ref<HTMLDivElement>(el);
    const { getInstance } = useECharts(elRef, "dark");

    const inst = getInstance();
    expect(initMock).toHaveBeenCalledTimes(1);
    expect(inst).toBeTruthy();
  });
});
