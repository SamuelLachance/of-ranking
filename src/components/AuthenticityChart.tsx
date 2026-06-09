"use client";

import { motion } from "framer-motion";
import ScoreBar from "@/components/ScoreBar";
import type { AuthenticitySignals } from "@/lib/types";
import { formatResponseTime } from "@/lib/utils";

type AuthenticityChartProps = {
  signals: AuthenticitySignals;
  authenticityScore: number;
};

export default function AuthenticityChart({
  signals,
  authenticityScore,
}: AuthenticityChartProps) {
  let flags: string[] = [];
  try {
    flags = JSON.parse(signals.ai_detection_flags) as string[];
  } catch {
    flags = [];
  }

  const consistencyAsHuman = 100 - signals.response_consistency;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card space-y-5 p-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Authenticity Signal Breakdown
        </h3>
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">
          {authenticityScore.toFixed(1)} / 100
        </span>
      </div>

      <div className="space-y-3">
        <ScoreBar
          label={`Response Time (${formatResponseTime(signals.response_time_avg)} avg)`}
          value={signals.response_time_avg >= 120 ? 85 : signals.response_time_avg < 5 ? 15 : 50}
          color={signals.response_time_avg >= 120 ? "green" : signals.response_time_avg < 5 ? "red" : "yellow"}
        />
        <ScoreBar
          label="Message Personalization"
          value={signals.message_personalization_score}
          color="purple"
        />
        <ScoreBar
          label="Natural Timing Variance"
          value={consistencyAsHuman}
          color="cyan"
        />
        <ScoreBar
          label="Human Verified Bonus"
          value={signals.human_verified ? 100 : 0}
          color="green"
        />
      </div>

      {flags.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="mb-2 text-sm font-semibold text-red-300">
            AI Detection Flags
          </p>
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
    </motion.div>
  );
}
