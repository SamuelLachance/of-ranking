import { Brain, Clock, MessageSquare, ShieldCheck, Sparkles, Zap } from "lucide-react";
import ScoreBar from "@/components/ScoreBar";
import { getAllCreatorsWithDetails } from "@/lib/data";
import {
  AUTHENTICITY_DIMENSION_WEIGHTS,
  TIER_DESCRIPTIONS,
  TIER_LABELS,
  WEIGHTS,
} from "@/lib/ranking";
import type { AuthenticityTier } from "@/lib/types";

const humanSignals = [
  "Creator publicly states they personally reply to DMs",
  "Documented fan testimonials about personal replies (press, interviews)",
  "Irregular posting schedule suggesting human operation",
  "Live streams with real-time fan interaction",
  "Solo creator operation with no disclosed agency",
  "Unique voice consistent across public social + fan reports",
  "Long-form personal captions on public social",
];

const botSignals = [
  "Known use of chatting agencies (documented in press)",
  "Celebrity with disclosed management team handling messages",
  "Identical promo templates across platforms",
  "24/7 instant reply patterns reported by fans",
  "Chatter job postings tied to creator accounts",
  "OF management company publicly listed as partner",
  "Generic mass DM campaigns documented by fans",
  "Creator publicly admitted using third-party chatters",
];

const dimensionRows = [
  {
    key: "direct_engagement",
    label: "Direct Engagement Evidence",
    weight: AUTHENTICITY_DIMENSION_WEIGHTS.direct_engagement,
    desc: "Public statements, fan testimonials, live interaction proof.",
  },
  {
    key: "agency_risk",
    label: "Agency/Chatter Risk (inverted)",
    weight: AUTHENTICITY_DIMENSION_WEIGHTS.agency_risk_inverted,
    desc: "Management teams, chatting agencies, job postings — scored as risk, then inverted.",
  },
  {
    key: "activity_pattern",
    label: "Response Pattern Plausibility",
    weight: AUTHENTICITY_DIMENSION_WEIGHTS.activity_pattern,
    desc: "Estimated from public activity rhythms: sleep gaps, timezone consistency.",
  },
  {
    key: "voice_consistency",
    label: "Voice Consistency",
    weight: AUTHENTICITY_DIMENSION_WEIGHTS.voice_consistency,
    desc: "Personality match across public platforms and documented fan reports.",
  },
  {
    key: "scale_penalty",
    label: "Scale Penalty (inverted)",
    weight: AUTHENTICITY_DIMENSION_WEIGHTS.scale_penalty_inverted,
    desc: "Mega-celebrities with millions of subs statistically unlikely to DM everyone.",
  },
];

const tiers: AuthenticityTier[] = [
  "verified_human",
  "likely_human",
  "uncertain",
  "likely_managed",
  "bot_risk",
];

