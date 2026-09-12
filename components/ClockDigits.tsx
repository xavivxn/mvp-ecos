import { formatRemainingClock } from "@/lib/pulse";

export function ClockDigits({
  remaining,
  endedLabel = "Cerró",
  className = "",
}: {
  remaining: number;
  endedLabel?: string;
  className?: string;
}) {
  const ended = remaining <= 0;
  const text = ended ? endedLabel : formatRemainingClock(remaining);

  return (
    <span className={`mono tabular-nums ${className}`} aria-hidden>
      {text.split("").map((char, i) => (
        <span
          key={`${i}-${char}`}
          className={char === ":" ? "inline-block" : "clock-tick inline-block"}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
