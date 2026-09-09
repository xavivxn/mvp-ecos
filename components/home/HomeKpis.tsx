import { PulseKpis } from "@/components/home/PulseKpis";
import type { BoardData } from "@/lib/results";

export function HomeKpis({ board, now }: { board: BoardData | null; now?: number }) {
  return <PulseKpis board={board} now={now} className="mt-10" />;
}
