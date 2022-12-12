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
import type { AxiosPromise, AxiosResponse } from "axios";
import axios from "axios";
import { cancelToken } from "@/utils/cancelToken";
import * as app from "./query/app";
import * as selector from "./query/selector";
import * as dashboard from "./query/dashboard";
import * as topology from "./query/topology";
import * as trace from "./query/trace";
import * as log from "./query/log";
import * as profile from "./query/profile";
import * as alarm from "./query/alarm";
import * as event from "./query/event";
import * as ebpf from "./query/ebpf";
import * as demandLog from "./query/demand-log";

const query: { [key: string]: string } = {
  ...app,
  ...selector,
  ...dashboard,
  ...topology,
  ...trace,
  ...log,
  ...profile,
  ...alarm,
  ...event,
  ...ebpf,
  ...demandLog,
};
class Graphql {
  private queryData = "";
  public query(queryData: string) {
    this.queryData = queryData;
    return this;
  }
  public params(variablesData: unknown): AxiosPromise<void> {
    return axios
      .post(
        "/graphql",
        {
          query: query[this.queryData],
          variables: variablesData,
        },
        { cancelToken: cancelToken() },
      )
      .then((res: AxiosResponse) => {
        if (res.data.errors) {
          res.data.errors = res.data.errors.map((e: { message: string }) => e.message).join(" ");
        }
        return res;
      })
      .catch((err: Error) => {
        throw err;
      });
  }
}

export default new Graphql();
