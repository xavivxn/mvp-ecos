"use client";

import { useEffect, useRef, useState } from "react";
import type { BoardData } from "@/lib/results";

export function useResultsPoll(initial: BoardData | null) {
  const [board, setBoard] = useState(initial);
  const [age, setAge] = useState(0);
  const updatedAtRef = useRef(0);

  useEffect(() => {
    if (!initial) return;
    updatedAtRef.current = Date.now();
    const poll = window.setInterval(async () => {
      try {
        const res = await fetch("/api/results", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.ok) {
          setBoard(data);
          updatedAtRef.current = Date.now();
          setAge(0);
        }
      } catch {
        return;
      }
    }, 15_000);
    const tick = window.setInterval(() => {
      setAge(Math.max(0, Math.round((Date.now() - updatedAtRef.current) / 1000)));
    }, 1000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, [initial]);

  return { board, age };
}
