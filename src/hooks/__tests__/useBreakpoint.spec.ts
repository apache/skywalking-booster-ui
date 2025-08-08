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
import { createBreakpointListen, useBreakpoint } from "../useBreakpoint";
import { sizeEnum, screenMap } from "../data";

function setBodyClientWidth(width: number) {
  Object.defineProperty(document.body, "clientWidth", {
    value: width,
    configurable: true,
  });
}

describe("useBreakpoint", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("initializes with current width and calls callback once", () => {
    setBodyClientWidth(400); // < XS(480)

    const callback = vi.fn();
    const { screenRef, widthRef, realWidthRef } = createBreakpointListen(callback);

    // Initial values computed synchronously via getWindowWidth + resizeFn
    expect(screenRef.value).toBe(sizeEnum.XS);
    expect(widthRef.value).toBe(screenMap.get(sizeEnum.XS));
    expect(realWidthRef.value).toBe(400);

    expect(callback).toHaveBeenCalledTimes(1);
    const args = callback.mock.calls[0][0];
    expect(args.screen.value).toBe(sizeEnum.XS);
    expect(args.width.value).toBe(screenMap.get(sizeEnum.XS));
    expect(args.realWidth.value).toBe(400);
  });

  it("updates refs on resize (debounced)", () => {
    setBodyClientWidth(500); // SM bucket
    const callback = vi.fn();
    const { screenRef, widthRef, realWidthRef } = createBreakpointListen(callback);

    expect(screenRef.value).toBe(sizeEnum.SM);
    expect(widthRef.value).toBe(screenMap.get(sizeEnum.SM));
    expect(realWidthRef.value).toBe(500);
    expect(callback).toHaveBeenCalledTimes(1);

    // Change to 800 -> LG bucket
    setBodyClientWidth(800);
    window.dispatchEvent(new Event("resize"));

    // Debounced by default (wait=80), so not yet updated
    expect(screenRef.value).toBe(sizeEnum.SM);
    expect(callback).toHaveBeenCalledTimes(1);

    // After debounce window
    vi.advanceTimersByTime(80);
    expect(screenRef.value).toBe(sizeEnum.LG);
    expect(widthRef.value).toBe(screenMap.get(sizeEnum.LG));
    expect(realWidthRef.value).toBe(800);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("maps widths across all breakpoints correctly", () => {
    const callback = vi.fn();

    // XS: < 480
    setBodyClientWidth(479);
    const a = createBreakpointListen(callback);
    expect(a.screenRef.value).toBe(sizeEnum.XS);
    expect(a.widthRef.value).toBe(screenMap.get(sizeEnum.XS));
    expect(a.realWidthRef.value).toBe(479);

    // SM: [480, 576)
    setBodyClientWidth(500);
    window.dispatchEvent(new Event("resize"));
    vi.advanceTimersByTime(80);
    expect(a.screenRef.value).toBe(sizeEnum.SM);

    // MD: [576, 768)
    setBodyClientWidth(600);
    window.dispatchEvent(new Event("resize"));
    vi.advanceTimersByTime(80);
    expect(a.screenRef.value).toBe(sizeEnum.MD);

    // LG: [768, 992)
    setBodyClientWidth(800);
    window.dispatchEvent(new Event("resize"));
    vi.advanceTimersByTime(80);
    expect(a.screenRef.value).toBe(sizeEnum.LG);

    // XL: [992, 1200)
    setBodyClientWidth(1100);
    window.dispatchEvent(new Event("resize"));
    vi.advanceTimersByTime(80);
    expect(a.screenRef.value).toBe(sizeEnum.XL);

    // XXL: >= 1200
    setBodyClientWidth(2000);
    window.dispatchEvent(new Event("resize"));
    vi.advanceTimersByTime(80);
    expect(a.screenRef.value).toBe(sizeEnum.XXL);
    expect(a.widthRef.value).toBe(screenMap.get(sizeEnum.XXL));
    expect(a.realWidthRef.value).toBe(2000);

    // Callback should have been called on init + each debounced resize
    // init once + 5 resizes => 6 total
    expect(callback).toHaveBeenCalledTimes(6);
  });

  it("useBreakpoint exposes the same global refs", () => {
    setBodyClientWidth(700); // MD bucket
    createBreakpointListen();

    const { screenRef, widthRef, realWidthRef } = useBreakpoint();
    expect(screenRef).toBeDefined();
    expect(widthRef).toBeDefined();
    expect(realWidthRef).toBeDefined();

    expect(screenRef).not.toBeNull();
    expect(widthRef.value).toBe(screenMap.get(sizeEnum.MD));
    expect(realWidthRef.value).toBe(700);

    // Change to XXL and verify through useBreakpoint refs
    setBodyClientWidth(1600);
    window.dispatchEvent(new Event("resize"));
    vi.advanceTimersByTime(80);
    expect(screenRef.value).toBe(sizeEnum.XXL);
    expect(widthRef.value).toBe(screenMap.get(sizeEnum.XXL));
    expect(realWidthRef.value).toBe(1600);
  });

  it("debounces multiple rapid resize events into a single update", () => {
    setBodyClientWidth(750); // MD
    const cb = vi.fn();
    const { screenRef } = createBreakpointListen(cb);
    expect(screenRef.value).toBe(sizeEnum.MD);
    expect(cb).toHaveBeenCalledTimes(1);

    // Rapid events with different widths; only final one should be applied after debounce
    setBodyClientWidth(770); // still LG range? 770 >= 768 -> LG bucket
    window.dispatchEvent(new Event("resize"));
    setBodyClientWidth(1000); // XL bucket boundary (< 1200)
    window.dispatchEvent(new Event("resize"));
    setBodyClientWidth(1300); // XXL
    window.dispatchEvent(new Event("resize"));

    // Before debounce timeout, nothing changes
    expect(screenRef.value).toBe(sizeEnum.MD);
    expect(cb).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(80);
    // Only the last width (1300) should be reflected
    expect(screenRef.value).toBe(sizeEnum.XXL);
    expect(cb).toHaveBeenCalledTimes(2);
  });
});
