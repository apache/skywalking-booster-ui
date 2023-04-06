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
const requireComponent = import.meta.glob("./technologies/*.png", { eager: true });
const requireTool = import.meta.glob("./tools/*.png", { eager: true });
const result: { [key: string]: string } = {};
const t: { [key: string]: string } = {};

function capitalizeFirstLetter(str: string) {
  return str.toUpperCase();
}
function validateFileName(str: string): string | undefined {
  if (/^\S+\.png$/.test(str)) {
    return str.replace(/^\S+\/(\w+)\.png$/, (rs, $1) => capitalizeFirstLetter($1));
  }
}
Object.keys(requireComponent).forEach((filePath: string) => {
  const fileName = validateFileName(filePath);
  if (fileName) {
    result[fileName] = (requireComponent as Indexable)[filePath].default;
  }
});
Object.keys(requireTool).forEach((filePath: string) => {
  const fileName = validateFileName(filePath);
  if (fileName) {
    t[fileName] = (requireTool as Indexable)[filePath].default;
  }
});

export default { ...result, ...t };
