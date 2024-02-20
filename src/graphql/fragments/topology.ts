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
export const ServicesTopology = {
  variable: "$duration: Duration!, $serviceIds: [ID!]!",
  query: `
  topology: getServicesTopology(duration: $duration, serviceIds: $serviceIds) {
    nodes {
      id
      name
      type
      isReal
      layers
    }
    calls {
      id
      source
      detectPoints
      target
    }
  }`,
};
export const EndpointTopology = {
  variable: ["$endpointId: ID!", "$duration: Duration!"],
  query: `
  topology: getEndpointDependencies(endpointId: $endpointId, duration: $duration) {
    nodes {
      id
      name
      serviceId
      serviceName
      type
      isReal
    }
    calls {
      id
      source
      target
      detectPoints
    }
  }`,
};
export const InstanceTopology = {
  variable: "$clientServiceId: ID!, $serverServiceId: ID!, $duration: Duration!",
  query: `
  topology: getServiceInstanceTopology(clientServiceId: $clientServiceId,
    serverServiceId: $serverServiceId, duration: $duration) {
    nodes {
      id
      name
      type
      isReal
      serviceName
      serviceId
    }
    calls {
      id
      source
      detectPoints
      target
    }
  }
`,
};
export const ProcessTopology = {
  variable: "$serviceInstanceId: ID!, $duration: Duration!",
  query: `
  topology: getProcessTopology(serviceInstanceId: $serviceInstanceId,
    duration: $duration) {
    nodes {
      id
      name
      isReal
      serviceName
      serviceId
      serviceInstanceId
      serviceInstanceName
    }
    calls {
      id
      source
      detectPoints
      target
      sourceComponents
      targetComponents
    }
  }
`,
};
export const HierarchyServiceTopology = {
  variable: "$serviceId: ID!, $layer: String!",
  query: `
  hierarchyServiceTopology: getServiceHierarchy(serviceId: $serviceId, layer: $layer) {
    relations {
      upperService {
        id
        name
        layer
        normal
      }
      lowerService {
        id
        name
        layer
        normal
      }
    }
  }`,
};
export const HierarchyInstanceTopology = {
  variable: "$instanceId: ID!, $layer: String!",
  query: `
  hierarchyInstanceTopology: getInstanceHierarchy(instanceId: $instanceId, layer: $layer) {
    relations {
      upperInstance {
        id
        name
        layer
        normal
        serviceName
        serviceId
      }
      lowerInstance {
        id
        name
        layer
        normal
        serviceName
        serviceId
      }
    }
  }`,
};

export const ListLayerLevels = {
  query: `
  levels: listLayerLevels {
    layer
    level
  }
  `,
};
