import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export function RestAccordion({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: ReactNode;
}) {
  if (count <= 0) return null;

  return (
    <details className="group border-t border-line pt-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl py-1 text-sm font-medium [&::-webkit-details-marker]:hidden">
        <span>{label}</span>
        <span className="flex items-center gap-2 text-muted">
          <span className="mono text-xs">{count}</span>
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
        </span>
      </summary>
      <div className="mt-4 space-y-4">{children}</div>
    </details>
  );
}