export default function AlgorithmPage() {
  const creators = getAllCreatorsWithDetails();
  const topAuthentic = [...creators]
    .sort((a, b) => b.scores.authenticity_score - a.scores.authenticity_score)
    .slice(0, 3);
  const bottomAuthentic = [...creators]
    .sort((a, b) => a.scores.authenticity_score - b.scores.authenticity_score)
    .slice(0, 3);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 lg:px-10 lg:py-16">
      <div className="mb-10 space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">
          Transparent Methodology v2.0
        </p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          How Our Authenticity Algorithm Works
        </h1>
        <p className="max-w-2xl text-white/60">
          OF Ranking scores creators using a five-dimension authenticity model
          built from public research only. Every score is labeled as an{" "}
          <strong className="text-amber-200">editorial estimate from public signals</strong>{" "}
          — we do not scrape OnlyFans or audit paywalled DMs.
        </p>
      </div>

      <section className="glass-card mb-8 space-y-6 p-8">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
          <Sparkles className="h-5 w-5 text-purple-400" />
          Overall Score Formula
        </h2>
        <div className="rounded-xl border border-white/10 bg-black/30 p-6 font-mono text-sm text-purple-200">
          overall = (review × 0.30) + (sexy × 0.25) + (authenticity × 0.45)
        </div>
        <div className="space-y-3">
          <ScoreBar
            label={`Review Score — ${(WEIGHTS.review * 100).toFixed(0)}% weight`}
            value={WEIGHTS.review * 100}
            color="cyan"
          />
          <ScoreBar
            label={`Sexy Score — ${(WEIGHTS.sexy * 100).toFixed(0)}% weight`}
            value={WEIGHTS.sexy * 100}
            color="pink"
          />
          <ScoreBar
            label={`Authenticity Score — ${(WEIGHTS.authenticity * 100).toFixed(0)}% weight`}
            value={WEIGHTS.authenticity * 100}
            color="green"
          />
        </div>
      </section>

      <section className="glass-card mb-8 space-y-6 p-8">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
          <Brain className="h-5 w-5 text-emerald-400" />
          Five-Dimension Authenticity Model
        </h2>
        <div className="rounded-xl border border-white/10 bg-black/30 p-6 font-mono text-xs leading-relaxed text-emerald-200/90 sm:text-sm">
          authenticity = direct×0.25 + (100−agency)×0.25 + activity×0.20 +
          voice×0.15 + (100−scale)×0.15 − flag_penalty [+ verified_bonus]
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="pb-3 pr-4">Dimension</th>
                <th className="pb-3 pr-4">Weight</th>
                <th className="pb-3">Description</th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              {dimensionRows.map((row) => (
                <tr key={row.key} className="border-b border-white/5">
                  <td className="py-3 pr-4 font-medium text-white">
                    {row.label}
                  </td>
                  <td className="py-3 pr-4 text-purple-300">
                    {(row.weight * 100).toFixed(0)}%
                  </td>
                  <td className="py-3">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-card mb-8 space-y-6 p-8">
        <h2 className="text-xl font-semibold text-white">Tier Classification</h2>
        <div className="space-y-3">
          {tiers.map((tier) => (
            <div
              key={tier}
              className="flex flex-wrap items-baseline gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
            >
              <span className="font-semibold text-white">
                {TIER_LABELS[tier]}
              </span>
              <span className="text-xs text-white/40">
                {tier === "verified_human" && "≥ 80"}
                {tier === "likely_human" && "60–79"}
                {tier === "uncertain" && "40–59"}
                {tier === "likely_managed" && "20–39"}
                {tier === "bot_risk" && "< 20"}
              </span>
              <span className="text-sm text-white/60">
                {TIER_DESCRIPTIONS[tier]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card mb-8 space-y-6 p-8">
        <h2 className="text-xl font-semibold text-white">Advanced Techniques</h2>
        <ul className="space-y-3 text-sm text-white/70">
          <li>
            <strong className="text-white">Bayesian-style confidence:</strong>{" "}
            Lower confidence widens the displayed interval (e.g. 72 ± 8).
          </li>
          <li>
            <strong className="text-white">Signal disagreement penalty:</strong>{" "}
            Conflicting dimension scores reduce confidence.
          </li>
          <li>
            <strong className="text-white">Human verified override:</strong>{" "}
            +5 bonus only when creator has strong public evidence (video/press
            stating personal replies) AND direct engagement ≥ 70.
          </li>
          <li>
            <strong className="text-white">Agency blacklist patterns:</strong>{" "}
            Known OF management companies and disclosed chatter use increase
            agency risk score.
          </li>
          <li>
            <strong className="text-white">AI detection flags:</strong> Each
            flag deducts up to 4 points from the composite score.
          </li>
        </ul>
      </section>

      <section className="glass-card mb-8 space-y-6 p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Human Indicators (rewarded)
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              {humanSignals.map((signal) => (
                <li key={signal} className="flex gap-2">
                  <span className="text-emerald-400">+</span>
                  {signal}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold text-red-300">
              <Zap className="h-4 w-4" />
              Bot/Agency Indicators (penalized)
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              {botSignals.map((signal) => (
                <li key={signal} className="flex gap-2">
                  <span className="text-red-400">−</span>
                  {signal}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="glass-card p-6">
          <h3 className="mb-4 font-semibold text-emerald-300">
            High Scorer Examples
          </h3>
          <ul className="space-y-3 text-sm">
            {topAuthentic.map((c) => (
              <li key={c.id} className="text-white/70">
                <span className="font-medium text-white">{c.name}</span> —{" "}
                {c.scores.authenticity_score.toFixed(0)} ±{" "}
                {c.scores.authenticity_margin} ({TIER_LABELS[c.scores.authenticity_tier]})
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-card p-6">
          <h3 className="mb-4 font-semibold text-red-300">
            Low Scorer Examples
          </h3>
          <ul className="space-y-3 text-sm">
            {bottomAuthentic.map((c) => (
              <li key={c.id} className="text-white/70">
                <span className="font-medium text-white">{c.name}</span> —{" "}
                {c.scores.authenticity_score.toFixed(0)} ±{" "}
                {c.scores.authenticity_margin} ({TIER_LABELS[c.scores.authenticity_tier]})
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-3">
        {[
          {
            icon: Clock,
            title: "Activity Patterns",
            desc: "Public posting rhythms and live schedules inform plausibility of personal DM replies.",
            color: "text-cyan-300",
          },
          {
            icon: MessageSquare,
            title: "Public Research",
            desc: "Each creator has documented sources, research notes, and cited press coverage.",
            color: "text-purple-300",
          },
          {
            icon: ShieldCheck,
            title: "Limitations",
            desc: "We cannot verify private DMs. Scores reflect public discourse only and may change as new evidence emerges.",
            color: "text-emerald-300",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="glass-card p-5">
              <Icon className={`mb-3 h-6 w-6 ${item.color}`} />
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-white/60">{item.desc}</p>
            </div>
          );
        })}
      </section>

      <p className="mt-8 text-center text-sm text-white/40">
        Editorial estimate from public signals only. No OnlyFans scraping. Not
        affiliated with OnlyFans. Methodology version 2.0-multidimensional.
      </p>
    </main>
  );
}
