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
class Orientation {
  public f0 = 0;
  public f1 = 0;
  public f2 = 0;
  public f3 = 0;
  public b0? = 0;
  public b1? = 0;
  public b2? = 0;
  public b3? = 0;
  public start_angle? = 0;
  constructor(
    f0: number,
    f1: number,
    f2: number,
    f3: number,
    b0: number,
    b1: number,
    b2: number,
    b3: number,
    start_angle: number,
  ) {
    this.f0 = f0;
    this.f1 = f1;
    this.f2 = f2;
    this.f3 = f3;
    this.b0 = b0;
    this.b1 = b1;
    this.b2 = b2;
    this.b3 = b3;
    this.start_angle = start_angle;
  }
}

const SQRT3 = Math.sqrt(3.0);
class Layout {
  static Pointy = new Orientation(SQRT3, SQRT3 / 2.0, 0.0, 3.0 / 2.0, SQRT3 / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5);
  static Flat = new Orientation(3.0 / 2.0, 0.0, SQRT3 / 2.0, SQRT3, 2.0 / 3.0, 0.0, -1.0 / 3.0, SQRT3 / 3.0, 0.0);

  static spacing(radius: number, isPointy = false): number[] {
    return isPointy ? [SQRT3 * radius, 2 * radius * (3 / 4)] : [2 * radius * (3 / 4), SQRT3 * radius];
  }

  private radius = 1;
  private orientation: Orientation = { f0: 0, f1: 0, f2: 0, f3: 0 };
  private origin = [0, 0];

  constructor(radius: number, origin = [0, 0], orientation?: Orientation) {
    this.radius = radius; //Layout.spacing( radius, ( orientation === Layout.Pointy ) );
    this.orientation = orientation || Layout.Flat;
    this.origin = origin;
  }

  // Same as HexToPixel, Except it takes raw coords instead of hex object.
  axialToPixel(ax: number, ay: number): number[] {
    const M = this.orientation;
    const x = (M.f0 * ax + M.f1 * ay) * this.radius;
    const y = (M.f2 * ax + M.f3 * ay) * this.radius;

    return [x + this.origin[0], y + this.origin[1]];
  }

  hexToPixel(h: { x: number; y: number }): number[] {
    const M = this.orientation;
    const x = (M.f0 * h.x + M.f1 * h.y) * this.radius;
    const y = (M.f2 * h.x + M.f3 * h.y) * this.radius;

    return [x + this.origin[0], y + this.origin[1]];
  }
}

class Hex extends Int16Array {
  constructor(x: number, y: number, z = null) {
    super(3);
    this.xyz(x, y, z);
  }

  xyz(x: number, y: number, z: number | null = null): Hex {
    if (z == null) z = -x - y;
    if (x + y + z != 0) {
      console.log("Bad Axial Coordinate : : q %d r %d s %d", x, y, z);
    }

    this[0] = x;
    this[1] = y;
    this[2] = z;
    return this;
  }

  get x(): number {
    return this[0];
  }
  get y(): number {
    return this[1];
  }
  get z(): number {
    return this[2];
  }

  get len(): number {
    return Math.floor((Math.abs(this[0]) + Math.abs(this[1]) + Math.abs(this[2])) / 2);
  }
}

export { Hex, Orientation, Layout };
