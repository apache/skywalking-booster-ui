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
  <div :class="`${state.pre}`">
    <div :class="`${state.pre}-head`">
      <a :class="`${state.pre}-prev-decade-btn`" v-show="state.showYears" @click="state.year -= 10">
        <Icon size="sm" iconName="angle-double-left" />
      </a>
      <a :class="`${state.pre}-prev-year-btn`" v-show="!state.showYears" @click="state.year--">
        <Icon size="sm" iconName="angle-double-left" />
      </a>
      <a :class="`${state.pre}-prev-month-btn`" v-show="!state.showYears && !state.showMonths" @click="pm">
        <Icon size="middle" iconName="chevron-left" />
      </a>
      <a :class="`${state.pre}-year-select`" v-show="state.showYears">{{ ys + "-" + ye }}</a>
      <template v-if="local.yearSuffix">
        <a :class="`${state.pre}-year-select`" @click="state.showYears = !state.showYears" v-show="!state.showYears"
          >{{ state.year }}{{ local.yearSuffix }}</a
        >
        <a
          :class="`${state.pre}-month-select`"
          @click="state.showMonths = !state.showMonths"
          v-show="!state.showYears && !state.showMonths"
          >{{ local.monthsHead[state.month] }}</a
        >
      </template>
      <template v-else>
        <a
          :class="`${state.pre}-month-select`"
          @click="state.showMonths = !state.showMonths"
          v-show="!state.showYears && !state.showMonths"
          >{{ local.monthsHead[state.month] }}</a
        >
        <a :class="`${state.pre}-year-select`" @click="state.showYears = !state.showYears" v-show="!state.showYears">{{
          state.year
        }}</a>
      </template>
      <a :class="`${state.pre}-next-month-btn`" v-show="!state.showYears && !state.showMonths" @click="nm">
        <Icon size="middle" iconName="chevron-right" />
      </a>
      <a :class="`${state.pre}-next-year-btn`" v-show="!state.showYears" @click="state.year++">
        <Icon size="sm" iconName="angle-double-right" />
      </a>
      <a :class="`${state.pre}-next-decade-btn`" v-show="state.showYears" @click="state.year += 10">
        <Icon size="sm" iconName="angle-double-right" />
      </a>
    </div>
    <div :class="`${state.pre}-body`">
      <div :class="`${state.pre}-days`">
        <a :class="`${state.pre}-week`" v-for="i in local.weeks" :key="i">{{ i }}</a>
        <a
          v-for="(j, i) in days"
          @click="is($event) && ((state.day = j.i), ok(j))"
          :class="[
            j.p || j.n ? `${state.pre}-date-out` : '',
            status(j.y, j.m, j.i, state.hour, state.minute, state.second, 'YYYYMMDD'),
          ]"
          :key="i"
          >{{ j.i }}</a
        >
      </div>
      <div :class="`${state.pre}-months`" v-show="state.showMonths">
        <a
          v-for="(i, j) in local.months"
          @click="is($event) && ((state.showMonths = state.m === 'M'), (state.month = j), state.m === 'M' && ok('m'))"
          :class="[status(state.year, j, state.day, state.hour, state.minute, state.second, 'YYYYMM')]"
          :key="j"
          >{{ i }}</a
        >
      </div>
      <div :class="`${state.pre}-years`" v-show="state.showYears">
        <a
          v-for="(i, j) in years"
          @click="is($event) && ((state.showYears = state.m === 'Y'), (state.year = i), state.m === 'Y' && ok('y'))"
          :class="[
            j === 0 || j === 11 ? `${state.pre}-date-out` : '',
            status(i, state.month, state.day, state.hour, state.minute, state.second, 'YYYY'),
          ]"
          :key="j"
          >{{ i }}</a
        >
      </div>
      <div :class="`${state.pre}-hours scroll_hide`" v-show="state.showHours">
        <div :class="`${state.pre}-title`">{{ local.hourTip }}</div>
        <div class="scroll_hide calendar-overflow">
          <a
            v-for="(j, i) in 24"
            @click="is($event) && ((state.showHours = false), (state.hour = i), ok('h'))"
            :class="[status(state.year, state.month, state.day, i, state.minute, state.second, 'YYYYMMDDHH')]"
            :key="i"
            >{{ i }}</a
          >
        </div>
      </div>
      <div :class="`${state.pre}-minutes`" v-show="state.showMinutes">
        <div :class="`${state.pre}-title`">{{ local.minuteTip }}</div>
        <div class="scroll_hide calendar-overflow">
          <a
            v-for="(j, i) in 60"
            @click="is($event) && ((state.showMinutes = false), (state.minute = i), ok('h'))"
            :class="[status(state.year, state.month, state.day, state.hour, i, state.second, 'YYYYMMDDHHmm')]"
            :key="i"
            >{{ i }}</a
          >
        </div>
      </div>
      <div :class="`${state.pre}-seconds`" v-show="state.showSeconds">
        <div :class="`${state.pre}-title`">{{ local.secondTip }}</div>
        <div class="scroll_hide calendar-overflow">
          <a
            v-for="(j, i) in 60"
            @click="is($event) && ((state.showSeconds = false), (state.second = i), ok('h'))"
            :class="[status(state.year, state.month, state.day, state.hour, state.minute, i, 'YYYYMMDDHHmmss')]"
            :key="i"
            >{{ i }}</a
          >
        </div>
      </div>
    </div>
    <div :class="`${state.pre}-foot`">
      <div :class="`${state.pre}-hour`">
        <a
          :title="local.hourTip"
          @click="(state.showHours = !state.showHours), (state.showMinutes = state.showSeconds = false)"
          :class="{ on: state.showHours }"
          >{{ dd(state.hour) }}</a
        >
        <span>:</span>
        <a
          :title="local.minuteTip"
          @click="(state.showMinutes = !state.showMinutes), (state.showHours = state.showSeconds = false)"
          :class="{ on: state.showMinutes }"
          >{{ dd(state.minute) }}</a
        >
        <span v-show="state.m !== 'D'">
          <span>:</span>
          <a
            :title="local.secondTip"
            @click="(state.showSeconds = !state.showSeconds), (state.showHours = state.showMinutes = false)"
            :class="{ on: state.showSeconds }"
            >{{ dd(state.second) }}</a
          >
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, watch, reactive } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  /*global defineProps, defineEmits, Indexable, Recordable*/
  const emit = defineEmits(["input", "setDates", "ok"]);
  const { t } = useI18n();
  const props = defineProps({
    value: { type: Date },
    left: { type: Boolean, default: false },
    right: { type: Boolean, default: false },
    dates: { type: Array as PropType<number[] | string[]>, default: () => [] },
    disabledDate: { type: Function, default: () => false },
    format: {
      type: String,
      default: "YYYY-MM-DD",
    },
  });
  const state = reactive({
    pre: "",
    m: "",
    showYears: false,
    showMonths: false,
    showHours: false,
    showMinutes: false,
    showSeconds: false,
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  });
  const get = (time: Date): Indexable => {
    return {
      year: time.getFullYear(),
      month: time.getMonth(),
      day: time.getDate(),
      hour: time.getHours(),
      minute: time.getMinutes(),
      second: time.getSeconds(),
    };
  };
  if (props.value) {
    const time = get(props.value);
    state.pre = "calendar";
    state.m = "D";
    state.showYears = false;
    state.showMonths = false;
    state.showHours = false;
    state.showMinutes = false;
    state.showSeconds = false;
    state.year = time.year;
    state.month = time.month;
    state.day = time.day;
    state.hour = time.hour;
    state.minute = time.minute;
    state.second = time.second;
  }
  watch(
    () => props.value,
    (val: Date | undefined) => {
      if (!val) {
        return;
      }
      const time = get(val);
      state.year = time.year;
      state.month = time.month;
      state.day = time.day;
      state.hour = time.hour;
      state.minute = time.minute;
      state.second = time.second;
    },
  );
  const parse = (num: number): number => {
    return num / 100000;
  };
  const start = computed(() => {
    return parse(Number(props.dates[0]));
  });
  const end = computed(() => {
    return parse(Number(props.dates[1]));
  });
  const ys = computed(() => {
    return Math.floor(state.year / 10) * 10;
  });
  const ye = computed(() => {
    return ys.value + 10;
  });
  const years = computed(() => {
    const arr = [];
    let start = ys.value - 1;
    while (arr.length < 12) {
      arr.push((start += 1));
    }
    return arr;
  });
  const local = computed(() => {
    return {
      dow: 1, // Monday is the first day of the week
      hourTip: t("hourTip"), // tip of select hour
      minuteTip: t("minuteTip"), // tip of select minute
      secondTip: t("secondTip"), // tip of select second
      yearSuffix: t("yearSuffix"), // format of head
      monthsHead: t("monthsHead").split("_"), // months of head
      months: t("months").split("_"), // months of panel
      weeks: t("weeks").split("_"), // weeks
      cancelTip: t("cancel"), // default text for cancel button
      submitTip: t("confirm"), // default text for submit button
      quarterHourCutTip: t("quarterHourCutTip"),
      halfHourCutTip: t("halfHourCutTip"),
      hourCutTip: t("hourCutTip"),
      dayCutTip: t("dayCutTip"),
      weekCutTip: t("weekCutTip"),
      monthCutTip: t("monthCutTip"),
    };
  });
  const days = computed(() => {
    const days = [];
    const year = state.year;
    const month = state.month;
    const time = new Date(year, month, 1);
    const dow = local.value.dow || 7;
    time.setDate(0); // switch to the last day of last month
    let lastDay = time.getDate();
    const week = time.getDay() || 7;
    let count = dow <= week ? week - dow + 1 : week + (7 - dow + 1);
    while (count > 0) {
      days.push({
        i: lastDay - count + 1,
        y: month > 0 ? year : year - 1,
        m: month > 0 ? month - 1 : 11,
        p: true,
      });
      count--;
    }
    time.setMonth(time.getMonth() + 2, 0); // switch to the last day of the current month
    lastDay = time.getDate();
    let i = 1;
    for (i = 1; i <= lastDay; i++) {
      days.push({
        i: i,
        y: year,
        m: month,
      });
    }
    for (i = 1; days.length < 42; i++) {
      days.push({
        i: i,
        y: month < 11 ? year : year + 1,
        m: month < 11 ? month + 1 : 0,
        n: true,
      });
    }
    return days;
  });
  const dd = (val: number) => ("0" + val).slice(-2);
  const status = (
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    format: string,
  ) => {
    const maxDay = new Date(year, month + 1, 0).getDate();
    const time: any = new Date(year, month, day > maxDay ? maxDay : day, hour, minute, second);
    const t = parse(time);
    const tf = (time?: Date, format?: any): string => {
      if (!time) {
        return "";
      }
      const year = time.getFullYear();
      const month = time.getMonth();
      const day = time.getDate();
      const hours24 = time.getHours();
      const hours = hours24 % 12 === 0 ? 12 : hours24 % 12;
      const minutes = time.getMinutes();
      const seconds = time.getSeconds();
      const milliseconds = time.getMilliseconds();
      const map: { [key: string]: string | number } = {
        YYYY: year,
        MM: dd(month + 1),
        MMM: local.value.months[month],
        MMMM: local.value.monthsHead[month],
        M: month + 1,
        DD: dd(day),
        D: day,
        HH: dd(hours24),
        H: hours24,
        hh: dd(hours),
        h: hours,
        mm: dd(minutes),
        m: minutes,
        ss: dd(seconds),
        s: seconds,
        S: milliseconds,
      };
      return (format || props.format).replace(/Y+|M+|D+|H+|h+|m+|s+|S+/g, (str: string) => map[str]);
    };
    const classObj: any = {};
    let flag = false;
    if (format === "YYYY") {
      flag = year === state.year;
    } else if (format === "YYYYMM") {
      flag = month === state.month;
    } else {
      flag = tf(props.value, format) === tf(time, format);
    }
    classObj[`${state.pre}-date`] = true;
    classObj[`${state.pre}-date-disabled`] = (props.right && t < start.value) || props.disabledDate(time, format);
    classObj[`${state.pre}-date-on`] = (props.left && t > start.value) || (props.right && t < end.value);
    classObj[`${state.pre}-date-selected`] = flag;
    return classObj;
  };
  const nm = () => {
    if (state.month < 11) {
      state.month++;
    } else {
      state.month = 0;
      state.year++;
    }
  };
  const pm = () => {
    if (state.month > 0) {
      state.month--;
    } else {
      state.month = 11;
      state.year--;
    }
  };
  const is = (e: Recordable) => {
    return e.target.className.indexOf(`${state.pre}-date-disabled`) === -1;
  };
  const ok = (info: any) => {
    let year = "";
    let month = "";
    let day = "";
    info && info.n && nm();
    info && info.p && pm();
    if (info === "h") {
      if (props.value) {
        const time = get(props.value);
        year = time.year;
        month = time.month;
      }
    } else if (info === "m" || info === "y") {
      day = "1";
    }
    const _time: Date = new Date(
      year ? Number(year) : state.year,
      month ? Number(month) : state.month,
      day ? Number(day) : state.day,
      state.hour,
      state.minute,
      state.second,
    );
    if (props.left && _time.getTime() / 100000 < end.value) {
      emit("setDates", _time, "left");
    }
    if (props.right && _time.getTime() / 100000 > start.value) {
      emit("setDates", _time, "right");
    }
    if (!(props.left || props.right)) {
      emit("setDates", _time);
    }
    emit("ok", info === "h");
  };
  onMounted(() => {
    const is = (c: string) => props.format.indexOf(c) !== -1;
    if (is("s") && is("m") && (is("h") || is("H"))) {
      state.m = "H";
    } else if (is("D")) {
      state.m = "D";
    } else if (is("M")) {
      state.m = "M";
      state.showMonths = true;
    } else if (is("Y")) {
      state.m = "Y";
      state.showYears = true;
    }
  });
