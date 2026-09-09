"use client";

import { Turnstile } from "@marsidev/react-turnstile";

export function TurnstileField({
  siteKey,
  onToken,
  resetKey = 0,
}: {
  siteKey: string;
  onToken: (token: string) => void;
  resetKey?: number;
}) {
  if (!siteKey) return null;

  return (
    <Turnstile
      key={resetKey}
      siteKey={siteKey}
      options={{ theme: "dark", size: "flexible" }}
      onSuccess={onToken}
      onExpire={() => onToken("")}
      onError={() => onToken("")}
      onTimeout={() => onToken("")}
    />
  );
}
