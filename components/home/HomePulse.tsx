"use client";

import type { ReactNode } from "react";
import { HomeKpis } from "@/components/home/HomeKpis";
import { LiveCard } from "@/components/home/LiveCard";
import { boardNow } from "@/lib/pulse";
import { useResultsPoll } from "@/lib/useResultsPoll";
import type { BoardData } from "@/lib/results";

export function HomePulse({
  initial,
  previewCloseCountdown = false,
  children,
}: {
  initial: BoardData | null;
  previewCloseCountdown?: boolean;
  children: ReactNode;
}) {
  const { board, age } = useResultsPoll(initial);
  const now = boardNow(board?.generatedAt, age);

  return (
    <>
      <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        {children}
        <LiveCard board={board} now={now} previewCloseCountdown={previewCloseCountdown} />
      </div>
      <HomeKpis board={board} now={now} previewCloseCountdown={previewCloseCountdown} />
    </>
  );
}
