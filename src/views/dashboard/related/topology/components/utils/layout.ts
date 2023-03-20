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
    const pos: any = circleIntersection(call.sourceObj.x, call.sourceObj.y, 18, call.targetObj.x, call.targetObj.y, 18);
    // call.sourceObj.ax = pos[0].x;
    // call.sourceObj.ay = pos[0].y;
    // call.targetObj.ax = pos[1].x;
    // call.targetObj.ay = pos[1].y;
  }
  const layout = {
    width: d3.max(nodes, (n: { x: number }) => n.x) || 0 + node_width + 2 * padding,
    height: d3.max(nodes, (n: { y: number }) => n.y) || 0 + node_height / 2 + 2 * padding,
  };

  return { nodes, layout, calls };
}

function circleIntersection(ax: number, ay: number, ar: number, bx: number, by: number, br: number) {
  const distance = Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));
  const dx = (bx - ax) / distance;
  const dy = (by - ay) / distance;
  const t = dx * (bx - ax) + dy * (by - ay);
  const ex = t * dx + ax;
  const ey = t * dy + ay;
  const d1 = Math.sqrt(Math.pow(ex - ax, 2) + Math.pow(ey - ay, 2));
  const d2 = Math.sqrt(Math.pow(ex - bx, 2) + Math.pow(ey - by, 2));
  if (d1 > ar || d2 > br) {
    return null;
  }

  const dt = Math.sqrt(Math.pow(ar, 2) - Math.pow(d1, 2));
  const fx = ex + (dt * (by - ay)) / distance;
  const fy = ey - (dt * (bx - ax)) / distance;
  const gx = ex - (dt * (by - ay)) / distance;
  const gy = ey + (dt * (bx - ax)) / distance;

  return [
    { x: fx, y: fy },
    { x: gx, y: gy },
  ];
}
