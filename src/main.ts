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
import { store } from "./store";
import components from "@/components";
import i18n from "./locales";
import { useAppStoreWithOut } from "@/store/modules/app";
import "./styles/index.ts";
import "virtual:svg-icons-register";

const app = createApp(App);
const appStore = useAppStoreWithOut();

app.use(components);
app.use(i18n);
app.use(store);
mountApp();

async function mountApp() {
  await appStore.getActivateMenus();
  await appStore.queryOAPTimeInfo();

  const router = await import("./router");
  app.use(router.default).mount("#app");
}
