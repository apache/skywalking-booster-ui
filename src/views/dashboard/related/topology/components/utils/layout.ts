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

export function layout(levels: Node[][], calls: Call[], radius: number) {
  // precompute level depth
  levels.forEach((l: Node[], i: number) => l.forEach((n: any) => n && (n.level = i)));

  const nodes: Node[] = levels.reduce((a, x) => a.concat(x), []);
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
  const layout = {
    width: d3.max(nodes as any, (n: { x: number }) => n.x) || 0 + node_width + 2 * padding,
    height: d3.max(nodes as any, (n: { y: number }) => n.y) || 0 + node_height / 2 + 2 * padding,
  };

  return { nodes, layout, calls: computeCallPos(calls, radius) };
}

export function computeCallPos(calls: Call[], radius: number) {
  for (const [index, call] of calls.entries()) {
    const centrePoints = [call.sourceObj.x, call.sourceObj.y, call.targetObj.x, call.targetObj.y];
    for (const [idx, link] of calls.entries()) {
      if (
        index < idx &&
        call.id !== link.id &&
        call.sourceObj.x === link.targetObj.x &&
        call.sourceObj.y === link.targetObj.y &&
        call.targetObj.x === link.sourceObj.x &&
        call.targetObj.y === link.sourceObj.y
      ) {
        if (call.targetObj.y === call.sourceObj.y) {
          centrePoints[1] = centrePoints[1] - 8;
          centrePoints[3] = centrePoints[3] - 8;
        } else if (call.targetObj.x === call.sourceObj.x) {
          centrePoints[0] = centrePoints[0] - 8;
          centrePoints[2] = centrePoints[2] - 8;
        } else {
          centrePoints[1] = centrePoints[1] + 6;
          centrePoints[3] = centrePoints[3] + 6;
          centrePoints[0] = centrePoints[0] - 6;
          centrePoints[2] = centrePoints[2] - 6;
        }
      }
    }
    const pos: { x: number; y: number }[] = circleIntersection(
      centrePoints[0],
      centrePoints[1],
      radius,
      centrePoints[2],
      centrePoints[3],
      radius,
    );
    call.sourceX = pos[0].x;
    call.sourceY = pos[0].y;
    call.targetX = pos[1].x;
    call.targetY = pos[1].y;
  }
  return calls;
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
function findMostFrequent(arr: Call[]) {
  const count: any = {};
  let maxCount = 0;
  let maxItem = null;

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    count[item.sourceObj.id] = (count[item.sourceObj.id] || 0) + 1;
    if (count[item.sourceObj.id] > maxCount) {
      maxCount = count[item.sourceObj.id];
      maxItem = item.sourceObj;
    }
    count[item.targetObj.id] = (count[item.targetObj.id] || 0) + 1;
    if (count[item.targetObj.id] > maxCount) {
      maxCount = count[item.targetObj.id];
      maxItem = item.targetObj;
    }
  }

  return maxItem;
}
export function computeLevels(calls: Call[], nodeList: Node[], levels: any[]) {
  const node = findMostFrequent(calls);
  const nodes = JSON.parse(JSON.stringify(nodeList)).sort((a: Node, b: Node) => {
    if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    }
    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    }
    return 0;
  });
  const index = nodes.findIndex((n: Node) => n.type === "USER");
  let key = index;
  if (index < 0) {
    key = nodes.findIndex((n: Node) => n.id === node.id);
  }
  levels.push([nodes[key]]);
  nodes.splice(key, 1);
  for (const level of levels) {
    const a = [];
    for (const l of level) {
      for (const n of calls) {
        if (n.target === l.id) {
          const i = nodes.findIndex((d: Node) => d.id === n.source);
          if (i > -1) {
            a.push(nodes[i]);
            nodes.splice(i, 1);
          }
        }
        if (n.source === l.id) {
          const i = nodes.findIndex((d: Node) => d.id === n.target);
          if (i > -1) {
            a.push(nodes[i]);
            nodes.splice(i, 1);
          }
        }
      }
    }
    if (a.length) {
      levels.push(a);
    }
  }
  if (nodes.length) {
    const ids = nodes.map((d: Node) => d.id);
    const links = calls.filter((item: Call) => ids.includes(item.source) || ids.includes(item.target));
    const list = computeLevels(links, nodes, []);
    levels = list.map((subArrayA, index) => subArrayA.concat(levels[index]));
  }
  return levels;
}
export function changeNode(d: { x: number; y: number }, currentNode: Nullable<Node>, layout: any, radius: number) {
  if (!currentNode) {
    return;
  }
  for (const node of layout.nodes) {
    if (node.id === currentNode.id) {
      node.x = d.x;
      node.y = d.y;
    }
  }
  for (const call of layout.calls) {
    if (call.sourceObj.id === currentNode.id) {
      call.sourceObj.x = d.x;
      call.sourceObj.y = d.y;
    }
    if (call.targetObj.id === currentNode.id) {
      call.targetObj.x = d.x;
      call.targetObj.y = d.y;
    }
    if (call.targetObj.id === currentNode.id || call.sourceObj.id === currentNode.id) {
      const pos: any = circleIntersection(
        call.sourceObj.x,
        call.sourceObj.y,
        radius,
        call.targetObj.x,
        call.targetObj.y,
        radius,
      );
      call.sourceX = pos[0].x;
      call.sourceY = pos[0].y;
      call.targetX = pos[1].x;
      call.targetY = pos[1].y;
    }
  }
  return computeCallPos(layout.calls, radius);
}
export function hierarchy(levels: Node[][], calls: Call[], radius: number) {
  // precompute level depth
  levels.forEach((l: Node[], i: number) => l.forEach((n: any) => n && (n.level = i)));

  const nodes: Node[] = levels.reduce((a, x) => a.concat(x), []);
  // layout
  const padding = 30;
  const node_height = 100;
  const node_width = 180;
  const bundle_width = 10;
  const metro_d = 4;
  for (const n of nodes) {
    n.width = 5 * metro_d;
  }

  let y_offset = padding;
  let x_offset = 0;
  for (const level of levels) {
    x_offset = 0;
    y_offset += 3 * bundle_width;
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
      n.x = node_width + x_offset + n.width / 2;
      n.y = n.level * node_height + y_offset;
      x_offset += node_width + n.width;
    }
  }
  const layout = {
    width: d3.max(nodes as any, (n: { x: number }) => n.x) || 0 + node_width + 2 * padding,
    height: d3.max(nodes as any, (n: { y: number }) => n.y) || 0 + node_height / 2 + 2 * padding,
  };

  return { nodes, layout, calls: computeCallPos(calls, radius) };
}
export function computeHierarchyLevels(nodes: Node[]) {
  const levelsNum: number[] = nodes.map((d: Node) => d.l || 0);
  const list = [...new Set(levelsNum)];
  const sortedArr = list.sort((a, b) => b - a);
  const nodesList = [];

  for (const min of sortedArr) {
    const arr = nodes.filter((d) => d.l === min);
    nodesList.push(arr);
  }

  return nodesList;
}
