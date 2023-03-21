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

export function layout(levels: Node[][], calls: any[]) {
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
    call.sourceX = pos[0].x;
    call.sourceY = pos[0].y;
    call.targetX = pos[1].x;
    call.targetY = pos[1].y;
  }
  // for (const call of calls) {
  //   for (const link of calls) {
  //     if (
  //       (call.id !== link.id && call.sourceX === link.targetX && call.sourceY === link.targetY) ||
  //       (call.id !== link.id && call.targetX === link.sourceX && call.targetY === link.sourceY)
  //     ) {
  //       call.sourceX += 10;
  //       link.targetX -= 10;
  //       call.sourceY += 10;
  //       link.targetY -= 10;
  //     }
  //   }
  // }
  const layout = {
    width: d3.max(nodes, (n: { x: number }) => n.x) || 0 + node_width + 2 * padding,
    height: d3.max(nodes, (n: { y: number }) => n.y) || 0 + node_height / 2 + 2 * padding,
  };

  return { nodes, layout, calls };
}

export function circleIntersection(ax: number, ay: number, ar: number, bx: number, by: number, br: number) {
  const dab = Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));

  const dfx = (ar * Math.abs(ax - bx)) / dab;
  const dfy = (ar * Math.abs(ay - by)) / dab;
  const fx = bx > ax ? ax + dfx : ax - dfx;
  const fy = ay > by ? ay - dfy : ay + dfy;

  const dgx = (br * Math.abs(ax - bx)) / dab;
  const dgy = (br * Math.abs(ay - by)) / dab;
  const gx = bx > ax ? bx - dgx : bx + dgx;
  const gy = ay > by ? by + dgy : by - dgy;

  return [
    { x: fx, y: fy },
    { x: gx, y: gy },
  ];
}
