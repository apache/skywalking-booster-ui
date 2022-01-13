<!-- Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. -->
<template>
  <input v-show="!imgUrl" type="file" @change="fileChange" accept="image/*" />
  <img v-if="imgUrl" :src="imgUrl" alt="" />
</template>
<script lang="ts" setup>
import { ref } from "vue";
const imgUrl = ref<string>("");
const fileChange = (e: any) => {
  const fileList = e.target.files;
  if (fileList.length === 0) {
    imgUrl.value = "";
    return;
  }
  const file = fileList[0];
  const reader = new FileReader();
  reader.onload = (event: any) => {
    imgUrl.value = event.target.result;
  };
  reader.readAsDataURL(file);
};
</script>
