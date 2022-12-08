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
import general from "./general";
import serviceMesh from "./serviceMesh";
import database from "./database";
import infrastructure from "./infrastructure";
import selfObservability from "./selfObservability";
import functions from "./functions";
import browser from "./browser";
import k8s from "./k8s";
import gateway from "./gateway";
import aws from "./aws";

export default [
  ...general,
  ...serviceMesh,
  ...functions,
  ...k8s,
  ...infrastructure,
  ...aws,
  ...browser,
  ...gateway,
  ...database,
  ...selfObservability,
];
