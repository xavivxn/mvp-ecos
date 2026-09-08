"use client";

import { Turnstile } from "@marsidev/react-turnstile";

export function TurnstileField({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (token: string) => void;
}) {
  if (!siteKey) return null;

  return (
    <Turnstile
      siteKey={siteKey}
      options={{ theme: "dark", size: "flexible" }}
      onSuccess={onToken}
      onExpire={() => onToken("")}
    />
  );
}
