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
const requireComponent = require.context("./tool", false, /\.png$/);
const icons: { [key: string]: string } = {};

function capitalizeFirstLetter(str: string) {
  return str.toUpperCase();
}
function validateFileName(str: string): string | undefined {
  if (/^\S+\.png$/.test(str)) {
    return str.replace(/^\S+\/(\w+)\.png$/, (rs, $1) =>
      capitalizeFirstLetter($1)
    );
  }
}
requireComponent.keys().forEach((filePath: string) => {
  const componentConfig = requireComponent(filePath);
  const fileName = validateFileName(filePath);
  if (fileName) {
    icons[fileName] = componentConfig;
  }
});

const Hexagon = (side: number, r: number, cx: number, cy: number) => {
  let path = "";
  for (let i = 0; i < side; i += 1) {
    const x = Math.cos(((2 / side) * i + 1 / side) * Math.PI) * r + cx;
    const y = -Math.sin(((2 / side) * i + 1 / side) * Math.PI) * r + cy;
    path += !i ? `M${x},${y} ` : `L${x},${y} `;
    if (i == side - 1) path += "Z";
  }
  return path;
};

export default (graph: any, data: any) => {
  const tool = graph.append("g").attr("class", "topo-tool");
  const side = 6;
  for (let i = 0; i < data.length; i += 1) {
    const x = Math.cos((2 / side) * i * Math.PI) * 34;
    const y = -Math.sin((2 / side) * i * Math.PI) * 34;
    const tool_g = tool
      .append("g")
      .attr("class", "topo-tool-i")
      .on("click", data[i].click);
    tool_g
      .append("path")
      .attr("class", "tool-hexagon")
      .attr("d", Hexagon(6, 17, x, y));
    tool_g
      .append("svg:image")
      .attr("width", 14)
      .attr("height", 14)
      .attr("x", x - 7)
      .attr("y", y - 7)
      .attr("style", "opacity: 0.8")
      .attr("xlink:href", icons[data[i].icon]);
  }
  return tool;
};
