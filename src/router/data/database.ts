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
    name: "Database",
    meta: {
      title: "database",
      icon: "storage",
      hasGroup: true,
    },
    redirect: "/mySQL",
    children: [
      {
        path: "/mySQL",
        name: "MySQL",
        meta: {
          title: "mySQL",
          layer: "MYSQL",
        },
      },
      {
        path: "/mySQL/tab/:activeTabIndex",
        name: "MySQLActiveTabIndex",
        meta: {
          notShow: true,
          layer: "MYSQL",
        },
      },
      {
        path: "/postgreSQL",
        name: "PostgreSQL",
        meta: {
          title: "postgreSQL",
          layer: "POSTGRESQL",
        },
      },
      {
        path: "/postgreSQL/tab/:activeTabIndex",
        name: "PostgreSQLActiveTabIndex",
        meta: {
          notShow: true,
          layer: "POSTGRESQL",
        },
      },
      {
        path: "/aws-dynamodb",
        name: "AWSCloudDynamoDB",
        meta: {
          title: "AWSCloudDynamoDB",
          layer: "AWS_DYNAMODB",
        },
      },
      {
        path: "/aws-dynamodb/tab/:activeTabIndex",
        name: "DynamoDBActiveTabIndex",
        meta: {
          notShow: true,
          layer: "AWS_DYNAMODB",
        },
      },
    ],
  },
];
