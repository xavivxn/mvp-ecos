import Link from "next/link";
import { isClosingWindow, msUntil } from "@/lib/pulse";
import { getElection } from "@/lib/survey";

export async function StickyCta() {
  const election = await getElection();
  const closing = Boolean(
    election?.isOpen && isClosingWindow(msUntil(election.closesAt)),
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 p-3 backdrop-blur md:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <Link href="/votar" className="btn-primary w-full">
        {closing ? "Últimas horas · Cargar mi voto" : "Cargar mi voto"}
      </Link>
    </div>
  );
}
