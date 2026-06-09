"use client";

import { motion } from "framer-motion";
import ScoreBar from "@/components/ScoreBar";
import {
  AUTHENTICITY_DIMENSION_WEIGHTS,
  TIER_LABELS,
  formatAuthenticityWithInterval,
  getDimensionBreakdown,
} from "@/lib/ranking";
import type { AuthenticitySignals, AuthenticityTier } from "@/lib/types";

type AuthenticityChartProps = {
  signals: AuthenticitySignals;
  authenticityScore: number;
  confidence?: number;
  margin?: number;
  tier?: AuthenticityTier;
};

const tierBadgeStyles: Record<AuthenticityTier, string> = {
  verified_human: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  likely_human: "bg-green-500/15 text-green-300 border-green-500/25",
  uncertain: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  likely_managed: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  bot_risk: "bg-red-500/20 text-red-300 border-red-500/30",
};

export default function AuthenticityChart({
  signals,
  authenticityScore,
  confidence = signals.confidence,
  margin,
  tier = signals.tier,
}: AuthenticityChartProps) {
  const dimensions = getDimensionBreakdown(signals);
  const displayMargin =
    margin ?? Math.round((100 - confidence) * 0.12);
  const flags = signals.ai_detection_flags ?? [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card space-y-5 p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Authenticity Breakdown
          </h3>
          <p className="mt-1 text-xs text-white/50">
            Editorial estimate from public signals
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${tierBadgeStyles[tier]}`}
          >
            {TIER_LABELS[tier]}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">
            {formatAuthenticityWithInterval(authenticityScore, displayMargin)}
          </span>
          <span className="text-xs text-white/40">
            {confidence}% confidence
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {dimensions.map((dim) => (
          <ScoreBar
            key={dim.key}
            label={`${dim.label} (${(dim.weight * 100).toFixed(0)}%)`}
            value={dim.value}
            color={dim.color}
          />
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-white/50">
        <p className="font-semibold text-white/70">Weight formula</p>
        <p className="mt-1 font-mono text-[11px] leading-relaxed text-purple-200/80">
          score = direct×{AUTHENTICITY_DIMENSION_WEIGHTS.direct_engagement} +
          (100−agency)×{AUTHENTICITY_DIMENSION_WEIGHTS.agency_risk_inverted} +
          activity×{AUTHENTICITY_DIMENSION_WEIGHTS.activity_pattern} +
          voice×{AUTHENTICITY_DIMENSION_WEIGHTS.voice_consistency} +
          (100−scale)×{AUTHENTICITY_DIMENSION_WEIGHTS.scale_penalty_inverted}
        </p>
      </div>

      {flags.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="mb-2 text-sm font-semibold text-red-300">Red Flags</p>
          <ul className="flex flex-wrap gap-2">
            {flags.map((flag) => (
              <li
                key={flag}
                className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-200"
              >
                {flag.replace(/_/g, " ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {signals.sources.length > 0 && (
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <p className="mb-2 text-sm font-semibold text-cyan-300">
            Public Sources ({signals.sources.length})
          </p>
          <ul className="space-y-1 text-xs text-white/60">
            {signals.sources.map((url) => (
              <li key={url} className="truncate">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-200"
                >
                  {url.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
