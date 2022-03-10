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
const getLocalTime = (utc: string, time: Date): Date => {
  const utcArr = utc.split(":");
  const utcHour = isNaN(Number(utcArr[0])) ? 0 : Number(utcArr[0]);
  const utcMin = isNaN(Number(utcArr[1])) ? 0 : Number(utcArr[1]);
  const d = new Date(time);
  const len = d.getTime();
  const offset = d.getTimezoneOffset() * 60000;
  const utcTime = len + offset;
  return new Date(utcTime + 3600000 * utcHour + utcMin * 60000);
};

export default getLocalTime;
