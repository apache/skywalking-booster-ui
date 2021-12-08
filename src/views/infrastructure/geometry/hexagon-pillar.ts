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
import Vec3 from "@/utils/vec3";
import Vec2 from "@/utils/vec2";

class HexagonPillar {
  static get(
    pointyUp = true,
    radius = 0.5,
    cornerScale = 0.2,
    cornerDiv = 3,
    capSize = 0.2,
    offsetHeight = 0.5
  ): {
    vertices: number[];
    indices: number[];
    texcoord: number[];
    normals: number[];
  } {
    const rtn: {
      vertices: number[];
      indices: number[];
      texcoord: number[];
      normals: number[];
    } = {
      vertices: [],
      indices: [],
      texcoord: [],
      normals: [],
    };

    let poly = createPolygon(radius, 6, pointyUp ? (30 * Math.PI) / 180 : 0); // Create Base Shape
    poly = polyBevel(poly, cornerScale, cornerDiv); // Round the Shape Corners
    // Base Layer
    toVec3(rtn, poly);
    const vertCnt = rtn.vertices.length / 3;
    // Starting layer for Cap.
    toVec3(rtn, poly, [0, offsetHeight, 0]);

    // Extra Layers for Bevel
    polyCapBevel(rtn, poly, cornerDiv, capSize, [0, offsetHeight, 0]);
    const idxTip = rtn.vertices.length;

    // Cap Center Point
    rtn.vertices.push(0, capSize + offsetHeight, 0);
    rtn.normals.push(0, 1, 0);

    // Indices
    const idx = idxTip / 3;
    gridIndicesCol(rtn.indices, vertCnt, 2 + cornerDiv, 0, true, true);
    fanIndices(rtn.indices, idx, idx - vertCnt, idx - 1, true);
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    return rtn;
  }
  static getVertices(pointyUp = true, radius = 0.5): { vertices: Vec3[] } {
    const rtn = {
      vertices: [],
      normals: [],
    };

    const poly = createPolygon(radius, 6, pointyUp ? (30 * Math.PI) / 180 : 0); // Create Base Shape
    toVec3(rtn, poly);
    const vertices: any[] = [];
    for (let i = 0; i < rtn.vertices.length / 3; i++) {
      vertices.push(
        new Vec3(
          rtn.vertices[i * 3],
          rtn.vertices[i * 3 + 1],
          rtn.vertices[i * 3 + 2]
        )
      );
    }
    vertices.push(new Vec3(rtn.vertices[0], rtn.vertices[1], rtn.vertices[2]));
    return { vertices };
  }
}
// Create the basic 2d polygon shape
function createPolygon(radius: number, sides = 6, offset = 0) {
  const poly: number[] = [];
  let i, rad;
  for (i = 0; i < sides; i++) {
    rad = Math.PI * 2 * (i / sides);
    poly.push(Math.cos(rad + offset) * radius, Math.sin(rad + offset) * radius);
  }
  return poly;
}
// Bevel the corners of polygon
function polyBevel(poly: number[], cornerScale = 0.2, cornerDiv = 3) {
  const polyOut: number[] = [];
  const len = poly.length / 2;
  const a = new Vec2(); // 3 Points that forms a Polygon Corner
  const b = new Vec2();
  const c = new Vec2();

  const va = new Vec2(); // Min/Max Points of the corner to bevel
  const vb = new Vec2();

  const norma = new Vec2(); // Inward Normals of the Corner Edges
  const normb = new Vec2();
  const pivot = new Vec2(); // Pivot point to create curved points
  // eslint-disable-next-line
  const v = new Vec2() as any;
  let ii, i, j, k, radius;
  for (j = 0; j < len; j++) {
    i = mod(j - 1, len); // Previous Point
    k = mod(j + 1, len); // Next Point

    a.fromBuf(poly, i * 2); // Get the Point Positions out of flat buffer
    b.fromBuf(poly, j * 2);
    c.fromBuf(poly, k * 2);

    va.fromLerp(a, b, 1.0 - cornerScale); // Get the two points to start and end curved corner
    vb.fromLerp(b, c, cornerScale);
    norma.fromSub(b, a).perpCCW().norm(); // Compute Inward normal of the two edges
    normb.fromSub(c, b).perpCCW().norm();

    raysIntersection(va, norma, vb, normb, pivot); // Point where the 2 normals converge.

    radius = Vec2.len(va, pivot); // Get the Radius for the curved corner
    va.pushTo(polyOut);

    for (ii = 1; ii < cornerDiv; ii++) {
      // Fill in the remaining points
      v.fromLerp(va, vb, ii / cornerDiv) // Lerp between Start + end Points
        .sub(pivot) // Localize it
        .norm() // Normalize it
        .scale(radius) // Scale it to the radius
        .add(pivot) // Move it back to world space
        .pushTo(polyOut);
    }
    vb.pushTo(polyOut);
  }
  return polyOut;
}

