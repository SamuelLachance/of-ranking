import FeaturedCreators, { HeroSection } from "@/components/FeaturedCreators";
import StatsDashboard from "@/components/StatsDashboard";
import { getPlatformStats, getRankedCreators } from "@/lib/data";

export default function HomePage() {
  const stats = getPlatformStats();
  const ranked = getRankedCreators({ sortBy: "overall" });
  const verifiedHuman = getRankedCreators({
    authenticityTier: "verified_human",
    sortBy: "authenticity",
  });

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10 lg:px-10 lg:py-16">
      <HeroSection />
      <StatsDashboard stats={stats} />
      <FeaturedCreators creators={ranked} verifiedCreators={verifiedHuman} />

      <section className="glass-card border border-amber-500/20 bg-amber-500/5 p-6 text-sm text-white/70">
        <strong className="text-amber-200">Data transparency:</strong> Profiles
        are built from public social bios and promotional pages. Review scores
        and authenticity signals are algorithmic estimates — not verified
        subscriber audits or live platform telemetry.
      </section>

      <section className="glass-card grid gap-6 p-8 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-purple-300">
            30% Weight
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">Review Score</h3>
          <p className="mt-2 text-sm text-white/60">
            Aggregated subscriber ratings normalized to a 0–100 scale across all
            languages.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-pink-300">
            25% Weight
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">Sexy Score</h3>
          <p className="mt-2 text-sm text-white/60">
            Appeal and presentation rating — one factor among many, never the sole
            driver.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-300">
            45% Weight
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Human Authenticity
          </h3>
          <p className="mt-2 text-sm text-white/60">
            Our key differentiator: detects real human interaction patterns vs
            bots and AI chat systems.
          </p>
        </div>
      </section>
    </main>
  );
}
