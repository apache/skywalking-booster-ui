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

import type { Span, Ref } from "@/types/trace";

/* global Indexable */

export interface BuildTreeResult {
  roots: Span[];
  fixSpansSize: number;
  refSpans: Ref[];
}

export function buildSegmentForest(data: Span[], traceId: string): BuildTreeResult {
  const refSpans: Ref[] = [];
  const segmentGroup: { [key: string]: any } = {};
  const segmentIdGroup: string[] = [];
  const fixSpans: Span[] = [];
  const segmentHeaders: Span[] = [];

  if (!data || data.length === 0) {
    return { roots: [], fixSpansSize: 0, refSpans };
  }

  for (const span of data) {
    if (span.refs && span.refs.length) {
      refSpans.push(...span.refs);
    }
    if (span.parentSpanId === -1) {
      segmentHeaders.push(span);
    } else {
      const item = data.find(
        (i: Span) => i.traceId === span.traceId && i.segmentId === span.segmentId && i.spanId === span.spanId - 1,
      );
      const content = fixSpans.find(
        (i: Span) =>
          i.traceId === span.traceId &&
          i.segmentId === span.segmentId &&
          i.spanId === span.spanId - 1 &&
          i.parentSpanId === span.spanId - 2,
      );
      if (!item && !content) {
        fixSpans.push({
          traceId: span.traceId,
          segmentId: span.segmentId,
          spanId: span.spanId - 1,
          parentSpanId: span.spanId - 2,
          refs: [],
          endpointName: `VNode: ${span.segmentId}`,
          serviceCode: "VirtualNode",
          type: `[Broken] ${span.type}`,
          peer: "",
          component: `VirtualNode: #${span.spanId - 1}`,
          isError: true,
          isBroken: true,
          layer: "Broken",
          tags: [],
          logs: [],
          startTime: 0,
          endTime: 0,
        } as Span);
      }
    }
  }

  for (const span of segmentHeaders) {
    if (span.refs && span.refs.length) {
      let exit: Span | null = null;
      for (const ref of span.refs) {
        const e = data.find(
          (i: Span) =>
            ref.traceId === i.traceId && ref.parentSegmentId === i.segmentId && ref.parentSpanId === i.spanId,
        );
        if (e) {
          exit = e;
        }
      }
      if (!exit) {
        const ref = span.refs[0];
        const parentSpanId = ref.parentSpanId > -1 ? 0 : -1;
        const content = fixSpans.find(
          (i: Span) =>
            i.traceId === ref.traceId &&
            i.segmentId === ref.parentSegmentId &&
            i.spanId === ref.parentSpanId &&
            i.parentSpanId === parentSpanId,
        );
        if (!content) {
          fixSpans.push({
            traceId: ref.traceId,
            segmentId: ref.parentSegmentId,
            spanId: ref.parentSpanId,
            parentSpanId,
            refs: [],
            endpointName: `VNode: ${ref.parentSegmentId}`,
            serviceCode: "VirtualNode",
            type: `[Broken] ${ref.type}`,
            peer: "",
            component: `VirtualNode: #${ref.parentSpanId}`,
            isError: true,
            isBroken: true,
            layer: "Broken",
            tags: [],
            logs: [],
            startTime: 0,
            endTime: 0,
          } as Span);
        }
        if (parentSpanId > -1) {
          const exists = fixSpans.find(
            (i: Span) =>
              i.traceId === ref.traceId &&
              i.segmentId === ref.parentSegmentId &&
              i.spanId === 0 &&
              i.parentSpanId === -1,
          );
          if (!exists) {
            fixSpans.push({
              traceId: ref.traceId,
              segmentId: ref.parentSegmentId,
              spanId: 0,
              parentSpanId: -1,
              refs: [],
              endpointName: `VNode: ${ref.parentSegmentId}`,
              serviceCode: "VirtualNode",
              type: `[Broken] ${ref.type}`,
              peer: "",
              component: `VirtualNode: #0`,
              isError: true,
              isBroken: true,
              layer: "Broken",
              tags: [],
              logs: [],
              startTime: 0,
              endTime: 0,
            } as Span);
          }
        }
      }
    }
  }

  for (const i of [...fixSpans, ...data]) {
    i.label = i.endpointName || "no operation name";
    i.key = Math.random().toString(36).substring(2, 36);
    i.children = [];
    if (segmentGroup[i.segmentId]) {
      segmentGroup[i.segmentId].push(i);
    } else {
      segmentIdGroup.push(i.segmentId);
      segmentGroup[i.segmentId] = [i];
    }
  }

  for (const id of segmentIdGroup) {
    const currentSegment = segmentGroup[id].sort((a: Span, b: Span) => b.parentSpanId - a.parentSpanId);
    for (const s of currentSegment) {
      const index = currentSegment.findIndex((i: Span) => i.spanId === s.parentSpanId);
      if (index > -1) {
        if (
          (currentSegment[index].isBroken && currentSegment[index].parentSpanId === -1) ||
          !currentSegment[index].isBroken
        ) {
          currentSegment[index].children?.push(s);
          currentSegment[index].children?.sort((a: Span, b: Span) => a.spanId - b.spanId);
        }
      }
      if (s.isBroken) {
        const children = data.filter(
          (span: Span) =>
            !!span.refs?.find(
              (d) => d.traceId === s.traceId && d.parentSegmentId === s.segmentId && d.parentSpanId === s.spanId,
            ),
        );
        if (children.length) {
          s.children?.push(...children);
        }
      }
    }
    segmentGroup[id] = currentSegment[currentSegment.length - 1];
  }

  for (const id of segmentIdGroup) {
    for (const ref of segmentGroup[id].refs || []) {
      if (ref.traceId === traceId) {
        traverseTree(segmentGroup[ref.parentSegmentId], ref.parentSpanId, ref.parentSegmentId, segmentGroup[id]);
      }
    }
  }

  const roots: Span[] = [];
  for (const i in segmentGroup) {
    let pushed = false;
    for (const ref of segmentGroup[i].refs || []) {
      if (!segmentGroup[ref.parentSegmentId]) {
        roots.push(segmentGroup[i]);
        pushed = true;
        break;
      }
    }
    if (
      !pushed &&
      (!segmentGroup[i].refs || segmentGroup[i].refs.length === 0) &&
      segmentGroup[i].parentSpanId === -1
    ) {
      roots.push(segmentGroup[i]);
    }
  }

  return { roots, fixSpansSize: fixSpans.length, refSpans };
}

