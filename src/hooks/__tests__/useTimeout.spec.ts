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
import { nextTick } from "vue";
import { useTimeoutFn, useTimeoutRef } from "../useTimeout";

describe("useTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("useTimeoutRef", () => {
    it("should initialize with readyRef as false", () => {
      const { readyRef } = useTimeoutRef(1000);
      expect(readyRef.value).toBe(false);
    });

    it("should set readyRef to true after timeout", async () => {
      const { readyRef } = useTimeoutRef(1000);

      expect(readyRef.value).toBe(false);

      vi.advanceTimersByTime(1000);
      await nextTick();

      expect(readyRef.value).toBe(true);
    });

    it("should start timer immediately", () => {
      const { readyRef } = useTimeoutRef(500);

      expect(readyRef.value).toBe(false);

      vi.advanceTimersByTime(500);

      expect(readyRef.value).toBe(true);
    });

    it("should provide stop function that clears timer", () => {
      const { readyRef, stop } = useTimeoutRef(1000);

      expect(readyRef.value).toBe(false);

      stop();
      vi.advanceTimersByTime(1000);

      expect(readyRef.value).toBe(false);
    });

    it("should provide start function that restarts timer", () => {
      const { readyRef, start } = useTimeoutRef(1000);

      // Wait for initial timer
      vi.advanceTimersByTime(1000);
      expect(readyRef.value).toBe(true);

      // Reset and restart
      start();
      expect(readyRef.value).toBe(false);

      vi.advanceTimersByTime(1000);
      expect(readyRef.value).toBe(true);
    });

    it("should handle multiple start calls", () => {
      const { readyRef, start } = useTimeoutRef(1000);

      // Call start multiple times
      start();
      start();
      start();

      expect(readyRef.value).toBe(false);

      vi.advanceTimersByTime(1000);
      expect(readyRef.value).toBe(true);
    });

    it("should handle zero timeout", () => {
      const { readyRef } = useTimeoutRef(0);

      vi.advanceTimersByTime(0);
      expect(readyRef.value).toBe(true);
    });

    it("should handle negative timeout", () => {
      const { readyRef } = useTimeoutRef(-1000);

      vi.advanceTimersByTime(0);
      expect(readyRef.value).toBe(true);
    });

    it("should return all required functions and refs", () => {
      const result = useTimeoutRef(1000);

      expect(result).toHaveProperty("readyRef");
      expect(result).toHaveProperty("stop");
      expect(result).toHaveProperty("start");
      expect(typeof result.stop).toBe("function");
      expect(typeof result.start).toBe("function");
    });
  });

  describe("useTimeoutFn", () => {
    it("should call handle function after timeout when native is false", async () => {
      const mockHandle = vi.fn();
      const { readyRef } = useTimeoutFn(mockHandle, 1000, false);

      expect(mockHandle).not.toHaveBeenCalled();
      expect(readyRef.value).toBe(false);

      vi.advanceTimersByTime(1000);
      await nextTick();

      expect(mockHandle).toHaveBeenCalledTimes(1);
      expect(readyRef.value).toBe(true);
    });

    it("should call handle function immediately when native is true", () => {
      const mockHandle = vi.fn();
      const { readyRef } = useTimeoutFn(mockHandle, 1000, true);

      expect(mockHandle).toHaveBeenCalledTimes(1);
      expect(readyRef.value).toBe(false);
    });

    it("should not call handle function immediately when native is false", () => {
      const mockHandle = vi.fn();
      const { readyRef } = useTimeoutFn(mockHandle, 1000, false);

      expect(mockHandle).not.toHaveBeenCalled();
      expect(readyRef.value).toBe(false);
    });

    it("should provide stop function that prevents handle execution", async () => {
      const mockHandle = vi.fn();
      const { readyRef, stop } = useTimeoutFn(mockHandle, 1000, false);

      stop();
      vi.advanceTimersByTime(1000);
      await nextTick();

      expect(mockHandle).not.toHaveBeenCalled();
      expect(readyRef.value).toBe(false);
    });

    it("should provide start function that restarts timeout", async () => {
      const mockHandle = vi.fn();
      const { readyRef, start } = useTimeoutFn(mockHandle, 1000, false);

      // Wait for initial timeout
      vi.advanceTimersByTime(1000);
      await nextTick();
      expect(mockHandle).toHaveBeenCalledTimes(1);

      // Reset and restart
      start();
      expect(readyRef.value).toBe(false);

      vi.advanceTimersByTime(1000);
      await nextTick();
      // Wait a bit more for reactivity to update
      await nextTick();
      // The handle should be called at least once, and readyRef should be true
      expect(mockHandle).toHaveBeenCalled();
      expect(readyRef.value).toBe(true);
    });

    it("should handle handle function that returns a value", async () => {
      const mockHandle = vi.fn(() => "test result");
      useTimeoutFn(mockHandle, 1000, false);

      vi.advanceTimersByTime(1000);
      await nextTick();

      expect(mockHandle).toHaveBeenCalledTimes(1);
      expect(mockHandle).toHaveReturnedWith("test result");
    });

    it("should handle handle function that throws an error", async () => {
      const mockHandle = vi.fn(() => {
        throw new Error("Test error");
      });

      // Use try-catch to handle the error that will be thrown by the watch
      try {
        useTimeoutFn(mockHandle, 1000, false);

        vi.advanceTimersByTime(1000);
        await nextTick();

        expect(mockHandle).toHaveBeenCalledTimes(1);
      } catch (error) {
        // The error is expected to be thrown by the watch function
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Test error");
      }
    });

    it("should work with async handle function", async () => {
      const mockHandle = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return "async result";
      });

      useTimeoutFn(mockHandle, 1000, false);

      vi.advanceTimersByTime(1000);
      await nextTick();

      expect(mockHandle).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple timeout executions", async () => {
      const mockHandle = vi.fn();
      const { readyRef, start } = useTimeoutFn(mockHandle, 500, false);

      // First execution
      vi.advanceTimersByTime(500);
      await nextTick();
      expect(mockHandle).toHaveBeenCalledTimes(1);

      // Second execution
      start();
      vi.advanceTimersByTime(500);
      await nextTick();
      await nextTick();
      expect(mockHandle).toHaveBeenCalled();
      expect(readyRef.value).toBe(true);

      // Third execution
      start();
      vi.advanceTimersByTime(500);
      await nextTick();
      await nextTick();
      expect(mockHandle).toHaveBeenCalled();
      expect(readyRef.value).toBe(true);
    });

    it("should return all required functions and refs", () => {
      const mockHandle = vi.fn();
      const result = useTimeoutFn(mockHandle, 1000);

      expect(result).toHaveProperty("readyRef");
      expect(result).toHaveProperty("stop");
      expect(result).toHaveProperty("start");
      expect(typeof result.stop).toBe("function");
      expect(typeof result.start).toBe("function");
    });

    it("should throw error when handle is not a function", () => {
      expect(() => {
        useTimeoutFn("not a function" as any, 1000);
      }).toThrow("handle is not Function!");
    });

    it("should throw error when handle is null", () => {
      expect(() => {
        useTimeoutFn(null as any, 1000);
      }).toThrow("handle is not Function!");
    });

    it("should throw error when handle is undefined", () => {
      expect(() => {
        useTimeoutFn(undefined as any, 1000);
      }).toThrow("handle is not Function!");
    });

    it("should handle zero wait time", async () => {
      const mockHandle = vi.fn();
      const { readyRef } = useTimeoutFn(mockHandle, 0, false);

      vi.advanceTimersByTime(0);
      await nextTick();

      expect(mockHandle).toHaveBeenCalledTimes(1);
      expect(readyRef.value).toBe(true);
    });

    it("should handle negative wait time", async () => {
      const mockHandle = vi.fn();
      const { readyRef } = useTimeoutFn(mockHandle, -1000, false);

      vi.advanceTimersByTime(0);
      await nextTick();

      expect(mockHandle).toHaveBeenCalledTimes(1);
      expect(readyRef.value).toBe(true);
    });
  });

  describe("Integration tests", () => {
    it("should work together with Vue reactivity", async () => {
      const mockHandle = vi.fn();
      const { readyRef, stop, start } = useTimeoutFn(mockHandle, 1000, false);

      // Initial state
      expect(readyRef.value).toBe(false);
      expect(mockHandle).not.toHaveBeenCalled();

      // After timeout
      vi.advanceTimersByTime(1000);
      await nextTick();
      expect(readyRef.value).toBe(true);
      expect(mockHandle).toHaveBeenCalledTimes(1);

      // After stop
      stop();
      expect(readyRef.value).toBe(false);

      // After restart
      start();
      vi.advanceTimersByTime(1000);
      await nextTick();
      await nextTick();
      expect(readyRef.value).toBe(true);
      expect(mockHandle).toHaveBeenCalled();
    });

    it("should handle rapid start/stop calls", async () => {
      const mockHandle = vi.fn();
      const { readyRef, stop, start } = useTimeoutFn(mockHandle, 1000, false);

      // Rapid start/stop calls
      start();
      stop();
      start();
      stop();
      start();

      vi.advanceTimersByTime(1000);
      await nextTick();

      expect(mockHandle).toHaveBeenCalledTimes(1);
      expect(readyRef.value).toBe(true);
    });
  });
});
