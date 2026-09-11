"use client";

import { useState } from "react";

export function RecapShare() {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.origin + "/";
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Así cerró Ecos en Yaguarón",
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        return;
      }
    }
  }

  return (
    <button type="button" onClick={share} className="btn-primary">
      {copied ? "Enlace copiado" : "Compartir el acta"}
    </button>
  );
}
