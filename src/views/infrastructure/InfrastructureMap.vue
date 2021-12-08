<!-- Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. -->
<template>
  <div class="infrastructure-box">
    <div ref="mapRef" class="map"></div>
    <div class="info-box" v-show="showInfo">
      {{ nodeTypes[type] }} Information
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import * as THREE from "three";
import fac from "three-orbit-controls";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { HexagonCreateParams } from "@/types/infrastructure";
import HexagonPillar from "./geometry/hexagon-pillar";
import { Layout } from "./geometry/hexagon-layout";
import { NodeTypes } from "./data";

const animateCallbacks: Array<() => void> = [];
const showInfo = ref<boolean>(false);
const objSelected = ref<any>(null);
const meshColors = ref([0xa1cffb, 0x333333, 0x333840, 0x999999]); //[0xa489b2, 0xf2bfd0, 0xf0eaea, 0xef6775, 0xfbc580];
const nodeTypes = ref(NodeTypes);
const type = ref<number>(0);
const width = ref<number>(1920);
const height = ref<number>(900);
const mapRef = ref<HTMLDivElement | null>(null);
let lineObj: any;
let scene: any;
let camera: any;
let raycaster: any;
let pointer: any;

onMounted(() => {
  if (mapRef.value) {
    init(mapRef.value);
  }
  window.addEventListener("click", onMouseClick, false);
  animate();
});

function init(dom: HTMLDivElement): void {
  width.value = dom.offsetWidth;
  height.value = dom.offsetHeight + 74;
  camera = new THREE.PerspectiveCamera(
    45,
    width.value / height.value,
    1,
    10000
  );
  camera.position.set(0, 30, 140);
  scene = new THREE.Scene();
  let light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(4, 10, 4);

  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));
  scene.background = new THREE.Color(0x333840);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(width.value, height.value);
  dom.appendChild(renderer.domElement);

  const window = Window as any;
  const OrbitControls = fac(THREE);
  window.controls = new OrbitControls(camera, renderer.domElement);
  window.controls.enableZoom = true;
  window.controls.enablePan = true;

  const helper = new THREE.GridHelper(10000, 40, 0x04002c, 0x04002c);
  helper.position.y = -1000;
  // this.scene.add(helper);
  const axis = new THREE.AxesHelper(15000);
  // this.scene.add(axis);
  // add mesh
  createInfrastructure();

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  animateCallbacks.push(() => {
    renderer.render(scene, camera);
  });
}

function createInfrastructure() {
  //layer mesh
  const l = {
    hexagonParam: [27, 0.04, 5, 0.04, 0],
    count: 1,
    radius: 28, // layout hexagons radius
  };
  const [originVectors] = createHexagonLine(l, [0, 0, 0], 0);
  // group mesh
  const g: HexagonCreateParams = {
    hexagonParam: [8, 0.04, 5, 0.04, 0.01],
    count: 1,
    radius: 8.5,
  };
  const [gVecs] = createPillarMesh(g, originVectors, 1);
  // service mesh
  const s: HexagonCreateParams = {
    hexagonParam: [2, 0.04, 5, 0.04, 0.2],
    count: 1,
    radius: 2.2,
  };
  const [sVecs] = createPillarMesh(s, gVecs, 2);

  // instance mesh
  const i: HexagonCreateParams = {
    hexagonParam: [0.2, 0.04, 5, 0.04, 0.3],
    count: 2,
    radius: 0.3,
  };
  createPillarMesh(i, sVecs, 3);
}

function createHexagonLine(
  p: HexagonCreateParams,
  originVectors: number[],
  type: number
) {
  lineObj = new THREE.Object3D();
  const centers: number[] = [];
  const geo = HexagonPillar.getVertices(false, ...p.hexagonParam);

  for (let i = 0; i < originVectors.length / 3; i++) {
    const c = [originVectors[3 * i], originVectors[3 * i + 2]];
    const [origins] = hexGrid(p.count, p.radius, c);
    centers.push(...origins);
  }
  for (let c = 0; c < centers.length / 3; c++) {
    const vertices = [];
    for (let v = 0; v < geo.vertices.length; v++) {
      vertices.push(
        centers[3 * c] + geo.vertices[v].x,
        centers[3 * c + 1] + geo.vertices[v].y,
        centers[3 * c + 2] + geo.vertices[v].z
      );
    }
    const geometry = new LineGeometry().setPositions(vertices);
    geometry.setAttribute(
      "id",
      new THREE.BufferAttribute(new Int8Array([type]), 1)
    );
    const material = new LineMaterial({
      color: meshColors.value[type],
      linewidth: 4,
      // opacity: 0.2,
      dashed: false,
    });
    material.resolution.set(width.value, height.value);
    const line = new Line2(geometry, material);
    line.computeLineDistances();
    lineObj.add(line);
  }
  scene.add(lineObj);
  return [centers];
}

