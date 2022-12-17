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
  <svg
    class="icon"
    :class="{
      sm: size === 'sm',
      middle: size === 'middle',
      lg: size === 'lg',
      xl: size === 'xl',
      logo: size === 'logo',
      loading,
    }"
  >
    <use :href="`#${iconName}`"></use>
  </svg>
</template>
<script lang="ts" setup>
  /*global defineProps */
  defineProps({
    iconName: { type: String, default: "" },
    size: { type: String, default: "sm" },
    loading: { type: Boolean, default: false },
  });
</script>
<style lang="scss" scoped>
  .icon {
    width: 16px;
    height: 16px;
    vertical-align: middle;
    fill: currentColor;

    &.sm {
      width: 14px;
      height: 14px;
    }

    &.middle {
      width: 18px;
      height: 18px;
    }

    &.lg {
      width: 22px;
      height: 22px;
    }

    &.loading {
      animation: loading 1.5s linear infinite;
    }

    &.logo {
      height: 30px;
      width: 110px;
    }

    &.xl {
      height: 30px;
      width: 30px;
    }
  }
  @keyframes loading {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }

    to {
      -webkit-transform: rotate(1turn);
      transform: rotate(1turn);
    }
  }
</style>
