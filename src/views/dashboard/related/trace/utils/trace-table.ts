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

import type { Span, TraceTreeRef } from "@/types/trace";

export default class TraceUtil {
  public static buildTraceDataList(data: Span[]): string[] {
    return Array.from(new Set(data.map((span: Span) => span.serviceCode)));
  }

  public static changeStatisticsTree(data: Span[]): Map<string, Span[]> {
    const result = new Map<string, Span[]>();
    const traceTreeRef = this.changeTreeCore(data);
    traceTreeRef.segmentMap.forEach((span) => {
      const groupRef = span.endpointName + ":" + span.type;
      if (span.children && span.children.length > 0) {
        this.calculationChildren(span.children, result);
        this.collapse(span);
      }
      if (result.get(groupRef) === undefined) {
        result.set(groupRef, []);
        result.get(groupRef)!.push(span);
      } else {
        result.get(groupRef)!.push(span);
      }
    });
    return result;
  }

  private static changeTreeCore(data: Span[]): TraceTreeRef {
    // set a breakpoint at this line
    if (data.length === 0) {
      return {
        segmentMap: new Map(),
        segmentIdGroup: [],
      };
    }
    const segmentGroup: Recordable = {};
    const segmentMap: Map<string, Span> = new Map();
    const segmentIdGroup: string[] = [];
    const fixSpans: Span[] = [];
    const segmentHeaders: Span[] = [];
    data.forEach((span) => {
      if (span.parentSpanId === -1) {
        segmentHeaders.push(span);
      } else {
        const index = data.findIndex((patchSpan: Span) => {
          return patchSpan.segmentId === span.segmentId && patchSpan.spanId === span.spanId - 1;
        });
        const content = fixSpans.find(
          (i: Span) =>
            i.traceId === span.traceId &&
            i.segmentId === span.segmentId &&
            i.spanId === span.spanId - 1 &&
            i.parentSpanId === span.spanId - 2,
        );
        if (index === -1 && !content) {
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
          });
        }
      }
    });
    segmentHeaders.forEach((span) => {
      if (span.refs && span.refs.length) {
        span.refs.forEach((ref) => {
          const index = data.findIndex((patchSpan: Span) => {
            return ref.parentSegmentId === patchSpan.segmentId && ref.parentSpanId === patchSpan.spanId;
          });
          if (index === -1) {
            // create a known broken node.
            const parentSpanId = ref.parentSpanId > -1 ? 0 : -1;
            const item = fixSpans.find(
              (i: Span) =>
                i.traceId === ref.traceId &&
                i.segmentId === ref.parentSegmentId &&
                i.spanId === ref.parentSpanId &&
                i.parentSpanId === parentSpanId,
            );
            if (!item) {
              fixSpans.push({
                traceId: ref.traceId,
                segmentId: ref.parentSegmentId,
                spanId: ref.parentSpanId,
                parentSpanId: parentSpanId,
                refs: [],
                endpointName: `VNode: ${ref.parentSegmentId}`,
                serviceCode: "VirtualNode",
                type: `[Broken] ${ref.type}`,
                peer: "",
                component: `VirtualNode: #${parentSpanId}`,
                isError: true,
                isBroken: true,
                layer: "Broken",
                tags: [],
                logs: [],
                startTime: 0,
                endTime: 0,
              });
            }
            // if root broken node is not exist, create a root broken node.
            if (parentSpanId > -1) {
              const item = fixSpans.find(
                (i: Span) =>
                  i.traceId === ref.traceId &&
                  i.segmentId === ref.parentSegmentId &&
                  i.spanId === 0 &&
                  i.parentSpanId === -1,
              );
              if (!item) {
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
                });
              }
            }
          }
        });
      }
    });
    [...fixSpans, ...data].forEach((fixSpan: Span) => {
      fixSpan.label = fixSpan.endpointName || "no operation name";
      fixSpan.children = [];
      const id = fixSpan.segmentId || "top";
      if (segmentGroup[id] === undefined) {
        segmentIdGroup.push(id);
        segmentGroup[id] = [];
        segmentGroup[id].push(fixSpan);
      } else {
        segmentGroup[id].push(fixSpan);
      }
    });

    segmentIdGroup.forEach((segmentId: string) => {
      const currentSegmentSet = segmentGroup[segmentId].sort((a: Span, b: Span) => b.parentSpanId - a.parentSpanId);
      currentSegmentSet.forEach((curSegment: Span) => {
        const index = currentSegmentSet.findIndex(
          (curSegment2: Span) => curSegment2.spanId === curSegment.parentSpanId,
        );
        if (index !== -1) {
          if (
            (currentSegmentSet[index].isBroken && currentSegmentSet[index].parentSpanId === -1) ||
            !currentSegmentSet[index].isBroken
          ) {
            currentSegmentSet[index].children.push(curSegment);
            currentSegmentSet[index].children.sort((a: Span, b: Span) => a.spanId - b.spanId);
          }
        }
        if (curSegment.isBroken) {
          const children = data.filter((span: Span) =>
            span.refs.find(
              (d) =>
                d.traceId === curSegment.traceId &&
                d.parentSegmentId === curSegment.segmentId &&
                d.parentSpanId === curSegment.spanId,
            ),
          );
          if (children.length) {
            curSegment.children = curSegment.children || [];
            curSegment.children.push(...children);
          }
        }
      });
      segmentMap.set(segmentId, currentSegmentSet[currentSegmentSet.length - 1]);
    });

    return {
      segmentMap,
      segmentIdGroup,
    };
  }

  private static collapse(span: Span) {
    if (span.children) {
      let dur = span.endTime - span.startTime;
      span.children.forEach((child: Span) => {
        dur -= child.endTime - child.startTime;
      });
      span.dur = dur < 0 ? 0 : dur;
      span.children.forEach((child) => this.collapse(child));
    }
  }

  private static calculationChildren(nodes: Span[], result: Map<string, Span[]>): void {
    nodes.forEach((node: Span) => {
      const groupRef = node.endpointName + ":" + node.type;
      if (node.children && node.children.length > 0) {
        this.calculationChildren(node.children, result);
      }
      if (result.get(groupRef) === undefined) {
        result.set(groupRef, []);
        result.get(groupRef)!.push(node);
      } else {
        result.get(groupRef)!.push(node);
      }
    });
  }
}
