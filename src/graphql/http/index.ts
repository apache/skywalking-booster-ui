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
import { httpQuery } from "../base";
import { HttpURL } from "./url";

export default async function fetchQuery({
  method,
  json,
  path,
}: {
  method: string;
  json?: Record<string, unknown>;
  path: string;
}) {
  const upperMethod = method.toUpperCase();
  let url = (HttpURL as Record<string, string>)[path];
  let body: unknown | undefined = json;

  if (upperMethod === "GET" && json && typeof json === "object") {
    const params = new URLSearchParams();
    const stringifyValue = (val: unknown): string => {
      if (val instanceof Date) return val.toISOString();
      if (typeof val === "object") return JSON.stringify(val);
      return String(val);
    };
    for (const [key, value] of Object.entries(json)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        for (const v of value as unknown[]) params.append(key, stringifyValue(v));
        continue;
      }
      params.append(key, stringifyValue(value));
    }
    const queryString = params.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
    body = undefined;
  }

  const response = await httpQuery({
    method: upperMethod,
    json: body,
    url,
  });
  if (response.errors) {
    response.errors = response.errors.map((e: { message: string }) => e.message).join(" ");
  }
  return response;
}
