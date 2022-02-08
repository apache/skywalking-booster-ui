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
import { defineStore } from "pinia";
import { store } from "@/store";
import { Node, Call } from "@/types/topology";

interface TopologyState {
  node: Node | null;
  call: Call | null;
  calls: Call[];
  nodes: Node[];
}

export const topologyStore = defineStore({
  id: "topology",
  state: (): TopologyState => ({
    calls: [],
    nodes: [],
    node: null,
    call: null,
  }),
  actions: {
    setNode(node: Node) {
      this.node = node;
    },
    setLink(link: Call) {
      this.call = link;
    },
    setTopology(nodes: Node[], links: Call[]) {
      this.nodes = nodes;
      this.calls = links;
    },
  },
});

export function useTopologyStore(): any {
  return topologyStore(store);
}
