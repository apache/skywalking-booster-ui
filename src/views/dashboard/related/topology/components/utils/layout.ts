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
export function constructTangleLayout(levels: any, options: any = {}) {
  // precompute level depth
  levels.forEach((l: any, i: any) => l.forEach((n: any) => (n.level = i)));

  const nodes = levels.reduce((a: any, x: any) => a.concat(x), []);
  const nodes_index: any = {};
  nodes.forEach((d: any) => (nodes_index[d.id] = d));

  // objectification
  nodes.forEach((d: any) => {
    d.parents = (d.parents === undefined ? [] : d.parents).map((p: any) => nodes_index[p]);
  });

  // precompute bundles
  levels.forEach((l: any, i: any) => {
    const index: any = {};
    l.forEach((n: any) => {
      if (n.parents.length == 0) {
        return;
      }

      const id = n.parents
        .map((d: any) => d.id)
        .sort()
        .join("-X-");
      if (id in index) {
        index[id].parents = index[id].parents.concat(n.parents);
      } else {
        index[id] = {
          id: id,
          parents: n.parents.slice(),
          level: i,
          span: i - n.parents && d3.min(n.parents, (p: any) => p.level),
        };
      }
      n.bundle = index[id];
    });
    l.bundles = Object.keys(index).map((k) => index[k]);
    l.bundles.forEach((b: any, i: any) => (b.i = i));
  });

  const links: any = [];
  nodes.forEach((d: any) => {
    d.parents.forEach((p: any) => links.push({ source: d, bundle: d.bundle, target: p }));
  });

  const bundles = levels.reduce((a: any, x: any) => a.concat(x.bundles), []);

  // reverse pointer from parent to bundles
  bundles.forEach((b: any) =>
    b.parents.forEach((p: any) => {
      if (p.bundles_index === undefined) {
        p.bundles_index = {};
      }
      if (!(b.id in p.bundles_index)) {
        p.bundles_index[b.id] = [];
      }
      p.bundles_index[b.id].push(b);
    }),
  );

  nodes.forEach((n: any) => {
    if (n.bundles_index !== undefined) {
      n.bundles = Object.keys(n.bundles_index).map((k) => n.bundles_index[k]);
    } else {
      n.bundles_index = {};
      n.bundles = [];
    }
    n.bundles.sort((a: any, b: any) =>
      d3.descending(
        d3.max(a, (d: any) => d.span),
        d3.max(b, (d: any) => d.span),
      ),
    );
    n.bundles.forEach((b: any, i: any) => (b.i = i));
  });

  // layout
  const padding = 30;
  const node_height = 120;
  const node_width = 100;
  const bundle_width = 14;
  const metro_d = 4;

  options.c ||= 16;
  const c = options.c;
  options.bigc ||= node_width + c;

  nodes.forEach((n: any) => (n.height = (Math.max(1, n.bundles.length) - 1) * metro_d));

  let x_offset = padding;
  let y_offset = 0;
  levels.forEach((l: any) => {
    y_offset = 0;
    x_offset += 5 * bundle_width;
    l.forEach((n: any) => {
      n.x = n.level * node_width + x_offset;
      n.y = node_height + y_offset + n.height / 2;
      y_offset += node_height + n.height;
    });
  });

  const layout = {
    width: d3.max(nodes, (n: any) => n.x) || 0 + node_width + 2 * padding,
    height: d3.max(nodes, (n: any) => n.y) || 0 + node_height / 2 + 2 * padding,
  };

  return { nodes, bundles, layout };
}
