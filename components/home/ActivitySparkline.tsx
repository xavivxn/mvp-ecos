import { cssPct } from "@/lib/pulse";

export function ActivitySparkline({ hours }: { hours: number[] }) {
  const values = hours.length >= 24 ? hours.slice(-24) : [...Array(24 - hours.length).fill(0), ...hours];
  const peak = Math.max(...values, 1);

  return (
    <div
      className="flex h-8 min-w-0 items-end gap-px overflow-hidden sm:h-12"
      aria-hidden
    >
      {values.map((count, i) => (
        <div
          key={i}
          className="min-w-0 flex-1 rounded-sm bg-brand/65 transition-[height] duration-700"
          style={{ height: cssPct(Math.max(8, (count / peak) * 100), 8) }}
        />
      ))}
    </div>
  );
}
