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
import type { App } from "vue";
import Icon from "./Icon.vue";
import TimePicker from "./TimePicker.vue";
import Selector from "./Selector.vue";
import Graph from "./Graph.vue";
import Radio from "./Radio.vue";
import SelectSingle from "./SelectSingle.vue";
import Tags from "./Tags.vue";
import VueGridLayout from "vue-grid-layout";

const components: Indexable = {
  Icon,
  TimePicker,
  VueGridLayout,
  Selector,
  Graph,
  Radio,
  SelectSingle,
  Tags,
};
const componentsName: string[] = Object.keys(components);

export default {
  install: (vue: App): void => {
    vue.use(components["VueGridLayout"]);
    componentsName.forEach((i) => {
      vue.component(i, components[i]);
    });
  },
};
