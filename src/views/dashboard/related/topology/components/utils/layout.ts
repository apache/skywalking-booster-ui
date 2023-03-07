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

  links.forEach((l: any) => {
    if (l.bundle.links === undefined) {
      l.bundle.links = [];
    }
    l.bundle.links.push(l);
  });

  // layout
  const padding = 8;
  const node_height = 22;
  const node_width = 70;
  const bundle_width = 14;
  const level_y_padding = 16;
  const metro_d = 4;
  const min_family_height = 22;

  options.c ||= 16;
  const c = options.c;
  options.bigc ||= node_width + c;

  nodes.forEach((n: any) => (n.height = (Math.max(1, n.bundles.length) - 1) * metro_d));

  let x_offset = padding;
  let y_offset = padding;
  levels.forEach((l: any) => {
    x_offset += l.bundles.length * bundle_width;
    y_offset += level_y_padding;
    l.forEach((n: any) => {
      n.x = n.level * node_width + x_offset;
      n.y = node_height + y_offset + n.height / 2;

      y_offset += node_height + n.height;
    });
  });

  let i = 0;
  levels.forEach((l: any) => {
    l.bundles.forEach((b: any) => {
      b.x =
        (b.parents && d3.max(b.parents, (d: any) => d.x)) ||
        0 + node_width + (l.bundles.length - 1 - b.i) * bundle_width;
      b.y = i * node_height;
    });
    i += l.length;
  });

  links.forEach((l: any) => {
    l.xt = l.target.x;
    l.yt =
      l.target.y +
      l.target.bundles_index[l.bundle.id].i * metro_d -
      (l.target.bundles.length * metro_d) / 2 +
      metro_d / 2;
    l.xb = l.bundle.x;
    l.yb = l.bundle.y;
    l.xs = l.source.x;
    l.ys = l.source.y;
  });

  // compress vertical space
  let y_negative_offset = 0;
  levels.forEach((l: any) => {
    y_negative_offset +=
      (-min_family_height + l.bundles &&
        d3.min(l.bundles, (b: any) => b.links && d3.min(b.links, (link: any) => link.ys - 2 * c - (link.yt + c)))) ||
      0;
    l.forEach((n: any) => (n.y -= y_negative_offset));
  });

  // very ugly, I know
  links.forEach((l: any) => {
    l.yt =
      l.target.y +
      l.target.bundles_index[l.bundle.id].i * metro_d -
      (l.target.bundles.length * metro_d) / 2 +
      metro_d / 2;
    l.ys = l.source.y;
    l.c1 = l.source.level - l.target.level > 1 ? Math.min(options.bigc, l.xb - l.xt, l.yb - l.yt) - c : c;
    l.c2 = c;
  });

  const layout = {
    width: d3.max(nodes, (n: any) => n.x) || 0 + node_width + 2 * padding,
    height: d3.max(nodes, (n: any) => n.y) || 0 + node_height / 2 + 2 * padding,
    node_height,
    node_width,
    bundle_width,
    level_y_padding,
    metro_d,
  };
  console.log({ levels, nodes, nodes_index, links, bundles, layout });
  return { levels, nodes, nodes_index, links, bundles, layout };
}
