import { Brain, Clock, MessageSquare, ShieldCheck, Sparkles, Zap } from "lucide-react";
import ScoreBar from "@/components/ScoreBar";
import { WEIGHTS } from "@/lib/ranking";

const humanSignals = [
  "Variable response times (minutes to hours, not seconds)",
  "Personalized messages referencing past conversations",
  "Natural typos and casual language patterns",
  "Clear sleep/offline periods in activity data",
  "Unique voice and personality across messages",
  "Community-verified direct interaction badge",
];

const botSignals = [
  "Instant responses (<5 seconds consistently)",
  "Generic or template-based replies",
  "24/7 availability with no breaks",
  "Perfect grammar in every message",
  "Identical response structures across chats",
  "Copy-paste messages to multiple subscribers",
];

export default function AlgorithmPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10 lg:px-10 lg:py-16">
      <div className="mb-10 space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">
          Transparent Methodology
        </p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          How Our Ranking Algorithm Works
        </h1>
        <p className="max-w-2xl text-white/60">
          OF Ranking scores real creators using public marketing data and
          editorial authenticity estimates. The algorithm is transparent and
          designed for future integration with verified signal sources.
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
          Human Authenticity Score (0–100)
        </h2>
        <p className="text-white/70">
          The authenticity score is our primary differentiator. It analyzes
          behavioral signals (response timing, personalization, AI-pattern flags)
          to estimate whether a creator likely interacts directly or uses
          automation. Signals are editorial estimates unless otherwise noted.
        </p>

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
              Bot/AI Indicators (penalized)
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

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            icon: Clock,
            title: "Response Timing",
            desc: "Humans reply in minutes to hours with natural variance. Instant (<5s) or perfectly uniform timing triggers penalties.",
            color: "text-cyan-300",
          },
          {
            icon: MessageSquare,
            title: "Personalization",
            desc: "Messages that reference subscriber history score high. Generic templates and copy-paste patterns score low.",
            color: "text-purple-300",
          },
          {
            icon: ShieldCheck,
            title: "Verification",
            desc: "Creators with authenticity ≥ 80 earn a Human Verified badge. Community verification adds a bonus to the score.",
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
        Profiles use public bios and promo pages only — no OnlyFans scraping.
        Authenticity scores are editorial estimates, not verified audits. Not
        affiliated with OnlyFans.
      </p>
    </main>
  );
}
