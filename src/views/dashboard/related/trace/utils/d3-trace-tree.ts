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
import d3tip from "d3-tip";
import { Trace, Span } from "@/types/trace";

export default class TraceMap {
  private i = 0;
  private el: Nullable<HTMLDivElement> = null;
  private handleSelectSpan: Nullable<(i: Trace) => void> = null;
  private topSlow: any = [];
  private height = 0;
  private width = 0;
  private topChild: any[] = [];
  private body: any = null;
  private tip: any = null;
  private svg: any = null;
  private treemap: any = null;
  private data: any = null;
  private row: any = null;
  private min = 0;
  private max = 0;
  private list: string[] = [];
  private xScale: any = null;
  private sequentialScale: any = null;
  private root: any = null;
  private topSlowMax: number[] = [];
  private topSlowMin: number[] = [];
  private topChildMax: number[] = [];
  private topChildMin: number[] = [];
  private nodeUpdate: any = null;

  constructor(el: HTMLDivElement, handleSelectSpan: (i: Trace) => void) {
    this.el = el;
    this.handleSelectSpan = handleSelectSpan;
    this.i = 0;
    this.topSlow = [];
    this.topChild = [];
    this.width = el.clientWidth - 20;
    this.height = el.clientHeight - 30;
    this.body = d3
      .select(this.el)
      .append("svg")
      .attr("class", "d3-trace-tree")
      .attr("width", this.width > 0 ? this.width : 10)
      .attr("height", this.height > 0 ? this.height : 10);
    this.tip = (d3tip as any)()
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(
        (d: any) => `
      <div class="mb-5">${d.data.label}</div>
      ${
        d.data.dur
          ? '<div class="sm">SelfDuration: ' + d.data.dur + "ms</div>"
          : ""
      }
      ${
        d.data.endTime - d.data.startTime
          ? '<div class="sm">TotalDuration: ' +
            (d.data.endTime - d.data.startTime) +
            "ms</div>"
          : ""
      }
      `
      );
    this.svg = this.body
      .append("g")
      .attr("transform", () => `translate(120, 0)`);
    this.svg.call(this.tip);
  }
  resize() {
    if (!this.el) {
      return;
    }
    this.width = this.el.clientWidth;
    this.height = this.el.clientHeight + 100;
    this.body.attr("width", this.width).attr("height", this.height);
    this.body.select("g").attr("transform", () => `translate(160, 0)`);
    const transform = d3.zoomTransform(this.body).translate(0, 0);
    d3.zoom().transform(this.body, transform);
  }
  init(data: any, row: any) {
    this.treemap = d3.tree().size([row.length * 35, this.width]);
    this.row = row;
    this.data = data;
    this.min = Number(d3.min(this.row.map((i: Span) => i.startTime)));
    this.max = Number(d3.max(this.row.map((i: Span) => i.endTime - this.min)));
    this.list = Array.from(new Set(this.row.map((i: Span) => i.serviceCode)));
    this.xScale = d3.scaleLinear().range([0, 100]).domain([0, this.max]);
    this.sequentialScale = d3
      .scaleSequential()
      .domain([0, this.list.length + 1])
      .interpolator(d3.interpolateCool);

    this.body.call(this.getZoomBehavior(this.svg));
    this.root = d3.hierarchy(this.data, (d) => d.children);
    this.root.x0 = this.height / 2;
    this.root.y0 = 0;
    this.topSlow = [];
    this.topChild = [];
    const that = this;
    this.root.children.forEach(collapse);
    this.topSlowMax = this.topSlow.sort((a: number, b: number) => b - a)[0];
    this.topSlowMin = this.topSlow.sort((a: number, b: number) => b - a)[4];
    this.topChildMax = this.topChild.sort((a: number, b: number) => b - a)[0];
    this.topChildMin = this.topChild.sort((a: number, b: number) => b - a)[4];
    this.update(this.root);
    // Collapse the node and all it's children
    function collapse(d: any) {
      if (d.children) {
        let dur = d.data.endTime - d.data.startTime;
        d.children.forEach((i: any) => {
          dur -= i.data.endTime - i.data.startTime;
        });
        d.dur = dur < 0 ? 0 : dur;
        that.topSlow.push(dur);
        that.topChild.push(d.children.length);
        d.childrenLength = d.children.length;
        d.children.forEach(collapse);
      }
    }
  }
  draw() {
    this.update(this.root);
  }
  update(source: any) {
    const that: any = this;
    const treeData = this.treemap(this.root);
    const nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

    nodes.forEach(function (d: any) {
      d.y = d.depth * 140;
    });

    const node = this.svg.selectAll("g.node").data(nodes, (d: any) => {
      return d.id || (d.id = ++this.i);
    });

    const nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("cursor", "pointer")
      .attr("transform", function () {
        return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on("mouseover", function (event: any, d: any) {
        that.tip.show(d, this);
        if (!that.timeUpdate) {
          return;
        }
        const _node = that.timeUpdate._groups[0].filter(
          (group: any) => group.__data__.id === that.i + 1
        );
        if (_node.length) {
          that.timeTip.show(d, _node[0].children[1]);
        }
      })
      .on("mouseout", function (event: any, d: any) {
        that.tip.hide(d, this);
        if (!that.timeUpdate) {
          return;
        }
        const _node = that.timeUpdate._groups[0].filter(
          (group: any) => group.__data__.id === that.i + 1
        );
        if (_node.length) {
          that.timeTip.hide(d, _node[0].children[1]);
        }
      })
      .on("click", function (event: any, d: any) {
        that.handleSelectSpan(d);
      });

    nodeEnter
      .append("circle")
      .attr("class", "node")
      .attr("r", 1e-6)
      .style("fill", (d: any) =>
        d._children
          ? this.sequentialScale(this.list.indexOf(d.data.serviceCode))
          : "#fff"
      )
      .attr("stroke", (d: any) =>
        this.sequentialScale(this.list.indexOf(d.data.serviceCode))
      )
      .attr("stroke-width", 2.5);

    nodeEnter
      .append("text")
      .attr("font-size", 11)
      .attr("dy", "-0.5em")
      .attr("x", function (d: any) {
        return d.children || d._children ? -15 : 15;
      })
      .attr("text-anchor", function (d: any) {
        return d.children || d._children ? "end" : "start";
      })
      .text((d: any) =>
        d.data.label.length > 19
          ? (d.data.isError ? "◉ " : "") + d.data.label.slice(0, 19) + "..."
          : (d.data.isError ? "◉ " : "") + d.data.label
      )
      .style("fill", (d: any) => (!d.data.isError ? "#3d444f" : "#E54C17"));
    nodeEnter
      .append("text")
      .attr("class", "node-text")
      .attr("x", function (d: any) {
        return d.children || d._children ? -15 : 15;
      })
      .attr("dy", "1em")
      .attr("fill", "#bbb")
      .attr("text-anchor", function (d: any) {
        return d.children || d._children ? "end" : "start";
      })
      .style("font-size", "10px")
      .text(
        (d: any) =>
          `${d.data.layer || ""}${
            d.data.component ? "-" + d.data.component : d.data.component || ""
          }`
      );
    nodeEnter
      .append("rect")
      .attr("rx", 1)
      .attr("ry", 1)
      .attr("height", 2)
      .attr("width", 100)
      .attr("x", function (d: any) {
        return d.children || d._children ? "-110" : "10";
      })
      .attr("y", -1)
      .style("fill", "#00000020");
    nodeEnter
      .append("rect")
      .attr("rx", 1)
      .attr("ry", 1)
      .attr("height", 2)
      .attr("width", (d: any) => {
        if (!d.data.endTime || !d.data.startTime) return 0;
        return this.xScale(d.data.endTime - d.data.startTime) + 1 || 0;
      })
      .attr("x", (d: any) => {
        if (!d.data.endTime || !d.data.startTime) {
          return 0;
        }
        if (d.children || d._children) {
          return -110 + this.xScale(d.data.startTime - this.min);
        }
        return 10 + this.xScale(d.data.startTime - this.min);
      })
      .attr("y", -1)
      .style("fill", (d: any) =>
        this.sequentialScale(this.list.indexOf(d.data.serviceCode))
      );
    const nodeUpdate = nodeEnter.merge(node);
    this.nodeUpdate = nodeUpdate;
    nodeUpdate
      .transition()
      .duration(600)
      .attr("transform", function (d: any) {
        return "translate(" + d.y + "," + d.x + ")";
      });
    nodeUpdate
      .select("circle.node")
      .attr("r", 5)
      .style("fill", (d: any) =>
        d._children
          ? this.sequentialScale(this.list.indexOf(d.data.serviceCode))
          : "#fff"
      )
      .attr("cursor", "pointer")
      .on("click", (d: any) => {
        click(d);
      });
    const nodeExit = node
      .exit()
      .transition()
      .duration(600)
      .attr("transform", function () {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

    nodeExit.select("circle").attr("r", 1e-6);

    nodeExit.select("text").style("fill-opacity", 1e-6);

    const link = this.svg
      .selectAll("path.tree-link")
      .data(links, function (d: { id: string }) {
        return d.id;
      })
      .style("stroke-width", 1.5);

    const linkEnter = link
      .enter()
      .insert("path", "g")
      .attr("class", "tree-link")
      .attr("d", function () {
        const o = { x: source.x0, y: source.y0 };
        return diagonal(o, o);
      })
      .attr("stroke", "rgba(0, 0, 0, 0.1)")
      .style("stroke-width", 1.5)
      .style("fill", "none");

    const linkUpdate = linkEnter.merge(link);
    linkUpdate
      .transition()
      .duration(600)
      .attr("d", function (d: any) {
        return diagonal(d, d.parent);
      });
    link
      .exit()
      .transition()
      .duration(600)
      .attr("d", function () {
        const o = { x: source.x, y: source.y };
        return diagonal(o, o);
      })
      .style("stroke-width", 1.5)
      .remove();

    nodes.forEach(function (d: any) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
    function diagonal(s: any, d: any) {
      return `M ${s.y} ${s.x}
      C ${(s.y + d.y) / 2} ${s.x}, ${(s.y + d.y) / 2} ${d.x},
      ${d.y} ${d.x}`;
    }
    function click(d: any) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      that.update(d);
    }
  }
  setDefault() {
    d3.selectAll(".time-inner").style("opacity", 1);
    d3.selectAll(".time-inner-duration").style("opacity", 0);
    d3.selectAll(".trace-tree-node-selfdur").style("opacity", 0);
    d3.selectAll(".trace-tree-node-selfchild").style("opacity", 0);
    this.nodeUpdate._groups[0].forEach((i: any) => {
      d3.select(i).style("opacity", 1);
    });
  }
  getTopChild() {
    d3.selectAll(".time-inner").style("opacity", 1);
    d3.selectAll(".time-inner-duration").style("opacity", 0);
    d3.selectAll(".trace-tree-node-selfdur").style("opacity", 0);
    d3.selectAll(".trace-tree-node-selfchild").style("opacity", 1);
    this.nodeUpdate._groups[0].forEach((i: any) => {
      d3.select(i).style("opacity", 0.2);
      if (
        i.__data__.data.children.length >= this.topChildMin &&
        i.__data__.data.children.length <= this.topChildMax
      ) {
        d3.select(i).style("opacity", 1);
      }
    });
  }
  getTopSlow() {
    d3.selectAll(".time-inner").style("opacity", 0);
    d3.selectAll(".time-inner-duration").style("opacity", 1);
    d3.selectAll(".trace-tree-node-selfchild").style("opacity", 0);
    d3.selectAll(".trace-tree-node-selfdur").style("opacity", 1);
    this.nodeUpdate._groups[0].forEach((i: any) => {
      d3.select(i).style("opacity", 0.2);
      if (
        i.__data__.data.dur >= this.topSlowMin &&
        i.__data__.data.dur <= this.topSlowMax
      ) {
        d3.select(i).style("opacity", 1);
      }
    });
  }
  getZoomBehavior(g: any) {
    return d3
      .zoom()
      .scaleExtent([0.3, 10])
      .on("zoom", (d: any) => {
        g.attr("transform", d3.zoomTransform(this.svg.node())).attr(
          `translate(${d.transform.x},${d.transform.y})scale(${d.transform.k})`
        );
      });
  }
}
