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

export interface Call {
  source: string | any;
  target: string | any;
  id: string;
  detectPoints: string[];
  type?: string;
  sourceObj?: any;
  targetObj?: any;
  value?: number;
  lowerArc?: boolean;
  sourceComponents: string[];
  targetComponents: string[];
  sourceX?: number;
  sourceY?: number;
  targetY?: number;
  targetX?: number;
}
export interface HierarchyNode {
  id: string;
  name: string;
  layer: string;
  level?: number;
  key: string;
}
export interface Node {
  id: string;
  name: string;
  type: string;
  isReal: boolean;
  layers: string[];
  serviceName?: string;
  height?: number;
  width?: number;
  x?: number;
  y?: number;
  level?: number;
  l?: number;
}

export interface ServiceHierarchy {
  relations: HierarchyServiceRelation[];
}

export interface HierarchyServiceRelation {
  upperService: HierarchyRelated;
  lowerService: HierarchyRelated;
}

type HierarchyRelated = {
  id: string;
  name: string;
  layer: string;
};

export interface InstanceHierarchy {
  relations: HierarchyInstanceRelation[];
}

export interface HierarchyInstanceRelation {
  upperInstance: HierarchyRelated;
  lowerInstance: HierarchyRelated;
}
