import { Suspense } from "react";
import Link from "next/link";
import { HomeLiveCard } from "@/components/home/HomeLiveCard";
import { HomeKpisSkeleton, LiveCardSkeleton } from "@/components/home/HomeSkeletons";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Transparency } from "@/components/home/Transparency";
import { AboutProject } from "@/components/home/AboutProject";
import { StickyCta } from "@/components/home/StickyCta";

export const dynamic = "force-dynamic";

function HomeHero() {
  return (
    <div className="min-w-0">
      <p className="chip bg-brand-soft text-brand-strong">
        <span className="mono">Elecciones Municipales 2026 · Yaguarón</span>
      </p>
      <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Encuesta de Ecos Yaguarón.
      </h1>
      <p className="mt-4 max-w-lg text-muted">
        Ecos es una herramienta ciudadana de intención de voto. Validamos cédula y fecha
        de nacimiento contra el padrón, un voto por persona, y mostramos quién va liderando.
      </p>
      <div className="mt-7 hidden gap-3 sm:flex">
        <Link href="/votar" className="btn-primary">
          Cargar mi voto
        </Link>
        <Link href="/resultados" className="btn-secondary">
          Ver resultados
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="pb-24 md:pb-0">
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-10">
        <Suspense
          fallback={
            <>
              <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                <HomeHero />
                <LiveCardSkeleton />
              </div>
              <HomeKpisSkeleton />
            </>
          }
        >
          <HomeLiveCard>
            <HomeHero />
          </HomeLiveCard>
        </Suspense>
      </section>

      <div className="bg-surface">
        <div className="mx-auto max-w-5xl space-y-14 px-4 py-14">
          <HowItWorks />
          <Transparency />
          <AboutProject />
        </div>
      </div>
      <StickyCta />
    </div>
  );
}
