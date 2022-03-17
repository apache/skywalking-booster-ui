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
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { store } from "./store";
import components from "@/components";
import i18n from "./locales";
import "element-plus/dist/index.css";
import "./styles/index.scss";
import ElementPlus from "element-plus";

const app = createApp(App);

app.use(ElementPlus, { size: "small", zIndex: 3000 });
app.use(components);
app.use(i18n);
app.use(store);
app.use(router).mount("#app");
