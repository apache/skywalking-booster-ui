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
import icons from "@/assets/img/icons";
import { Node } from "@/types/topology";

export default (d3: any, graph: any, funcs: any, tip: any) => {
  const nodeEnter = graph
    .append("g")
    .call(
      d3
        .drag()
        .on("start", funcs.dragstart)
        .on("drag", funcs.dragged)
        .on("end", funcs.dragended)
    )
    .on("mouseover", function (event: unknown, d: Node) {
      tip.html(funcs.tipHtml).show(d, this);
    })
    .on("mouseout", function () {
      tip.hide(this);
    });
  nodeEnter
    .append("image")
    .attr("width", 35)
    .attr("height", 35)
    .attr("x", (d: any) => d.x - 15)
    .attr("y", (d: any) => d.y - 15)
    .attr("style", "cursor: move;")
    .attr("xlink:href", icons.CUBE);
  nodeEnter
    .append("text")
    .attr("fill", "#000")
    .attr("text-anchor", "middle")
    .attr("x", (d: any) => d.x)
    .attr("y", (d: any) => d.y + 28)
    .text((d: { name: string }) =>
      d.name.length > 10 ? `${d.name.substring(0, 10)}...` : d.name
    );
  return nodeEnter;
};
