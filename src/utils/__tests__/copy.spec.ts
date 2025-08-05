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
import copy from "../copy";
import { ElNotification } from "element-plus";

// Mock Element Plus
vi.mock("element-plus", () => ({
  ElNotification: vi.fn(),
}));

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn(),
};

describe("copy utility function", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock navigator.clipboard
    Object.defineProperty(navigator, "clipboard", {
      value: mockClipboard,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should copy text successfully and show success notification", async () => {
    const testText = "test text to copy";
    mockClipboard.writeText.mockResolvedValue(undefined);

    copy(testText);

    // Wait for promise to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockClipboard.writeText).toHaveBeenCalledWith(testText);
    expect(ElNotification).toHaveBeenCalledWith({
      title: "Success",
      message: "Copied",
      type: "success",
    });
  });

  it("should handle clipboard error and show error notification", async () => {
    const testText = "test text to copy";
    const errorMessage = "Clipboard permission denied";
    mockClipboard.writeText.mockRejectedValue(errorMessage);

    copy(testText);

    // Wait for promise to reject
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockClipboard.writeText).toHaveBeenCalledWith(testText);
    expect(ElNotification).toHaveBeenCalledWith({
      title: "Error",
      message: errorMessage,
      type: "warning",
    });
  });

  it("should handle empty string", async () => {
    const testText = "";
    mockClipboard.writeText.mockResolvedValue(undefined);

    copy(testText);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockClipboard.writeText).toHaveBeenCalledWith("");
    expect(ElNotification).toHaveBeenCalledWith({
      title: "Success",
      message: "Copied",
      type: "success",
    });
  });

  it("should handle long text", async () => {
    const testText = "a".repeat(1000);
    mockClipboard.writeText.mockResolvedValue(undefined);

    copy(testText);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockClipboard.writeText).toHaveBeenCalledWith(testText);
    expect(ElNotification).toHaveBeenCalledWith({
      title: "Success",
      message: "Copied",
      type: "success",
    });
  });

  it("should handle special characters", async () => {
    const testText = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    mockClipboard.writeText.mockResolvedValue(undefined);

    copy(testText);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockClipboard.writeText).toHaveBeenCalledWith(testText);
    expect(ElNotification).toHaveBeenCalledWith({
      title: "Success",
      message: "Copied",
      type: "success",
    });
  });

  it("should handle unicode characters", async () => {
    const testText = "🚀🌟🎉中文测试";
    mockClipboard.writeText.mockResolvedValue(undefined);

    copy(testText);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockClipboard.writeText).toHaveBeenCalledWith(testText);
    expect(ElNotification).toHaveBeenCalledWith({
      title: "Success",
      message: "Copied",
      type: "success",
    });
  });

  it("should handle multiple rapid calls", async () => {
    const testText = "test text";
    mockClipboard.writeText.mockResolvedValue(undefined);

    copy(testText);
    copy(testText);
    copy(testText);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockClipboard.writeText).toHaveBeenCalledTimes(3);
    expect(ElNotification).toHaveBeenCalledTimes(3);
  });

  it("should handle clipboard not available", async () => {
    const testText = "test text";

    // Remove clipboard from navigator
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
    });

    // Should not throw error
    expect(() => {
      copy(testText);
    }).not.toThrow();
  });
});
