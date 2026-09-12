"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { isClosingWindow, msUntil } from "@/lib/pulse";

export function SurveyPhaseWatcher({
  initiallyOpen,
  initiallyClosing,
  disabled = false,
}: {
  initiallyOpen: boolean;
  initiallyClosing: boolean;
  disabled?: boolean;
}) {
  const router = useRouter();
  const openRef = useRef(initiallyOpen);
  const closingRef = useRef(initiallyClosing);

  useEffect(() => {
    openRef.current = initiallyOpen;
    closingRef.current = initiallyClosing;
  }, [initiallyClosing, initiallyOpen]);

  useEffect(() => {
    if (disabled || !initiallyOpen) return;

    const poll = async () => {
      try {
        const res = await fetch("/api/status", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { isOpen?: boolean; closesAt?: string };
        const isOpen = Boolean(data.isOpen);
        const remaining = data.closesAt ? msUntil(data.closesAt) : 0;
        const closing = isOpen && isClosingWindow(remaining);

        if (openRef.current && !isOpen) {
          openRef.current = false;
          router.refresh();
          return;
        }
        if (!closingRef.current && closing) {
          closingRef.current = true;
          router.refresh();
        }
      } catch {
        return;
      }
    };

    const id = window.setInterval(poll, 15_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [disabled, initiallyOpen, router]);

  return null;
}