export function collapseTree(d: Span, refSpans: Ref[]): void {
  if (d.children) {
    const item = refSpans.find((s: Ref) => s.parentSpanId === d.spanId && s.parentSegmentId === d.segmentId);
    let dur = d.endTime - d.startTime;
    for (const i of d.children) {
      dur -= i.endTime - i.startTime;
    }
    d.dur = dur < 0 ? 0 : dur;
    if (item) {
      d.children = d.children?.sort(compare("startTime"));
    }
    for (const i of d.children) {
      collapseTree(i, refSpans);
    }
  }
}

function traverseTree(node: Span, spanId: number, segmentId: string, data: Span) {
  if (!node || node.isBroken) {
    return;
  }
  if (node.spanId === spanId && node.segmentId === segmentId) {
    node.children?.push(data);
    return;
  }
  for (const nodeItem of (node as Span).children || []) {
    traverseTree(nodeItem, spanId, segmentId, data);
  }
}

function compare(p: string) {
  return (m: Span, n: Span) => {
    const a = (m as Indexable)[p];
    const b = (n as Indexable)[p];
    return a - b;
  };
}

export function getRefsAllNodes(tree: Indexable) {
  const nodes = [];
  const stack = [tree];

  while (stack.length > 0) {
    const node = stack.pop();
    nodes.push(node);

    if (node?.children && node.children.length > 0) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i]);
      }
    }
  }

  return nodes;
}