</script>

<style lang="scss" scoped>
  .calendar {
    float: left;
    user-select: none;
    color: $font-color;
  }

  .calendar + .calendar {
    border-left: solid 1px var(--sw-border-color-light);
    margin-left: 5px;
    padding-left: 5px;
  }

  .calendar-head {
    line-height: 34px;
    height: 34px;
    text-align: center;
    position: relative;
  }

  .calendar-head a {
    color: var(--sw-topology-color);
    cursor: pointer;
    display: inline-block;
    text-align: center;
    position: absolute;
    padding: 0 5px;
    font-size: 16px;
  }

  .calendar-head a:hover {
    color: #3f97e3;
  }

  .calendar-head .calendar-year-select,
  .calendar-head .calendar-month-select {
    font-size: $font-size-smaller;
    padding: 0 2px;
    position: relative;
  }

  .calendar-prev-decade-btn,
  .calendar-prev-year-btn {
    left: 6px;
  }

  .calendar-prev-month-btn {
    left: 24px;
  }

  .calendar-next-decade-btn,
  .calendar-next-year-btn {
    right: 6px;
  }

  .calendar-next-month-btn {
    right: 24px;
  }

  .calendar-body {
    position: relative;
    width: 196px;
    height: 196px;
  }

  .calendar-days {
    width: 100%;
    height: 100%;
  }

  .calendar-week,
  .calendar-date {
    font-weight: normal;
    width: 14.28%;
    height: 14.28%;
    text-align: center;
    box-sizing: border-box;
    overflow: hidden;
    float: left;
  }

  .calendar-week::before,
  .calendar-date::before {
    content: "";
    display: inline-block;
    height: 100%;
    vertical-align: middle;
  }

  .calendar-date {
    cursor: pointer;
    line-height: 29px;
    transition: background-color 0.3s;
  }

  .calendar-date-out {
    color: $disabled-color;
  }

  .calendar-date:hover,
  .calendar-date-on {
    color: $font-color;
    background-color: $theme-background;
  }

  .calendar-date-selected,
  .calendar-date-selected:hover {
    color: $text-color;
    font-weight: bold;
    border-radius: 14px;
    background: $active-background;
  }

  .calendar-date-disabled {
    cursor: not-allowed !important;
    color: $disabled-color !important;
    background: $theme-background !important;
  }

  .calendar-foot {
    margin-top: 5px;
  }

  .calendar-hour {
    display: inline-block;
    border: 1px solid var(--sw-border-color-light);
    color: #9e9e9e;
  }

  .calendar-hour a {
    display: inline-block;
    padding: 2px 4px;
    cursor: pointer;
  }

  .calendar-hour a:hover,
  .calendar-hour a.on {
    color: #3f97e3;
  }

  .calendar-years,
  .calendar-months,
  .calendar-hours,
  .calendar-minutes,
  .calendar-seconds {
    width: 100%;
    height: 100%;
    position: absolute;
    background: $theme-background;
    left: 0;
    top: 0;
  }

  .calendar-months a {
    width: 33.33%;
    height: 25%;
  }

  .calendar-years a {
    width: 33.33%;
    height: 25%;
  }

  .calendar-overflow {
    overflow-x: scroll;
    height: 100%;
  }

  /* .calendar-hours a {
  width: 20%;
  height: 20%;
}

.calendar-minutes a,
.calendar-seconds a {
  width: 16.66%;
  height: 10%;
} */

  .calendar-title {
    margin-top: -30px;
    height: 30px;
    line-height: 30px;
    background: $theme-background;
    text-align: center;
    font-weight: bold;
  }
</style>
