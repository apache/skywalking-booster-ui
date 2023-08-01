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

import type { UserConfig, ConfigEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { loadEnv } from "vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

const OUTPUT_DIR = "dist";
const pathSrc = path.resolve(__dirname, "./src");
// https://vitejs.dev/config/
export default ({ mode }: ConfigEnv): UserConfig => {
  const { VITE_SW_PROXY_TARGET } = loadEnv(mode, process.cwd());
  return {
    plugins: [
      vue(),
      vueJsx(),
      monacoEditorPlugin({}),
      AutoImport({
        imports: ["vue"],
        resolvers: [ElementPlusResolver()],
        dts: path.resolve(__dirname, "./src/types/auto-imports.d.ts"),
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: path.resolve(__dirname, "./src/types/components.d.ts"),
      }),
      createSvgIconsPlugin({
        // Specify the icon folder to be cached
        iconDirs: [path.resolve(__dirname, "./src/assets/icons")],
        // Specify symbolId format
        symbolId: "[name]",
      }),
    ],
    resolve: {
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
      alias: {
        "@": pathSrc,
        "vue-i18n": "vue-i18n/dist/vue-i18n.cjs.js",
      },
      preserveSymlinks: true,
    },
    css: {
      preprocessorOptions: {
        //define global scss variable
        scss: {
          additionalData: `@import "@/styles/light.scss";`,
        },
      },
    },
    server: {
      host: true,
      port: 3000,
      proxy: {
        "/graphql": {
          target: `${VITE_SW_PROXY_TARGET || "http://127.0.0.1:12800"}`,
          changeOrigin: true,
        },
      },
    },
    build: {
      target: "es2015",
      outDir: OUTPUT_DIR,
      manifest: false,
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]",
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("lodash")) {
                return "lodash";
              }
              if (id.includes("echarts")) {
                return "echarts";
              }
              if (id.includes("element-plus")) {
                return "element-plus";
              }
              if (id.includes("monaco-editor")) {
                return "monaco-editor";
              }
              if (id.includes("d3")) {
                return "d3";
              }
            }
          },
        },
      },
    },
  };
};
