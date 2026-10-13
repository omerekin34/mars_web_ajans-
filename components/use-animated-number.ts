"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

export function useAnimatedNumber(value: number) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);
  displayRef.current = display;

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }

    const from = displayRef.current;
    if (from === value) return;

    const start = performance.now();
    const duration = 450;
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduce, value]);

  return display;
}
