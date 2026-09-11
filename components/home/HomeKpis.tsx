import { PulseKpis } from "@/components/home/PulseKpis";
import type { BoardData } from "@/lib/results";

export function HomeKpis({
  board,
  now,
  previewCloseCountdown = false,
}: {
  board: BoardData | null;
  now?: number;
  previewCloseCountdown?: boolean;
}) {
  return (
    <PulseKpis
      board={board}
      now={now}
      previewCloseCountdown={previewCloseCountdown}
      className="mt-10"
    />
  );
}
