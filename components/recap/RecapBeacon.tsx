"use client";

import { useEffect } from "react";
import { recordRecapEvent } from "@/lib/recap";

export function RecapBeacon() {
  useEffect(() => {
    recordRecapEvent("recap_view");
  }, []);
  return null;
}
