import { cn } from "@/lib/utils";

type ScoreBarProps = {
  label: string;
  value: number;
  max?: number;
  color?: "purple" | "pink" | "green" | "yellow" | "red" | "cyan";
  showValue?: boolean;
};

const colorMap = {
  purple: "from-purple-500 to-violet-400",
  pink: "from-pink-500 to-rose-400",
  green: "from-emerald-500 to-green-400",
  yellow: "from-amber-500 to-yellow-400",
  red: "from-red-500 to-orange-400",
  cyan: "from-cyan-500 to-sky-400",
};

export default function ScoreBar({
  label,
  value,
  max = 100,
  color = "purple",
  showValue = true,
}: ScoreBarProps) {
  const pct = Math.min(100, (value / max) * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/70">{label}</span>
        {showValue && (
          <span className="font-semibold text-white">{value.toFixed(1)}</span>
        )}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-700",
            colorMap[color]
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
