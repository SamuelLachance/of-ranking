import { Suspense } from "react";
import RankingsPageClient from "@/components/RankingsPageClient";
import { getAllCreatorsWithDetails } from "@/lib/data";

export default function RankingsPage() {
  const allCreators = getAllCreatorsWithDetails();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-16">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">
          Full Directory
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Creator Rankings
        </h1>
        <p className="mt-3 max-w-2xl text-white/60">
          Real creators curated from public bios and promo pages. Filter by
          language, authenticity threshold, and price. Scores are editorial
          estimates — not verified audits. Green badges indicate estimated Human
          Verified (authenticity ≥ 80).
        </p>
      </div>

      <Suspense
        fallback={
          <p className="text-sm text-white/50">Loading rankings…</p>
        }
      >
        <RankingsPageClient allCreators={allCreators} />
      </Suspense>
    </main>
  );
}
