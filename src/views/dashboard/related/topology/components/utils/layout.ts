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
import * as d3 from "d3";
import type { Node, Call } from "@/types/topology";

export function layout(levels: Node[][], calls: Call[]) {
  // precompute level depth
  levels.forEach((l: any, i: any) => l.forEach((n: any) => (n.level = i)));

  const nodes = levels.reduce((a: any, x: any) => a.concat(x), []);
  // layout
  const padding = 30;
  const node_height = 120;
  const node_width = 100;
  const bundle_width = 14;
  const metro_d = 4;
  for (const n of nodes) {
    n.height = 5 * metro_d;
  }

  let x_offset = padding;
  let y_offset = 0;
  for (const level of levels) {
    y_offset = 0;
    x_offset += 5 * bundle_width;
    for (const l of level) {
      const n: any = l;
      for (const call of calls) {
        if (call.source === n.id) {
          call.sourceObj = n;
        }
        if (call.target === n.id) {
          call.targetObj = n;
        }
      }
      n.x = n.level * node_width + x_offset;
      n.y = node_height + y_offset + n.height / 2;
      y_offset += node_height + n.height;
    }
  }
  for (const call of calls) {
    const sp = lineCircleIntersection(
      call.sourceObj.x,
      call.sourceObj.y,
      call.targetObj.x,
      call.targetObj.y,
      call.sourceObj.x,
      call.sourceObj.y,
      18,
    );
    const tp = lineCircleIntersection(
      call.sourceObj.x,
      call.sourceObj.y,
      call.targetObj.x,
      call.targetObj.y,
      call.targetObj.x,
      call.targetObj.y,
      18,
    );
    call.sourceObj.ax = sp[0];
    call.sourceObj.ay = sp[1];
    call.targetObj.ax = tp[0];
    call.targetObj.ay = tp[1];
  }
  const layout = {
    width: d3.max(nodes, (n: { x: number }) => n.x) || 0 + node_width + 2 * padding,
    height: d3.max(nodes, (n: { y: number }) => n.y) || 0 + node_height / 2 + 2 * padding,
  };

  return { nodes, layout, calls };
}

function lineCircleIntersection(x1: number, y1: number, x2: number, y2: number, cx: number, cy: number, r: number) {
  const k = (y2 - y1) / (x2 - x1);
  const b = y1 - k * x1;

  let x = 0;
  if (k == Infinity || k == -Infinity) {
    x = x1;
  } else {
    x =
      (b -
        cy +
        k * cx +
        Math.sqrt(
          Math.abs((cy - b - k * cx) * (cy - b - k * cx) - (1 + k * k) * (cx * cx - 2 * k * cx * cy + cy * cy - r * r)),
        )) /
      (1 + k * k);
  }

  const y = k * x + b;

  return [x, y];
}
