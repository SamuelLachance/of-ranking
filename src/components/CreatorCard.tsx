"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Star } from "lucide-react";
import ScoreBar from "@/components/ScoreBar";
import {
  TIER_LABELS,
  formatAuthenticityWithInterval,
} from "@/lib/ranking";
import type { AuthenticityTier, RankedCreator } from "@/lib/types";
import { LANGUAGE_FLAGS, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type CreatorCardProps = {
  creator: RankedCreator;
  compact?: boolean;
};

const tierCardStyles: Record<AuthenticityTier, string> = {
  verified_human: "border-emerald-500/30 bg-emerald-500/5",
  likely_human: "border-green-500/25 bg-green-500/5",
  uncertain: "border-amber-500/30 bg-amber-500/5",
  likely_managed: "border-orange-500/30 bg-orange-500/5",
  bot_risk: "border-red-500/30 bg-red-500/5",
};

const tierBadgeStyles: Record<AuthenticityTier, string> = {
  verified_human: "bg-emerald-500/20 text-emerald-300",
  likely_human: "bg-green-500/15 text-green-300",
  uncertain: "bg-amber-500/20 text-amber-300",
  likely_managed: "bg-orange-500/20 text-orange-300",
  bot_risk: "bg-red-500/20 text-red-300",
};

const tierBarColors: Record<AuthenticityTier, "green" | "yellow" | "red" | "cyan" | "pink" | "purple"> = {
  verified_human: "green",
  likely_human: "green",
  uncertain: "yellow",
  likely_managed: "yellow",
  bot_risk: "red",
};

export default function CreatorCard({ creator, compact }: CreatorCardProps) {
  const tier = creator.scores.authenticity_tier;
  const isVerified = tier === "verified_human";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn("glass-card flex flex-col gap-4 p-5", tierCardStyles[tier])}
    >
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <img
            src={creator.avatar_url}
            alt={creator.name}
            className="h-14 w-14 rounded-2xl border border-white/10 bg-white/5 object-cover"
          />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-black/80 px-1.5 py-0.5 text-xs">
            #{creator.rank}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/creators/${creator.id}`}
              className="text-lg font-semibold text-white hover:text-pink-300"
            >
              {creator.name}
            </Link>
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                <ShieldCheck className="h-3 w-3" />
                Verified Human
              </span>
            )}
          </div>
          <p className="text-sm text-white/50">
            @{creator.username} · {LANGUAGE_FLAGS[creator.language] ?? "🌐"}{" "}
            {creator.language} · {formatPrice(creator.subscription_price)}/mo
          </p>
          <span
            className={cn(
              "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              tierBadgeStyles[tier]
            )}
          >
            {TIER_LABELS[tier]}
          </span>
        </div>
        <div className="text-right">
          <p className="flex items-center gap-1 text-sm font-semibold text-white">
            <Star className="h-4 w-4 text-amber-400" />
            {creator.scores.overall_rank_score.toFixed(1)}
          </p>
          <p className="text-xs text-white/40">Overall</p>
        </div>
      </div>

      {!compact && (
        <p className="line-clamp-2 text-sm text-white/60">{creator.bio}</p>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>Authenticity</span>
          <span>
            {formatAuthenticityWithInterval(
              creator.scores.authenticity_score,
              creator.scores.authenticity_margin
            )}
          </span>
        </div>
        <ScoreBar
          label="Score"
          value={creator.scores.authenticity_score}
          color={tierBarColors[tier]}
        />
        <ScoreBar
          label="Reviews"
          value={creator.scores.review_score}
          color="cyan"
        />
        <ScoreBar
          label="Sexy Score"
          value={creator.scores.sexy_score}
          color="pink"
        />
      </div>

      <Link
        href={`/creators/${creator.id}`}
        className="mt-auto text-center text-sm font-semibold text-pink-300 hover:text-pink-200"
      >
        View profile →
      </Link>
    </motion.article>
  );
}