function createPillarMesh(
  p: HexagonCreateParams,
  originVectors: number[],
  type: number
) {
  const centers: number[] = [];
  const geo = HexagonPillar.get(false, ...p.hexagonParam);

  for (let i = 0; i < originVectors.length / 3; i++) {
    const c = [originVectors[3 * i], originVectors[3 * i + 2]];
    const [origins] = hexGrid(p.count, p.radius, c);
    centers.push(...origins);
  }
  const hMat = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    transparent: true,
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(geo.indices);
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(geo.vertices), 3)
  );
  geometry.setAttribute(
    "normal",
    new THREE.BufferAttribute(new Float32Array(geo.normals), 3)
  );
  geometry.setAttribute(
    "type",
    new THREE.BufferAttribute(new Int8Array([type]), 1)
  );
  const mesh = new THREE.InstancedMesh(geometry, hMat, centers.length / 3);
  for (let c = 0; c < centers.length / 3; c++) {
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    color.setHex(meshColors.value[type]);
    for (let j = 0; j < geo.vertices.length / 3; j++) {
      matrix.setPosition(
        geo.vertices[3 * j] + centers[3 * c],
        geo.vertices[3 * j + 1] + centers[3 * c + 1],
        geo.vertices[3 * j + 2] + centers[3 * c + 2]
      );
    }
    mesh.setMatrixAt(c, matrix);
    mesh.setColorAt(c, color);
  }
  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);

  return [centers];
}

function hexGrid(n = 1, radius = 1, origin = [0, 0]) {
  let x, y, yn, p;
  const gLayout = new Layout(radius, origin);
  // const coord = [];
  const pos = [];
  // x = -1; n = 1.5
  for (x = -n; x <= n; x++) {
    y = Math.max(-n, -x - n); // 0
    yn = Math.min(n, -x + n); // 1
    // y = 0 yn = 1
    for (y; y <= yn; y++) {
      p = gLayout.axialToPixel(x, y);
      pos.push(p[0], 0, p[1]);
      // coord.push(x, y);
    }
  }
  return [pos];
}

function onMouseClick(event: MouseEvent) {
  pointer.x = ((event.clientX - 210) / width.value) * 2 - 1;
  pointer.y = -((event.clientY - 0) / height.value) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  let meshes = scene.children.filter((d: any) => d instanceof THREE.Mesh);
  meshes = [...meshes, ...lineObj.children];
  const intersects = raycaster.intersectObjects(meshes, true);
  const intersect = intersects[0];

  if (objSelected.value) {
    for (const m of meshes) {
      if (m instanceof Line2) {
        m.material.color.setHex(meshColors.value[0]);
        m.material.needsUpdate = true;
      } else {
        const mType = m.geometry.getAttribute("type").array[0];
        m.setColorAt(
          objSelected.value.instanceId,
          new THREE.Color(meshColors.value[mType])
        );
        m.instanceColor.needsUpdate = true;
      }
    }
  }
  if (intersect) {
    showInfo.value = true;
    if (intersect.object instanceof Line2) {
      intersect.object.material.color.setHex(0x73b3b9);
      objSelected.value = intersect;
      type.value = 0;
      intersect.object.material.needsUpdate = true;
    } else {
      intersect.object.setColorAt(
        intersect.instanceId,
        new THREE.Color(0x73b3b9)
      );
      intersect.object.instanceColor.needsUpdate = true;
      objSelected.value = intersect;
      type.value =
        objSelected.value.object.geometry.getAttribute("type").array[0];
    }
  } else {
    if (objSelected.value) {
      for (const m of meshes) {
        if (m instanceof Line2) {
          m.material.color.setHex(meshColors.value[0]);
          m.material.needsUpdate = true;
        } else {
          const mType = m.geometry.getAttribute("type").array[0];
          m.setColorAt(
            objSelected.value.instanceId,
            new THREE.Color(meshColors.value[mType])
          );
          m.instanceColor.needsUpdate = true;
        }
      }
    }
    objSelected.value = null;
    type.value = NaN;
    showInfo.value = false;
  }
}

function animate(): void {
  animateCallbacks.forEach((fn) => fn());
  requestAnimationFrame(animate);
}
</script>
<style scoped>
.info-box {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #fff;
  color: #000;
  height: 700px;
  width: 300px;
  border-radius: 3px;
  padding: 10px;
}
.infrastructure-box {
  position: relative;
  width: 100%;
  height: 100%;
}
.map {
  width: 100%;
  height: 100%;
}
</style>
