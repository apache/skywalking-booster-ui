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
import Mock from "mockjs";

const Random = Mock.Random;
const nodes = Mock.mock({
  "nodes|500": [
    {
      //id
      id: "@guid",
      name: "@name",
      "type|1": ["ActiveMQ", "activemq-consumer", "H2", "APISIX", "Express", "USER", "Flash"],
      "isReal|1": [true, false],
    },
  ],
});
const calls = Mock.mock({
  "links|500": [
    {
      //id
      id: "@guid",
      detectPoints: ["SERVER", "CLIENT"],
      source: function () {
        const d = Random.integer(0, 250);
        return nodes.nodes[d].id;
      },
      target: function () {
        const d = Random.integer(250, 499);
        return nodes.nodes[d].id;
      },
    },
  ],
});
const callsMock = calls.links;
const nodesMock = nodes.nodes;
export { callsMock, nodesMock };
