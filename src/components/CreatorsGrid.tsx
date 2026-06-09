import CreatorCard from "@/components/CreatorCard";
import type { RankedCreator } from "@/lib/types";

type CreatorsGridProps = {
  creators: RankedCreator[];
  compact?: boolean;
};

export default function CreatorsGrid({
  creators,
  compact,
}: CreatorsGridProps) {
  if (creators.length === 0) {
    return (
      <div className="glass-card p-10 text-center text-white/60">
        No creators match your filters. Try adjusting your criteria.
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {creators.map((creator) => (
        <CreatorCard key={creator.id} creator={creator} compact={compact} />
      ))}
    </div>
  );
}
