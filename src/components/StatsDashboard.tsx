"use client";

import { motion } from "framer-motion";
import { Globe, ShieldCheck, Users } from "lucide-react";
import type { PlatformStats } from "@/lib/types";

type StatsDashboardProps = {
  stats: PlatformStats;
};

export default function StatsDashboard({ stats }: StatsDashboardProps) {
  const items = [
    {
      label: "Total Creators",
      value: stats.totalCreators.toString(),
      icon: Users,
      accent: "text-purple-300",
    },
    {
      label: "Avg Authenticity",
      value: `${stats.avgAuthenticity}%`,
      icon: ShieldCheck,
      accent: "text-emerald-300",
    },
    {
      label: "Human Verified",
      value: stats.humanVerifiedCount.toString(),
      icon: ShieldCheck,
      accent: "text-pink-300",
    },
    {
      label: "Languages",
      value: stats.languages.length.toString(),
      icon: Globe,
      accent: "text-cyan-300",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ${item.accent}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/50">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-white">{item.value}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
