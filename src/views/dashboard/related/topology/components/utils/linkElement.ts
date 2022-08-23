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

export const linkElement = (graph: any) => {
  const linkEnter = graph
    .append("path")
    .attr("class", "topo-line")
    .attr("marker-end", "url(#arrow)")
    .attr("stroke", "#217EF25f");
  return linkEnter;
};
export const anchorElement = (graph: any, funcs: any, tip: any) => {
  const linkEnter = graph
    .append("circle")
    .attr("class", "topo-line-anchor")
    .attr("r", 5)
    .attr("fill", "#217EF25f")
    .on("mouseover", function (event: unknown, d: unknown) {
      tip.html(funcs.tipHtml).show(d, this);
    })
    .on("mouseout", function () {
      tip.hide(this);
    })
    .on("click", (event: unknown, d: unknown) => {
      funcs.handleLinkClick(event, d);
    });
  return linkEnter;
};
export const arrowMarker = (graph: any) => {
  const defs = graph.append("defs");
  const arrow = defs
    .append("marker")
    .attr("id", "arrow")
    .attr("class", "topo-line-arrow")
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", "6")
    .attr("markerHeight", "6")
    .attr("viewBox", "0 0 12 12")
    .attr("refX", "5")
    .attr("refY", "6")
    .attr("orient", "auto");
  const arrowPath = "M2,2 L10,6 L2,10 L6,6 L2,2";

  arrow.append("path").attr("d", arrowPath).attr("fill", "#217EF25f");
  return arrow;
};
