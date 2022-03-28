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
  },
  configureWebpack: (config) => {
    config.optimization = {
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          echarts: {
            name: "echarts",
            test: /[\\/]node_modules[\\/]echarts[\\/]/,
            priority: 1,
          },
          elementPlus: {
            name: "element-plus",
            test: /[\\/]node_modules[\\/]element-plus[\\/]/,
            priority: 2,
          },
          three: {
            name: "three",
            test: /[\\/]node_modules[\\/]three[\\/]/,
            priority: 3,
          },
        },
      },
    };
  },
};
