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

import { describe, it, expect } from "vitest";
import {
  is,
  isDef,
  isUnDef,
  isObject,
  isDate,
  isNull,
  isNullAndUnDef,
  isNullOrUnDef,
  isNumber,
  isPromise,
  isString,
  isFunction,
  isBoolean,
  isRegExp,
  isArray,
  isWindow,
  isElement,
  isMap,
  isEmptyObject,
} from "../is";

describe("is utility functions", () => {
  describe("is", () => {
    it("should return true for correct type checks", () => {
      expect(is("string", "String")).toBe(true);
      expect(is(123, "Number")).toBe(true);
      expect(is({}, "Object")).toBe(true);
      expect(is([], "Array")).toBe(true);
      expect(is(new Date(), "Date")).toBe(true);
      expect(is(/regex/, "RegExp")).toBe(true);
      expect(is(true, "Boolean")).toBe(true);
    });

    it("should return false for incorrect type checks", () => {
      expect(is("string", "Number")).toBe(false);
      expect(is(123, "String")).toBe(false);
      expect(is({}, "Array")).toBe(false);
    });
  });

  describe("isDef", () => {
    it("should return true for defined values", () => {
      expect(isDef("string")).toBe(true);
      expect(isDef(0)).toBe(true);
      expect(isDef(false)).toBe(true);
      expect(isDef(null)).toBe(true);
    });

    it("should return false for undefined values", () => {
      expect(isDef(undefined)).toBe(false);
    });
  });

  describe("isUnDef", () => {
    it("should return true for undefined values", () => {
      expect(isUnDef(undefined)).toBe(true);
    });

    it("should return false for defined values", () => {
      expect(isUnDef("string")).toBe(false);
      expect(isUnDef(0)).toBe(false);
      expect(isUnDef(false)).toBe(false);
      expect(isUnDef(null)).toBe(false);
    });
  });

  describe("isObject", () => {
    it("should return true for objects", () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: "value" })).toBe(true);
      expect(isObject(new Object())).toBe(true);
    });

    it("should return false for non-objects", () => {
      expect(isObject(null)).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject("string")).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(undefined)).toBe(false);
    });
  });

  describe("isDate", () => {
    it("should return true for Date objects", () => {
      expect(isDate(new Date())).toBe(true);
      expect(isDate(new Date("2023-01-01"))).toBe(true);
    });

    it("should return false for non-Date values", () => {
      expect(isDate("2023-01-01")).toBe(false);
      expect(isDate(123)).toBe(false);
      expect(isDate({})).toBe(false);
      expect(isDate(null)).toBe(false);
    });
  });

  describe("isNull", () => {
    it("should return true for null", () => {
      expect(isNull(null)).toBe(true);
    });

    it("should return false for non-null values", () => {
      expect(isNull(undefined)).toBe(false);
      expect(isNull("string")).toBe(false);
      expect(isNull(0)).toBe(false);
      expect(isNull({})).toBe(false);
    });
  });

  describe("isNullAndUnDef", () => {
    it("should return true for null and undefined", () => {
      expect(isNullAndUnDef(undefined)).toBe(true);
      expect(isNullAndUnDef(null)).toBe(true);
    });

    it("should return false for other values", () => {
      expect(isNullAndUnDef("string")).toBe(false);
      expect(isNullAndUnDef(0)).toBe(false);
      expect(isNullAndUnDef({})).toBe(false);
    });
  });

  describe("isNullOrUnDef", () => {
    it("should return true for null or undefined", () => {
      expect(isNullOrUnDef(null)).toBe(true);
      expect(isNullOrUnDef(undefined)).toBe(true);
    });

    it("should return false for other values", () => {
      expect(isNullOrUnDef("string")).toBe(false);
      expect(isNullOrUnDef(0)).toBe(false);
      expect(isNullOrUnDef({})).toBe(false);
    });
  });

  describe("isNumber", () => {
    it("should return true for numbers", () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-123)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
    });

    it("should return false for non-numbers", () => {
      expect(isNumber("123")).toBe(false);
      expect(isNumber({})).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
    });
  });

  describe("isPromise", () => {
    it("should return true for promises", () => {
      expect(isPromise(Promise.resolve())).toBe(true);
      expect(isPromise(new Promise(() => {}))).toBe(true);
    });

    it("should return false for non-promises", () => {
      expect(isPromise({})).toBe(false);
      expect(isPromise({ then: "not a function" })).toBe(false);
      expect(isPromise("string")).toBe(false);
      expect(isPromise(123)).toBe(false);
    });
  });

  describe("isString", () => {
    it("should return true for strings", () => {
      expect(isString("hello")).toBe(true);
      expect(isString("")).toBe(true);
      expect(isString(String("hello"))).toBe(true);
    });

    it("should return false for non-strings", () => {
      expect(isString(123)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
    });
  });

  describe("isFunction", () => {
    it("should return true for functions", () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(function () {})).toBe(true);
      expect(isFunction(async () => {})).toBe(true);
    });

    it("should return false for non-functions", () => {
      expect(isFunction("string")).toBe(false);
      expect(isFunction(123)).toBe(false);
      expect(isFunction({})).toBe(false);
      expect(isFunction(null)).toBe(false);
    });
  });

  describe("isBoolean", () => {
    it("should return true for booleans", () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean(Boolean(true))).toBe(true);
    });

    it("should return false for non-booleans", () => {
      expect(isBoolean("true")).toBe(false);
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean({})).toBe(false);
      expect(isBoolean(null)).toBe(false);
    });
  });

  describe("isRegExp", () => {
    it("should return true for regular expressions", () => {
      expect(isRegExp(/regex/)).toBe(true);
      expect(isRegExp(new RegExp("regex"))).toBe(true);
    });

    it("should return false for non-regex values", () => {
      expect(isRegExp("regex")).toBe(false);
      expect(isRegExp({})).toBe(false);
      expect(isRegExp(null)).toBe(false);
    });
  });

  describe("isArray", () => {
    it("should return true for arrays", () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray(new Array())).toBe(true);
    });

    it("should return false for non-arrays", () => {
      expect(isArray({})).toBe(false);
      expect(isArray("string")).toBe(false);
      expect(isArray(123)).toBe(false);
      expect(isArray(null)).toBe(false);
    });
  });

  describe("isWindow", () => {
    it("should return true for window object", () => {
      expect(isWindow(window)).toBe(true);
    });

    it("should return false for non-window objects", () => {
      expect(isWindow({})).toBe(false);
      expect(isWindow(null)).toBe(false);
      expect(isWindow(undefined)).toBe(false);
    });
  });

  describe("isElement", () => {
    it("should return true for DOM elements", () => {
      const div = document.createElement("div");
      expect(isElement(div)).toBe(true);
    });

    it("should return false for non-elements", () => {
      expect(isElement({})).toBe(false);
      expect(isElement({ tagName: "div" })).toBe(true); // Objects with tagName are considered elements
      expect(isElement(null)).toBe(false);
    });
  });

  describe("isMap", () => {
    it("should return true for Map objects", () => {
      expect(isMap(new Map())).toBe(true);
      expect(isMap(new Map([["key", "value"]]))).toBe(true);
    });

    it("should return false for non-Map objects", () => {
      expect(isMap({})).toBe(false);
      expect(isMap([])).toBe(false);
      expect(isMap(null)).toBe(false);
    });
  });

  describe("isEmptyObject", () => {
    it("should return true for empty objects", () => {
      expect(isEmptyObject({})).toBe(true);
    });

    it("should return false for non-empty objects", () => {
      expect(isEmptyObject({ key: "value" })).toBe(false);
      expect(isEmptyObject({ length: 0 })).toBe(false);
    });

    it("should return false for non-objects", () => {
      expect(isEmptyObject([])).toBe(false);
      expect(isEmptyObject("string")).toBe(false);
      expect(isEmptyObject(123)).toBe(false);
      expect(isEmptyObject(null)).toBe(false);
    });
  });
});
