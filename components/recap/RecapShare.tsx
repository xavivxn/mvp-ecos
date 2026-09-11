"use client";

import { useState } from "react";
import { recapShare, recordRecapEvent } from "@/lib/recap";

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function RecapShare() {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.origin + "/";
    recordRecapEvent("share_click");
    try {
      if (navigator.share) {
        await navigator.share({
          title: recapShare.title,
          text: recapShare.text,
          url,
        });
        recordRecapEvent("share_native");
        return;
      }
      await navigator.clipboard.writeText(`${recapShare.text} ${url}`);
      recordRecapEvent("share_copy");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      if (isAbort(error)) return;
      try {
        await navigator.clipboard.writeText(`${recapShare.text} ${url}`);
        recordRecapEvent("share_copy");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        return;
      }
    }
  }

  return (
    <button type="button" onClick={() => void share()} className="btn-primary">
      {copied ? "Enlace copiado" : "Compartir el acta"}
    </button>
  );
}
