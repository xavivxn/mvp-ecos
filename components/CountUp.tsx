"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({ value, digits = 0, suffix = "" }: { value: number; digits?: number; suffix?: string }) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    const duration = 700;
    let frame = 0;
    const tick = (t: number) => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const p = reduce ? 1 : Math.min(1, (t - start) / duration);
      const eased = 1 - (1 - p) ** 3;
      const next = from + (value - from) * eased;
      setShown(next);
      if (p < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span className="tabular-nums">
      {shown.toLocaleString("es-PY", {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      })}
      {suffix}
    </span>
  );
}
