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

// Service color palette for consistent coloring across trace visualizations
export const ServicePalette = [
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
  "#f97316", // orange-500
  "#ec4899", // pink-500
  "#6366f1", // indigo-500
  "#14b8a6", // teal-500
  "#a855f7", // purple-500
  "#22c55e", // green-500
  "#eab308", // yellow-500
  "#f43f5e", // rose-500
  "#0ea5e9", // sky-500
  "#8b5a2b", // brown-500
  "#64748b", // slate-500
  "#dc2626", // red-600
  "#059669", // emerald-600
  "#d97706", // amber-600
  "#7c3aed", // violet-600
  "#0891b2", // cyan-600
  "#65a30d", // lime-600
  "#ea580ce6", // orange-600
  "#db2777", // pink-600
  "#4f46e5", // indigo-600
  "#0d9488", // teal-600
  "#9333ea", // purple-600
  "#16a34a", // green-600
  "#ca8a04", // yellow-600
  "#e11d48", // rose-600
  "#0284c7", // sky-600
  "#92400e", // brown-600
  "#475569", // slate-600
];
// Reuse the same service color function from TracesTable
function generateHash(str: string) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i += 1) {
    const c = str.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash); // Only positive number.
}

export function getServiceColor(serviceName: string): string {
  if (!serviceName) return "#eee";
  const hash = generateHash(serviceName);
  return ServicePalette[hash % ServicePalette.length];
}
