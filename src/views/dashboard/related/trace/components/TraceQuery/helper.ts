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
import type { Span } from "@/types/trace";

export interface FlattenedSpanRow {
  span: Span;
  depth: number;
  y: number;
}

/**
 * Build a tree structure from a list of spans.
 * - If spans already contain nested children, returns a duration-sorted copy.
 * - Otherwise, constructs the parent/child relationships using parentId and id.
 */
export function buildSpanTree(spans: Span[]): Span[] {
  if (!spans.length) return [];

  const hasNestedSpans = spans.some((span) => Array.isArray(span.children) && span.children.length > 0);
  if (hasNestedSpans) {
    const sorted = [...spans].sort((a, b) => (b.duration || 0) - (a.duration || 0));
    return sorted;
  }

  const spanMap = new Map<string, Span>();
  for (const span of spans) {
    spanMap.set(span.id, span);
  }

  const rootSpans: Span[] = [];
  const processedSpans = new Set<string>();

  for (const span of spans) {
    if (!span.parentId || !spanMap.has(span.parentId)) {
      rootSpans.push(span);
      processedSpans.add(span.id);
    }
  }

  const buildTree = (parentSpan: Span): Span => {
    const children = spans.filter((s) => s.parentId === parentSpan.id && !processedSpans.has(s.id));

    for (const child of children) {
      processedSpans.add(child.id);
    }

    children.sort((a, b) => (b.duration || 0) - (a.duration || 0));

    const treeChildren = children.map((child) => buildTree(child));

    return {
      ...parentSpan,
      children: treeChildren,
    };
  };

  const treeRoots = rootSpans.map((root) => buildTree(root));
  treeRoots.sort((a, b) => (b.duration || 0) - (a.duration || 0));
  return treeRoots;
}

/** Count all nodes in a span tree. */
export function countTreeNodes(spans: Span[]): number {
  let count = 0;
  const visit = (list: Span[]) => {
    count += list.length;
    for (const span of list) {
      if (span.children && span.children.length > 0) {
        visit(span.children);
      }
    }
  };
  visit(spans);
  return count;
}

/**
 * Flatten a span tree into rows for rendering.
 * Returns rows with computed y offset according to the given rowHeight.
 */
export function flattenTree(spans: Span[], rowHeight: number): FlattenedSpanRow[] {
  const rows: FlattenedSpanRow[] = [];
  let currentY = 0;

  const visit = (list: Span[], depth: number) => {
    for (const span of list) {
      rows.push({ span, depth, y: currentY });
      currentY += rowHeight;
      if (span.children && span.children.length > 0) {
        visit(span.children, depth + 1);
      }
    }
  };

  visit(spans, 0);
  return rows;
}