function mod(a: number, b: number): number {
  const v = a % b;
  return v < 0 ? b + v : v;
}
// Turn 2D Polygon Points into 3D Vertices
function toVec3(
  geo: { normals: number[]; vertices: number[] },
  poly: number[],
  offset?: Vec3 | number[]
) {
  const v = new Vec3();
  // eslint-disable-next-line
  let i: any;
  offset = offset || [0, 0, 0];
  for (i of Vec2.bufIter(poly)) {
    v.fromVec2(i, true)
      .add(offset)
      .pushTo(geo.vertices)
      .sub(offset)
      .norm()
      .pushTo(geo.normals);
  }
}
// Create a Beveled cap for the extruded walls
function polyCapBevel(
  geo: { normals: number[]; vertices: number[] },
  poly: number[],
  cornerDiv: number,
  capSize: number,
  offset?: Vec3 | number[]
) {
  // eslint-disable-next-line
  const v: any = new Vec2();
  const lerp: any[] = [];
  let pivot, top, pnt, i, vlen, tlen;

  offset = offset || [0, 0, 0];
  for (i = 0; i < poly.length; i += 2) {
    v.fromBuf(poly, i);

    vlen = v.len();
    tlen = vlen - capSize;
    pnt = new Vec3().fromVec2(v, true);
    pivot = Vec3.scale(pnt, tlen / vlen);
    top = Vec3.add(pivot, [0, capSize, 0]);

    lerp.push({ pivot, top, pnt });
  }
  let t, itm;
  pnt = new Vec3();
  for (i = 1; i <= cornerDiv; i++) {
    t = i / cornerDiv;
    for (itm of lerp) {
      pnt
        .fromLerp(itm.pnt, itm.top, t)
        .sub(itm.pivot)
        .norm()
        .pushTo(geo.normals)
        .scale(capSize)
        .add(itm.pivot)
        .add(offset)
        .pushTo(geo.vertices);
    }
  }
}

//https://stackoverflow.com/questions/2931573/determining-if-two-rays-intersect
function raysIntersection(as: Vec2, ad: Vec2, bs: Vec2, bd: Vec2, out: Vec2) {
  const dx = bs[0] - as[0];
  const dy = bs[1] - as[1];
  const det = bd[0] * ad[1] - bd[1] * ad[0];

  if (det != 0) {
    // near parallel line will yield noisy results
    const u = (dy * bd[0] - dx * bd[1]) / det;
    const v = (dy * ad[0] - dx * ad[1]) / det;

    if (u >= 0 && v >= 0) {
      out[0] = as[0] + ad[0] * u;
      out[1] = as[1] + ad[1] * u;
      return true;
    }
  }
  return false;
}
/** Generate Indices of both a Looped or Unlooped Grid, Backslash Pattern, Loops on Columns */
function gridIndicesCol(
  out: number[],
  row_size: number,
  row_cnt: number,
  start_idx = 0,
  do_loop = false,
  rev_quad = false
) {
  const row_stop = row_cnt - 1,
    col_stop = do_loop ? row_size : row_size - 1;
  let row_a, row_b, r, rr, rrr, a, b, c, d;
  for (r = 0; r < row_stop; r++) {
    // Figure out the starting Index for the Two Rows
    // 2nd row might loop back to starting row when Looping.
    row_a = start_idx + row_size * r;
    row_b = start_idx + row_size * (r + 1);
    for (rr = 0; rr < col_stop; rr++) {
      // Defined the Vertex Index of a Quad
      rrr = (rr + 1) % row_size;
      a = row_a + rr;
      b = row_a + rrr;
      d = row_b + rr;
      c = row_b + rrr;
      if (!rev_quad) out.push(a, b, c, c, d, a);
      // Counter ClockWise
      else out.push(a, d, c, c, b, a);
    }
  }
}
function fanIndices(
  out: number[],
  midIdx: number,
  edgeStart: number,
  edgeEnd: number,
  rev_quad = false
) {
  const len = edgeEnd - edgeStart + 1;
  let i, ii;
  for (i = 0; i < len; i++) {
    ii = (i + 1) % len; // Next Point on the edge
    if (!rev_quad) out.push(midIdx, edgeStart + i, edgeStart + ii);
    // Counter ClockWise
    else out.push(midIdx, edgeStart + ii, edgeStart + i);
  }
}
export default HexagonPillar;
