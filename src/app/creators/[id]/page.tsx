import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, Star } from "lucide-react";
import AuthenticityChart from "@/components/AuthenticityChart";
import ScoreBar from "@/components/ScoreBar";
import { getAllCreatorsWithDetails, getCreatorById } from "@/lib/data";
import {
  AUTHENTICITY_THRESHOLDS,
  getAuthenticityInsights,
  getAuthenticityTier,
  WEIGHTS,
} from "@/lib/ranking";
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

export default async function CreatorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const creatorId = Number(id);

  if (Number.isNaN(creatorId)) notFound();

  const creator = getCreatorById(creatorId);
  if (!creator) notFound();

  const tier = getAuthenticityTier(creator.scores.authenticity_score);
  const isVerified =
    creator.scores.authenticity_score >= AUTHENTICITY_THRESHOLDS.humanVerified;
  const insights = getAuthenticityInsights(
    creator.signals,
    creator.scores.authenticity_score
  );

  const tierBorder = {
    high: "border-emerald-500/30",
    medium: "border-amber-500/30",
    low: "border-red-500/30",
  };

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
          <img
            src={creator.avatar_url}
            alt={creator.name}
            className="h-24 w-24 rounded-2xl border border-white/10 bg-white/5"
          />
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{creator.name}</h1>
              {isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-300">
                  <ShieldCheck className="h-4 w-4" />
                  Human Verified
                </span>
              )}
            </div>
            <p className="text-white/50">
              @{creator.username} · {LANGUAGE_FLAGS[creator.language] ?? "🌐"}{" "}
              {creator.language} · {formatPrice(creator.subscription_price)}/mo
            </p>
            <p className="text-white/70">{creator.bio}</p>
            <p className="text-xs text-amber-200/70">
              Scores and reviews are editorial estimates based on public signals
              — not verified subscriber audits.
            </p>
            <div className="flex items-center gap-2 text-lg font-semibold text-white">
              <Star className="h-5 w-5 text-amber-400" />
              Overall Score: {creator.scores.overall_rank_score.toFixed(1)}
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
              label={`Authenticity (${(WEIGHTS.authenticity * 100).toFixed(0)}% weight)`}
              value={creator.scores.authenticity_score}
              color={tier === "high" ? "green" : tier === "medium" ? "yellow" : "red"}
            />
          </div>

          <AuthenticityChart
            signals={creator.signals}
            authenticityScore={creator.scores.authenticity_score}
          />
        </div>

        <div className="grid gap-6 border-t border-white/10 p-8 md:grid-cols-2">
          {insights.positive.length > 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <h3 className="font-semibold text-emerald-300">
                Why we think {creator.name.split(" ")[0]} is real
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {insights.positive.map((item) => (
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
              <h3 className="font-semibold text-red-300">Authenticity concerns</h3>
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
            Subscriber Reviews ({creator.reviews.length})
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
