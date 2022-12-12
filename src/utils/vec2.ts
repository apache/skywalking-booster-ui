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
class Vec2 extends Float32Array {
  constructor(v?: unknown, y?: unknown) {
    super(2);
    if (v instanceof Vec2 || v instanceof Float32Array || (v instanceof Array && v.length == 2)) {
      this[0] = v[0];
      this[1] = v[1];
    } else if (typeof v === "number" && typeof y === "number") {
      this[0] = v;
      this[1] = y;
    } else if (typeof v === "number") {
      this[0] = v;
      this[1] = v;
    }
  }
  xy(x: number, y: number): Vec2 {
    if (y != undefined) {
      this[0] = x;
      this[1] = y;
    } else this[0] = this[1] = x;
    return this;
  }
  get x(): number {
    return this[0];
  }
  set x(v: number) {
    this[0] = v;
  }
  get y(): number {
    return this[1];
  }
  set y(v: number) {
    this[1] = v;
  }
  len(): number {
    return Math.sqrt(this[0] * this[0] + this[1] * this[1]);
  }
  fromAdd(a: number[], b: number[]): Vec2 {
    this[0] = a[0] + b[0];
    this[1] = a[1] + b[1];
    return this;
  }
  fromSub(a: number[] | Vec2, b: number[] | Vec2): Vec2 {
    this[0] = a[0] - b[0];
    this[1] = a[1] - b[1];
    return this;
  }
  fromScale(a: number[] | Vec2, s: number): Vec2 {
    this[0] = a[0] * s;
    this[1] = a[1] * s;
    return this;
  }
  fromLerp(a: number[] | Vec2, b: number[] | Vec2, t: number): Vec2 {
    const tt = 1 - t;
    this[0] = a[0] * tt + b[0] * t;
    this[1] = a[1] * tt + b[1] * t;
    return this;
  }
  /** Used to get data from a flat buffer of vectors, useful when building geometery */
  fromBuf(ary: number[], idx: number): Vec2 {
    this[0] = ary[idx];
    this[1] = ary[idx + 1];
    return this;
  }
  /** Pust vector components onto an array, useful when building geometery */
  pushTo(ary: number[]): Vec2 {
    ary.push(this[0], this[1]);
    return this;
  }
  add(v: number[]): Vec2 {
    this[0] += v[0];
    this[1] += v[1];
    return this;
  }
  addRaw(x: number, y: number): Vec2 {
    this[0] += x;
    this[1] += y;
    return this;
  }
  sub(v: number[]): Vec2 {
    this[0] -= v[0];
    this[1] -= v[1];
    return this;
  }
  scale(v: number): Vec2 {
    this[0] *= v;
    this[1] *= v;
    return this;
  }
  norm(out?: number[] | Vec2): number[] | Vec2 | undefined {
    const mag = Math.sqrt(this[0] * this[0] + this[1] * this[1]);
    if (mag == 0) return this;
    out = out || this;
    out[0] = this[0] / mag;
    out[1] = this[1] / mag;
    return out;
  }
  perpCCW(): Vec2 {
    const x = this[0];
    this[0] = -this[1];
    this[1] = x;
    return this;
  }
  static add(a: number[], b: number[]): Vec2 {
    return new Vec2().fromAdd(a, b);
  }
  static sub(a: number[], b: number[]): Vec2 {
    return new Vec2().fromSub(a, b);
  }
  static scale(v: number[], s: number): Vec2 {
    return new Vec2().fromScale(v, s);
  }
  static lerp(v0: number[], v1: number[], t: number): Vec2 {
    return new Vec2().fromLerp(v0, v1, t);
  }
  static len(v0: Vec2, v1: Vec2): number {
    return Math.sqrt((v0[0] - v1[0]) ** 2 + (v0[1] - v1[1]) ** 2);
  }
  /** Create an Iterator Object that allows an easy way to loop a Float32Buffer
   * @example
   * let buf = new Float32Array( 2 * 10 );
   * for( let v of Vec3.bufIter( buf ) ){console.log( v )};
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static bufIter(buf: number[]) {
    let i = 0;
    const result = { value: new Vec2(), done: false },
      len = buf.length,
      next = () => {
        if (i >= len) result.done = true;
        else {
          result.value.fromBuf(buf, i);
          i += 2;
        }
        return result;
      };
    return {
      [Symbol.iterator]() {
        return { next };
      },
    };
  }
}
export default Vec2;
