"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Star } from "lucide-react";
import ScoreBar from "@/components/ScoreBar";
import {
  AUTHENTICITY_THRESHOLDS,
  getAuthenticityTier,
} from "@/lib/ranking";
import type { RankedCreator } from "@/lib/types";
import { LANGUAGE_FLAGS, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type CreatorCardProps = {
  creator: RankedCreator;
  compact?: boolean;
};

const tierStyles = {
  high: "border-emerald-500/30 bg-emerald-500/5",
  medium: "border-amber-500/30 bg-amber-500/5",
  low: "border-red-500/30 bg-red-500/5",
};

const tierBarColors = {
  high: "green" as const,
  medium: "yellow" as const,
  low: "red" as const,
};

export default function CreatorCard({ creator, compact }: CreatorCardProps) {
  const tier = getAuthenticityTier(creator.scores.authenticity_score);
  const isVerified =
    creator.scores.authenticity_score >= AUTHENTICITY_THRESHOLDS.humanVerified;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn("glass-card flex flex-col gap-4 p-5", tierStyles[tier])}
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
                Human Verified
              </span>
            )}
          </div>
          <p className="text-sm text-white/50">
            @{creator.username} · {LANGUAGE_FLAGS[creator.language] ?? "🌐"}{" "}
            {creator.language} · {formatPrice(creator.subscription_price)}/mo
          </p>
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
        <ScoreBar
          label="Authenticity"
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
