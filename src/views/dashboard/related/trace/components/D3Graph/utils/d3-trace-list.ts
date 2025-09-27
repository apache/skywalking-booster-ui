/**</template>
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
import type { Trace, Span } from "@/types/trace";
import dayjs from "dayjs";
import icons from "@/assets/img/icons";
import { getServiceColor } from "@/utils/color";

const xScaleWidth = 0.6;
export default class ListGraph {
  private barHeight = 48;
  private handleSelectSpan: Nullable<(i: Trace) => void> = null;
  private el: Nullable<HTMLDivElement> = null;
  private i = 0;
  private width = 0;
  private height = 0;
  private svg: any = null;
  private tip: any = null;
  private prompt: any = null;
  private row: any[] = [];
  private data: any = [];
  private minTimestamp = 0;
  private maxTimestamp = 0;
  private xScale: any = null;
  private xAxis: any = null;
  private root: any = null;
  private selectedNode: any = null;
  constructor({ el, handleSelectSpan }: { el: HTMLDivElement; handleSelectSpan: (i: Trace) => void }) {
    this.handleSelectSpan = handleSelectSpan;
    this.el = el;
    this.width = el.getBoundingClientRect().width - 10;
    d3.select(`.${this.el?.className} .trace-list`).remove();
    this.svg = d3
      .select(this.el)
      .append("svg")
      .attr("class", "trace-list")
      .attr("width", this.width > 0 ? this.width : 10)
      .attr("height", this.height > 0 ? this.height : 10)
      .attr("transform", `translate(-5, 0)`);
    this.tip = (d3tip as any)()
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html((d: Recordable) => {
        return `
          <div class="mb-5">${d.data.label}</div>
          ${d.data.dur ? '<div class="sm">SelfDuration: ' + d.data.dur + "ms</div>" : ""}
          ${
            d.data.endTime - d.data.startTime
              ? '<div class="sm">TotalDuration: ' + (d.data.endTime - d.data.startTime) + "ms</div>"
              : ""
          }
          `;
      });
    this.prompt = (d3tip as any)()
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html((d: any) => {
        return `<div class="mb-5">${d.data.type}</div>`;
      });
    this.svg.call(this.tip);
    this.svg.call(this.prompt);
  }
  diagonal(d: Indexable) {
    return `M ${d.source.y} ${d.source.x + 5}
    L ${d.source.y} ${d.target.x - 30}
    L${d.target.y} ${d.target.x - 20}
    L${d.target.y} ${d.target.x - 5}`;
  }
  init({
    data,
    row,
    fixSpansSize,
    selectedMaxTimestamp,
    selectedMinTimestamp,
  }: {
    data: Indexable;
    row: Indexable[];
    fixSpansSize: number;
    selectedMaxTimestamp?: number;
    selectedMinTimestamp?: number;
  }) {
    d3.select(`.${this.el?.className} .trace-xaxis`).remove();
    d3.select("#trace-action-box").style("display", "none");
    this.row = row;
    this.data = data;
    const min = d3.min(this.row.map((i) => i.startTime));
    const max = d3.max(this.row.map((i) => i.endTime));
    this.minTimestamp = selectedMinTimestamp ?? min;
    this.maxTimestamp = selectedMaxTimestamp ?? max;
    this.xScale = d3
      .scaleLinear()
      .range([0, this.width * xScaleWidth])
      .domain([this.minTimestamp - min, this.maxTimestamp - min]);
    this.xAxis = d3.axisTop(this.xScale).tickFormat((d: any) => {
      if (d === 0) return d.toFixed(2);
      if (d >= 1000) return (d / 1000).toFixed(2) + "s";
      return d.toFixed(2);
    });
    this.svg.attr("height", (this.row.length + fixSpansSize + 1) * this.barHeight);
    this.svg
      .append("g")
      .attr("class", "trace-xaxis")
      .attr("transform", `translate(${this.width * (1 - xScaleWidth) - 20},${30})`)
      .call(this.xAxis);
    this.root = d3.hierarchy(this.data, (d) => d.children);
    this.root.x0 = 0;
    this.root.y0 = 0;
    const t = this;
    d3.select("svg.trace-list").on("click", function (event: MouseEvent) {
      if (event.target === this) {
        d3.select("#trace-action-box").style("display", "none");
        t.selectedNode && t.selectedNode.classed("highlighted", false);
        t.clearParentHighlight();
      }
    });
  }
  draw(callback: Function) {
    this.update(this.root, callback);
  }
  click(d: Recordable, scope: Recordable) {
    if (!d.data.type) return;
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    scope.update(d);
  }
  update(source: Recordable, callback: Function) {
    const t = this;
    const nodes = this.root.descendants();
    let index = -1;
    this.root.eachBefore((n: Recordable) => {
      n.x = ++index * this.barHeight + 24;
      n.y = n.depth * 12;
    });
    const node = this.svg.selectAll(".trace-node").data(nodes, (d: Recordable) => d.id || (d.id = ++this.i));
    const nodeEnter = node
      .enter()
      .append("g")
      .attr("transform", `translate(${source.y0},${source.x0})`)
      .attr("id", (d: Recordable) => `list-node-${d.id}`)
      .attr("class", "trace-node")
      .attr("style", "cursor: pointer")
      .on("mouseover", function (event: MouseEvent, d: Trace) {
        t.tip.show(d, this);
      })
      .on("mouseout", function (event: MouseEvent, d: Trace) {
        t.tip.hide(d, this);
      })
      .on("click", function (event: MouseEvent, d: Trace & { id: string }) {
        event.stopPropagation();
        t.tip.hide(d, this);
        d3.select(this).classed("highlighted", true);
        const nodeBox = this.getBoundingClientRect();
        const svgBox = (d3.select(`.${t.el?.className} .trace-list`) as any).node().getBoundingClientRect();
        const offsetX = nodeBox.x - svgBox.x;
        const offsetY = nodeBox.y - svgBox.y;
        d3.select("#trace-action-box")
          .style("display", "block")
          .style("left", `${offsetX + 30}px`)
          .style("top", `${offsetY + 40}px`);
        t.selectedNode?.classed("highlighted", false);
        t.selectedNode = d3.select(this);
        if (t.handleSelectSpan) {
          t.handleSelectSpan(d);
        }
        t.root.descendants().map((node: { id: number }) => {
          d3.select(`#list-node-${node.id}`).classed("highlightedParent", false);
          return node;
        });
      });
    nodeEnter
      .append("rect")
      .attr("height", this.barHeight)
      .attr("ry", 2)
      .attr("rx", 2)
      .attr("y", -this.barHeight / 2)
      .attr("x", 20)
      .attr("width", "200px")
      .attr("fill", "rgba(0,0,0,0)");
    nodeEnter
      .append("image")
      .attr("width", 16)
      .attr("height", 16)
      .attr("x", 6)
      .attr("y", -8)
      .attr("xlink:href", (d: any) =>
        d.data.type === "Entry" ? icons.ENTRY : d.data.type === "Exit" ? icons.EXIT : "",
      )
      .style("display", (d: any) => {
        ["Entry", "Exit"].includes(d.data.type) ? "inline" : "none";
      })
      .on("mouseover", function (event: any, d: Trace) {
        event.stopPropagation();
        t.prompt.show(d, this);
      })
      .on("mouseout", function (event: any, d: Trace) {
        event.stopPropagation();
        t.prompt.hide(d, this);
      });
    nodeEnter
      .append("image")
      .attr("width", 16)
      .attr("height", 16)
      .attr("x", 6)
      .attr("y", -8)
      .attr("xlink:href", (d: any) => {
        const key = (d.data.refs || []).findIndex((d: { type: string }) => d.type === "CROSS_THREAD");
        return key > -1 ? icons.STREAM : "";
      })
      .style("display", (d: any) => {
        const key = (d.data.refs || []).findIndex((d: { type: string }) => d.type === "CROSS_THREAD");
        return key > -1 ? "inline" : "none";
      })
      .on("mouseover", function (event: any, d: any) {
        const a = {
          ...d,
          data: {
            ...d.data,
            type: "CROSS_THREAD",
          },
        };
        event.stopPropagation();
        t.prompt.show(a, this);
      })
      .on("mouseout", function (event: any, d: Trace) {
        event.stopPropagation();
        t.prompt.hide(d, this);
      });
    nodeEnter
      .append("text")
      .attr("class", "node-text")
      .attr("x", 35)
      .attr("y", -6)
      .attr("fill", (d: { data: Span }) => (d.data.isError ? `var(--el-color-danger)` : `var(--font-color)`))
      .html((d: { data: Span }) => {
        const { label } = d.data;
        if (d.data.label === "TRACE_ROOT") {
          return "";
        }
        return (label || "").length > 30 ? `${label?.slice(0, 30)}...` : `${label}`;
      });
    nodeEnter
      .append("circle")
      .attr("r", 10)
      .attr("cx", (d: Recordable) => {
        const events = d.data.attachedEvents;
        if (events && events.length > 9) {
          return 273;
        } else {
          return 270;
        }
      })
      .attr("cy", -5)
      .attr("fill", "none")
      .attr("stroke", "#e66")
      .style("opacity", (d: Recordable) => {
        const events = d.data.attachedEvents;
        if (events && events.length) {
          return 0.5;
        } else {
          return 0;
        }
      });
    nodeEnter
      .append("text")
      .attr("x", 267)
      .attr("y", -1)
      .attr("fill", "#e66")
      .style("font-size", "10px")
      .text((d: { data: Span }) => {
        const events = d.data.attachedEvents;
        if (events && events.length) {
          return `${events.length}`;
        } else {
          return "";
        }
      });
    nodeEnter
      .append("text")
      .attr("class", "node-text")
      .attr("x", 35)
      .attr("y", 12)
      .attr("fill", (d: { data: Span }) => (d.data.isError ? `var(--el-color-danger)` : `var(--disabled-color)`))
      .style("font-size", "11px")
      .text((d: { data: Span }) => {
        const { layer, component, event, startTime, startTimeNanos } = d.data;
        const text = `${layer || ""} ${
          component ? "- " + component : event ? this.visDate(startTime) + ":" + startTimeNanos : ""
        }`;
        return text.length > 20 ? `${text?.slice(0, 20)}...` : `${text}`;
      });
    nodeEnter
      .append("rect")
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("height", 4)
      .attr("width", (d: Recordable) => {
        if (!d.data.endTime || !d.data.startTime) return 0;
        // Calculate the actual start and end times within the visible range
        let spanStart = d.data.startTime;
        let spanEnd = d.data.endTime;

        const isIn = d.data.startTime > this.maxTimestamp || d.data.endTime < this.minTimestamp;
        if (isIn) return 0;

        // If the span is completely outside the visible range, don't show it
        if (spanStart >= spanEnd) return 0;
        if (spanStart < this.minTimestamp) spanStart = this.minTimestamp;
        if (spanEnd > this.maxTimestamp) spanEnd = this.maxTimestamp;
        if (spanStart >= spanEnd) return 0;
        const min = d3.min(this.row.map((i) => i.startTime));
        return this.xScale(spanEnd - min) - this.xScale(spanStart - min) + 1 || 0;
      })
      .attr("x", (d: Recordable) => {
        if (!d.data.endTime || !d.data.startTime) return 0;
        const isIn = d.data.startTime > this.maxTimestamp || d.data.endTime < this.minTimestamp;
        if (isIn) return 0;
        // Calculate the actual start time within the visible range
        let spanStart = d.data.startTime;
        if (spanStart < this.minTimestamp) spanStart = this.minTimestamp;
        const min = d3.min(this.row.map((i) => i.startTime));
        return this.width * (1 - xScaleWidth) - d.y - 25 + this.xScale(spanStart - min) || 0;
      })
      .attr("y", -2)
      .style("fill", (d: Recordable) => `${getServiceColor(d.data.serviceCode || "")}`);
    const nodeUpdate = nodeEnter.merge(node);
    nodeUpdate
      .transition()
      .duration(400)
      .attr("transform", (d: Recordable) => `translate(${d.y + 5},${d.x})`)
      .style("opacity", 1);
    nodeUpdate
      .append("circle")
      .attr("r", 3)
      .style("cursor", "pointer")
      .attr("stroke-width", 3)
      .style("fill", (d: Recordable) => (d._children ? `${getServiceColor(d.data.serviceCode)}` : "#eee"))
      .style("stroke", (d: Recordable) =>
        d.data.label === "TRACE_ROOT" ? "" : `${getServiceColor(d.data.serviceCode)}`,
      )
      .on("click", (event: any, d: Recordable) => {
        event.stopPropagation();
        if (d.data.children.length === 0) return;
        this.click(d, this);
      });
    // Transition exiting nodes to the parent's new position.
    node
      .exit()
      .transition()
      .duration(400)
      .attr("transform", `translate(${source.y},${source.x})`)
      .style("opacity", 0)
      .remove();
    const link = this.svg.selectAll(".trace-link").data(this.root.links(), function (d: Recordable) {
      return d.target.id;
    });

    link
      .enter()
      .insert("path", "g")
      .attr("class", "trace-link")
      .attr("fill", "none")
      .attr("stroke", "var(--sw-trace-list-path)")
      .attr("stroke-width", 2)
      .attr("transform", `translate(5, 0)`)
      .attr("d", () => {
        const o = { x: source.x0 + 40, y: source.y0 };
        return this.diagonal({ source: o, target: o });
      })
      .transition()
      .duration(400)
      .attr("d", this.diagonal);

    link.transition().duration(400).attr("d", this.diagonal);

    link
      .exit()
      .transition()
      .duration(400)
      .attr("d", () => {
        const o = { x: source.x + 35, y: source.y };
        return this.diagonal({ source: o, target: o });
      })
      .remove();
    this.root.each(function (d: Recordable) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
    if (callback) {
      callback();
    }
  }
  clearParentHighlight() {
    return this.root.descendants().map((node: { id: number }) => {
      d3.select(`#list-node-${node.id}`).classed("highlightedParent", false);
      return node;
    });
  }
  highlightParents(span: Recordable) {
    if (!span) {
      return;
    }
    const nodes = this.clearParentHighlight();
    const parentSpan = nodes.find(
      (node: Recordable) =>
        span.spanId === node.data.spanId &&
        span.segmentId === node.data.segmentId &&
        span.traceId === node.data.traceId,
    );
    if (!parentSpan) return;
    d3.select(`#list-node-${parentSpan.id}`).classed("highlightedParent", true);
    d3.select("#trace-action-box").style("display", "none");
    this.selectedNode.classed("highlighted", false);
    const container = document.querySelector(".trace-chart .charts");
    const containerRect = container?.getBoundingClientRect();
    if (!containerRect) return;
    const targetElement = document.querySelector(`#list-node-${parentSpan.id}`);
    if (!targetElement) return;
    const targetRect = targetElement.getBoundingClientRect();
    container?.scrollTo({
      left: targetRect.left - containerRect.left + container?.scrollLeft,
      top: targetRect.top - containerRect.top + container?.scrollTop - 100,
      behavior: "smooth",
    });
  }
  highlightSpan(span: Recordable) {
    if (!span) {
      return;
    }
    const nodes = this.root?.descendants ? this.root.descendants() : [];
    const targetNode = nodes.find(
      (node: { data: Span }) =>
        span.spanId === node.data.spanId &&
        span.segmentId === node.data.segmentId &&
        span.traceId === node.data.traceId,
    );
    if (!targetNode) return;
    this.selectedNode?.classed("highlighted", false);
    const sel = d3.select(`#list-node-${targetNode.id}`);
    sel.classed("highlighted", true);
    this.selectedNode = sel;
  }
  visDate(date: number, pattern = "YYYY-MM-DD HH:mm:ss:SSS") {
    return dayjs(date).format(pattern);
  }
}
