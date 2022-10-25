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

export default [
  {
    path: "",
    name: "General",
    meta: {
      title: "general",
      icon: "chart",
      hasGroup: true,
    },
    children: [
      {
        path: "/general",
        name: "GeneralServices",
        meta: {
          title: "services",
          layer: "GENERAL",
        },
      },
      {
        path: "/general/tab/:activeTabIndex",
        name: "GeneralServicesActiveTabIndex",
        meta: {
          notShow: true,
          layer: "GENERAL",
        },
      },
      {
        path: "/database",
        name: "VirtualDatabase",
        meta: {
          title: "virtualDatabase",
          layer: "VIRTUAL_DATABASE",
        },
      },
      {
        path: "/database/tab/:activeTabIndex",
        name: "VirtualDatabaseActiveTabIndex",
        meta: {
          notShow: true,
          layer: "VIRTUAL_DATABASE",
        },
      },
      {
        path: "/cache",
        name: "VirtualCache",
        meta: {
          title: "virtualCache",
          layer: "VIRTUAL_CACHE",
        },
      },
      {
        path: "/cache/tab/:activeTabIndex",
        name: "VirtualCacheActiveTabIndex",
        meta: {
          notShow: true,
          layer: "VIRTUAL_CACHE",
        },
      },
      {
        path: "/mq",
        name: "VirtualMQ",
        meta: {
          title: "virtualMQ",
          layer: "VIRTUAL_MQ",
        },
      },
      {
        path: "/mq/tab/:activeTabIndex",
        name: "VirtualMQActiveTabIndex",
        meta: {
          notShow: true,
          layer: "VIRTUAL_MQ",
        },
      },
    ],
  },
];
