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
class Vec3 extends Float32Array {
  constructor(v?: unknown, y?: unknown, z?: unknown) {
    super(3);
    if (v instanceof Vec3 || v instanceof Float32Array || (v instanceof Array && v.length == 3)) {
      this[0] = v[0];
      this[1] = v[1];
      this[2] = v[2];
    } else if (typeof v === "number" && typeof y === "number" && typeof z === "number") {
      this[0] = v;
      this[1] = y;
      this[2] = z;
    } else if (typeof v === "number") {
      this[0] = v;
      this[1] = v;
      this[2] = v;
    }
  }
  xyz(x: number, y: number, z: number): Vec3 {
    if (y != undefined && z != undefined) {
      this[0] = x;
      this[1] = y;
      this[2] = z;
    } else this[0] = this[1] = this[2] = x;
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
  get z(): number {
    return this[2];
  }
  set z(v: number) {
    this[2] = v;
  }

  fromVec2(v: Vec3, useZ = false): Vec3 {
    this[0] = v[0];
    if (useZ) {
      this[1] = 0;
      this[2] = v[1];
    } else {
      this[1] = v[1];
      this[2] = 0;
    }
    return this;
  }
  norm(): Vec3 {
    let mag = Math.sqrt(this[0] ** 2 + this[1] ** 2 + this[2] ** 2);
    if (mag != 0) {
      mag = 1 / mag;
      this[0] *= mag;
      this[1] *= mag;
      this[2] *= mag;
    }
    return this;
  }
  /** Pust vector components onto an array, useful when building geometery */
  pushTo(ary: number[]): Vec3 {
    ary.push(this[0], this[1], this[2]);
    return this;
  }
  // INTERPOLATION SETTERS
  fromLerp(a: Vec3, b: Vec3, t: number): Vec3 {
    const ti = 1 - t; // Linear Interpolation : (1 - t) * v0 + t * v1;
    this[0] = a[0] * ti + b[0] * t;
    this[1] = a[1] * ti + b[1] * t;
    this[2] = a[2] * ti + b[2] * t;
    return this;
  }
  /** Add vector to current vector */
  add(a: Vec3 | number[]): Vec3 {
    this[0] += a[0];
    this[1] += a[1];
    this[2] += a[2];
    return this;
  }
  sub(v: Vec3 | number[]): Vec3 {
    this[0] -= v[0];
    this[1] -= v[1];
    this[2] -= v[2];
    return this;
  }
  scale(v: number): Vec3 {
    this[0] *= v;
    this[1] *= v;
    this[2] *= v;
    return this;
  }
  /** Scale a vector */
  fromScale(a: Vec3, s: number): Vec3 {
    this[0] = a[0] * s;
    this[1] = a[1] * s;
    this[2] = a[2] * s;
    return this;
  }
  /** Add two vectors together */
  fromAdd(a: Vec3, b: number[]): Vec3 {
    this[0] = a[0] + b[0];
    this[1] = a[1] + b[1];
    this[2] = a[2] + b[2];
    return this;
  }
  /** Subtract two vectors together */
  fromSub(a: number[], b: number[]): Vec3 {
    this[0] = a[0] - b[0];
    this[1] = a[1] - b[1];
    this[2] = a[2] - b[2];
    return this;
  }
  /** Copy in vector data */
  copy(v: number[] | Float32Array): Vec3 {
    this[0] = v[0];
    this[1] = v[1];
    this[2] = v[2];
    return this;
  }
  static add(a: Vec3, b: number[]): Vec3 {
    return new Vec3().fromAdd(a, b);
  }
  static sub(a: number[], b: number[]): Vec3 {
    return new Vec3().fromSub(a, b);
  }
  static scale(a: Vec3, s: number): Vec3 {
    return new Vec3().fromScale(a, s);
  }
  static norm(x: unknown, y: unknown, z: unknown): Vec3 {
    const rtn = new Vec3();
    if (x instanceof Vec3 || x instanceof Float32Array || (x instanceof Array && x.length == 3)) {
      rtn.copy(x);
    } else if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
      rtn.xyz(x, y, z);
    }
    return rtn.norm();
  }
}
export default Vec3;
