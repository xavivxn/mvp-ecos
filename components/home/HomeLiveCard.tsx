import { HomePulse } from "@/components/home/HomePulse";
import { getBoard } from "@/lib/results";
import type { ReactNode } from "react";

export async function HomeLiveCard({ children }: { children: ReactNode }) {
  const board = await getBoard();
  return <HomePulse initial={board}>{children}</HomePulse>;
}
