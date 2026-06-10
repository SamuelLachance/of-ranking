import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, Star } from "lucide-react";
import AuthenticityChart from "@/components/AuthenticityChart";
import ScoreBar from "@/components/ScoreBar";
import { getAllCreatorsWithDetails, getCreatorById } from "@/lib/data";
import {
  TIER_LABELS,
  WEIGHTS,
  formatAuthenticityWithInterval,
  getAuthenticityInsights,
} from "@/lib/ranking";
import type { AuthenticityTier } from "@/lib/types";
import CreatorAvatar from "@/components/CreatorAvatar";
import { LANGUAGE_FLAGS, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAllCreatorsWithDetails().map((creator) => ({
    id: String(creator.id),
  }));
}

const tierBorder: Record<AuthenticityTier, string> = {
  verified_human: "border-emerald-500/30",
  likely_human: "border-green-500/25",
  uncertain: "border-amber-500/30",
  likely_managed: "border-orange-500/30",
  bot_risk: "border-red-500/30",
};

const tierBadge: Record<AuthenticityTier, string> = {
  verified_human: "bg-emerald-500/20 text-emerald-300",
  likely_human: "bg-green-500/15 text-green-300",
  uncertain: "bg-amber-500/20 text-amber-300",
  likely_managed: "bg-orange-500/20 text-orange-300",
  bot_risk: "bg-red-500/20 text-red-300",
};

const tierBarColor: Record<
  AuthenticityTier,
  "green" | "yellow" | "red"
> = {
  verified_human: "green",
  likely_human: "green",
  uncertain: "yellow",
  likely_managed: "yellow",
  bot_risk: "red",
};

export default async function CreatorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const creatorId = Number(id);

  if (Number.isNaN(creatorId)) notFound();

  const creator = getCreatorById(creatorId);
  if (!creator) notFound();

  const tier = creator.scores.authenticity_tier;
  const isVerified = tier === "verified_human";
  const insights = getAuthenticityInsights(
    creator.signals,
    creator.scores.authenticity_score
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 lg:px-10 lg:py-16">
      <Link
        href="/rankings"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to rankings
      </Link>

      <div className={cn("glass-card overflow-hidden", tierBorder[tier])}>
        <div className="flex flex-col gap-6 p-8 md:flex-row md:items-start">
          <CreatorAvatar
            src={creator.avatar_url}
            name={creator.name}
            className="h-48 w-48 shrink-0"
            verified={creator.avatar_verified}
            fallback={creator.avatar_fallback}
          />
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{creator.name}</h1>
              {isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-300">
                  <ShieldCheck className="h-4 w-4" />
                  Verified Human
                </span>
              )}
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-semibold",
                  tierBadge[tier]
                )}
              >
                {TIER_LABELS[tier]}
              </span>
            </div>
            <p className="text-white/50">
              @{creator.username} · {LANGUAGE_FLAGS[creator.language] ?? "🌐"}{" "}
              {creator.language} · {formatPrice(creator.subscription_price)}/mo
            </p>
            <p className="text-white/70">{creator.bio}</p>
            <p className="text-xs text-amber-200/70">
              Editorial estimate from public signals — not a verified subscriber
              audit or live DM analysis.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-2 font-semibold text-white">
                <Star className="h-5 w-5 text-amber-400" />
                Overall: {creator.scores.overall_rank_score.toFixed(1)}
              </span>
              <span className="text-emerald-300">
                Authenticity:{" "}
                {formatAuthenticityWithInterval(
                  creator.scores.authenticity_score,
                  creator.scores.authenticity_margin
                )}{" "}
                <span className="text-white/40">
                  ({creator.scores.authenticity_confidence}% confidence)
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 border-t border-white/10 p-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Score Breakdown</h2>
            <ScoreBar
              label={`Review Score (${(WEIGHTS.review * 100).toFixed(0)}% weight)`}
              value={creator.scores.review_score}
              color="cyan"
            />
            <ScoreBar
              label={`Sexy Score (${(WEIGHTS.sexy * 100).toFixed(0)}% weight)`}
              value={creator.scores.sexy_score}
              color="pink"
            />
            <ScoreBar
              label={`Content Openness / Nude Score (${(WEIGHTS.nude * 100).toFixed(0)}% weight)`}
              value={creator.scores.nude_score}
              color="magenta"
            />
            <ScoreBar
              label={`Authenticity (${(WEIGHTS.authenticity * 100).toFixed(0)}% weight)`}
              value={creator.scores.authenticity_score}
              color={tierBarColor[tier]}
            />
          </div>

          <AuthenticityChart
            signals={creator.signals}
            authenticityScore={creator.scores.authenticity_score}
            confidence={creator.scores.authenticity_confidence}
            margin={creator.scores.authenticity_margin}
            tier={tier}
          />
        </div>

        {creator.signals.research_notes && (
          <div className="border-t border-white/10 p-8">
            <h2 className="mb-3 text-lg font-semibold text-white">
              Why This Authenticity Score
            </h2>
            <p className="text-sm leading-relaxed text-white/70">
              {creator.signals.research_notes}
            </p>
          </div>
        )}

        {creator.nude_score_notes && (
          <div className="border-t border-white/10 p-8">
            <h2 className="mb-3 text-lg font-semibold text-white">
              Content Signals (Editorial Estimate)
            </h2>
            <p className="mb-3 text-xs text-amber-200/70">
              Based on public bios, press interviews, and promotional language
              only — not paywalled content verification.
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              {creator.nude_score_notes}
            </p>
          </div>
        )}

        <div className="grid gap-6 border-t border-white/10 p-8 md:grid-cols-2">
          {insights.positive.length > 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <h3 className="font-semibold text-emerald-300">Green Flags</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {insights.positive
                  .filter((item) => !item.startsWith("Research:"))
                  .map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-emerald-400">✓</span>
                      {item}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {insights.concerns.length > 0 && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <h3 className="font-semibold text-red-300">Red Flags</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {insights.concerns.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-red-400">!</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-8">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Editorial Reviews ({creator.reviews.length})
          </h2>
          <div className="space-y-4">
            {creator.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-white/5 bg-black/20 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">
                    {review.reviewer_name}
                  </span>
                  <span className="flex items-center gap-1 text-amber-300">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/70">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
