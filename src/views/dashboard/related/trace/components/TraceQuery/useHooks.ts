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
import { ref } from "vue";

export const adjustPercentValue = (value: number) => {
  if (value <= 0) {
    return 0;
  }
  if (value >= 100) {
    return 100;
  }
  return value;
};

const calculateX = (parentRect: DOMRect, x: number, opositeX: number, isSmallerThanOpositeX: boolean) => {
  let value = ((x - parentRect.left) / (parentRect.right - parentRect.left)) * 100;
  if (isSmallerThanOpositeX) {
    if (value >= opositeX) {
      value = opositeX - 1;
    }
  } else if (value <= opositeX) {
    value = opositeX + 1;
  }
  return adjustPercentValue(value);
};

export const useRangeTimestampHandler = ({
  rootEl,
  minTimestamp,
  maxTimestamp,
  opositeX,
  isSmallerThanOpositeX,
  setTimestamp,
}: {
  rootEl: SVGSVGElement | null;
  minTimestamp: number;
  maxTimestamp: number;
  opositeX: number;
  isSmallerThanOpositeX: boolean;
  setTimestamp: (value: number) => void;
}) => {
  const currentX = ref<number>();
  const mouseDownX = ref<number>();
  const isDragging = ref(false);

  const onMouseMove = (e: MouseEvent) => {
    if (!rootEl) {
      return;
    }
    const x = calculateX(rootEl.getBoundingClientRect(), e.pageX, opositeX, isSmallerThanOpositeX);
    currentX.value = x;
  };

  const onMouseUp = (e: MouseEvent) => {
    if (!rootEl) {
      return;
    }
    const x = calculateX(rootEl.getBoundingClientRect(), e.pageX, opositeX, isSmallerThanOpositeX);
    setTimestamp((x / 100) * (maxTimestamp - minTimestamp) + minTimestamp);
    currentX.value = undefined;
    mouseDownX.value = undefined;
    isDragging.value = false;

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  const onMouseDown = (e: MouseEvent) => {
    if (!rootEl) {
      return;
    }
    const x = calculateX(
      rootEl.getBoundingClientRect(),
      (e.currentTarget as SVGRectElement).getBoundingClientRect().x + 3,
      opositeX,
      isSmallerThanOpositeX,
    );
    currentX.value = x;
    mouseDownX.value = x;
    isDragging.value = true;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return { currentX, mouseDownX, onMouseDown, isDragging };
};
