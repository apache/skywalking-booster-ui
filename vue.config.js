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

const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");

module.exports = {
  outputDir: "dist",
  productionSourceMap: false,
  devServer: {
    proxy: {
      "/graphql": {
        target: `${process.env.SW_PROXY_TARGET || "http://127.0.0.1:12800"}`,
        changeOrigin: true,
      },
    },
  },
  css: {
    extract: { ignoreOrder: true },
  },
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "Apache SkyWalking";
      return args;
    });
    const svgRule = config.module.rule("svg");
    svgRule.uses.clear();
    svgRule
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({ symbolId: "[name]" });
    config.resolve.alias.set("vue-i18n", "vue-i18n/dist/vue-i18n.cjs.js");
    if (process.env.NODE_ENV === "development") {
      config.plugins.delete("preload");
    }
  },
  configureWebpack: (config) => {
    config.performance = {
      hints: false,
    };
    config.optimization = {
      splitChunks: {
        chunks: "all",
        minSize: 20000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          echarts: {
            name: "echarts",
            test: /[\\/]node_modules[\\/]echarts|zrender[\\/]/,
            priority: 30,
          },
          monacoEditor: {
            name: "monaco-editor",
            test: /[\\/]node_modules[\\/]monaco-editor[\\/]/,
            priority: 40,
          },
          elementPlus: {
            name: "element-plus",
            test: /[\\/]node_modules[\\/]element-plus|@element-plus[\\/]/,
            priority: 10,
          },
          defaultVendors: {
            name: "chunk-vendors",
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            chunks: "async",
          },
          default: {
            name: "chunk-commons",
            minSize: 0,
            minChunks: 2,
            priority: -20,
          },
        },
      },
    };
    config.plugins.push(
      AutoImport({
        imports: ["vue"],
        resolvers: [
          ElementPlusResolver({
            importStyle: "css",
            exclude: new RegExp(/^(?!.*loading-directive).*$/),
          }),
        ],
        dts: "./src/types/auto-imports.d.ts",
      }),
      Components({
        resolvers: [ElementPlusResolver({ importStyle: "css" })],
        dts: "./src/types/components.d.ts",
      }),
      new MonacoWebpackPlugin()
    );
  },
};
