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
import { useEventListener } from "../useEventListener";

describe("useEventListener", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("adds listener to window and invokes handler (no wait)", () => {
    const handler = vi.fn();

    const { removeEvent } = useEventListener({
      name: "click",
      listener: handler,
      // wait = 0 ensures realHandler is the raw listener (no debounce/throttle)
      wait: 0,
    });

    window.dispatchEvent(new Event("click"));
    expect(handler).toHaveBeenCalledTimes(1);

    // removing should stop further calls
    removeEvent();
    window.dispatchEvent(new Event("click"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("adds listener to a custom element and removes via removeEvent", () => {
    const handler = vi.fn();
    const div = document.createElement("div");

    const { removeEvent } = useEventListener({
      el: div,
      name: "custom",
      listener: handler,
      wait: 0,
    });

    div.dispatchEvent(new Event("custom"));
    expect(handler).toHaveBeenCalledTimes(1);

    removeEvent();
    div.dispatchEvent(new Event("custom"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("respects debounce when wait > 0", () => {
    const handler = vi.fn();

    useEventListener({
      name: "scroll",
      listener: handler,
      isDebounce: true,
      wait: 100,
    });

    // Fire multiple events rapidly
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("scroll"));

    // Before debounce delay: not called
    expect(handler).not.toHaveBeenCalled();

    // After debounce delay: called once
    vi.advanceTimersByTime(100);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("respects throttle when wait > 0 (leading true, trailing false by default)", () => {
    const handler = vi.fn();

    useEventListener({
      name: "mousemove",
      listener: handler,
      isDebounce: false,
      wait: 100,
    });

    // First call should fire immediately (leading)
    window.dispatchEvent(new Event("mousemove"));
    expect(handler).toHaveBeenCalledTimes(1);

    // Rapid subsequent event within the window should be throttled
    vi.advanceTimersByTime(10);
    window.dispatchEvent(new Event("mousemove"));
    expect(handler).toHaveBeenCalledTimes(1);

    // After the throttle window passes, still no trailing call by default
    vi.advanceTimersByTime(100);
    expect(handler).toHaveBeenCalledTimes(1);

    // Next event after window should invoke again
    window.dispatchEvent(new Event("mousemove"));
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("supports addEventListener options (once)", () => {
    const handler = vi.fn();

    useEventListener({
      name: "keyup",
      listener: handler,
      options: { once: true },
      wait: 0,
    });

    window.dispatchEvent(new Event("keyup"));
    window.dispatchEvent(new Event("keyup"));

    // Because of once: true the handler should run only once
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
