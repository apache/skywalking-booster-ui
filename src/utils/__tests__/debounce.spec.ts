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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { debounce } from "../debounce";

describe("debounce utility function", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should call the function only once after delay", () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 1000);

    // Call multiple times
    debouncedFn();
    debouncedFn();
    debouncedFn();

    // Function should not be called immediately
    expect(callback).not.toHaveBeenCalled();

    // Fast forward time
    vi.advanceTimersByTime(1000);

    // Function should be called only once
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should reset timer on subsequent calls", () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 1000);

    // First call
    debouncedFn();

    // Advance time but not enough to trigger
    vi.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();

    // Second call should reset timer
    debouncedFn();

    // Advance time again
    vi.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();

    // Advance to trigger the function
    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should handle different delay durations", () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 500);

    debouncedFn();

    // Should not be called before delay
    vi.advanceTimersByTime(499);
    expect(callback).not.toHaveBeenCalled();

    // Should be called after delay
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should handle zero delay", () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 0);

    debouncedFn();

    // Should be called after a tick even with zero delay
    vi.advanceTimersByTime(0);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should handle multiple rapid calls", () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 100);

    // Rapid successive calls
    for (let i = 0; i < 10; i++) {
      debouncedFn();
    }

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
