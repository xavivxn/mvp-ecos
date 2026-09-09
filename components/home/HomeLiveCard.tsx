import { LiveCard } from "@/components/home/LiveCard";
import { getBoard } from "@/lib/results";

export async function HomeLiveCard() {
  const board = await getBoard();
  return <LiveCard board={board} />;
}
