"use client";

import { useEffect, useState } from "react";
import {
  DAY_MS,
  msUntil,
  PREVIEW_CLOSE_PAUSE_MS,
  PREVIEW_CLOSE_REAL_MS,
  previewCloseRemaining,
} from "@/lib/pulse";

let sharedPreviewStartedAt: number | null = null;

function sharedPreviewStart(now = Date.now()) {
  if (sharedPreviewStartedAt == null) sharedPreviewStartedAt = now;
  const cycle = PREVIEW_CLOSE_REAL_MS + PREVIEW_CLOSE_PAUSE_MS;
  if (now - sharedPreviewStartedAt >= cycle) {
    sharedPreviewStartedAt = now;
  }
  return sharedPreviewStartedAt;
}

export function usePreviewRemaining(enabled: boolean) {
  const [remaining, setRemaining] = useState(DAY_MS);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const tick = () => {
      setRemaining(previewCloseRemaining(sharedPreviewStart()));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled]);

  return remaining;
}

export function useCloseRemaining(closesAt: string | null | undefined, preview = false) {
  const previewRemaining = usePreviewRemaining(preview);
  const [remaining, setRemaining] = useState(() => (closesAt ? msUntil(closesAt) : 0));

  useEffect(() => {
    if (preview || !closesAt) return;
    const tick = () => setRemaining(msUntil(closesAt));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [closesAt, preview]);

  return preview ? previewRemaining : remaining;
}
