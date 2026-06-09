"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Heart, ShieldCheck } from "lucide-react";
import CreatorCard from "@/components/CreatorCard";
import type { RankedCreator } from "@/lib/types";

type FeaturedCreatorsProps = {
  creators: RankedCreator[];
};

export default function FeaturedCreators({ creators }: FeaturedCreatorsProps) {
  const featured = creators.slice(0, 3);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">
            Top Ranked
          </p>
          <h2 className="text-2xl font-semibold text-white">
            Featured Creators
          </h2>
        </div>
        <Link
          href="/rankings"
          className="inline-flex items-center gap-1 text-sm font-semibold text-pink-300 hover:text-pink-200"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {featured.map((creator, index) => (
          <motion.div
            key={creator.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.12 }}
          >
            <CreatorCard creator={creator} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function HeroSection() {
  return (
    <section className="hero-gradient relative overflow-hidden rounded-[2rem] border border-white/10 p-8 md:p-12">
      <div className="relative z-10 max-w-3xl space-y-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Public Data Only · Editorial Rankings
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
        >
          Find creators who{" "}
          <span className="gradient-text">actually chat</span> with you
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-white/70"
        >
          OF Ranking uses a Human Authenticity Score to surface creators who
          interact directly — no AI, no chatbots, no outsourced replies. Review
          scores and appeal matter, but authenticity is weighted highest.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3"
        >
          <Link
            href="/rankings"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Heart className="h-4 w-4" />
            Browse Rankings
          </Link>
          <Link
            href="/algorithm"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            How It Works
          </Link>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 right-10 h-48 w-48 rounded-full bg-pink-500/20 blur-3xl" />
    </section>
  );
}
