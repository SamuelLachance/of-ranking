"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { publicAsset } from "@/lib/utils";
import { cn } from "@/lib/utils";

type CreatorAvatarProps = {
  src: string;
  name: string;
  className?: string;
  verified?: boolean;
  fallback?: boolean;
};

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function CreatorAvatar({
  src,
  name,
  className,
  verified = false,
  fallback = false,
}: CreatorAvatarProps) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = publicAsset(src);

  if (failed || fallback) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl border border-dashed border-pink-400/40 bg-gradient-to-br from-pink-600/40 via-purple-700/35 to-indigo-800/40 font-bold tracking-wide text-white shadow-inner",
          className
        )}
        aria-label={name}
        title="No verified portrait — showing initials"
      >
        {initialsFromName(name)}
      </div>
    );
  }

  return (
    <div className={cn("relative shrink-0", className)}>
      <img
        src={resolvedSrc}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn(
          "h-full w-full rounded-xl border border-white/10 bg-white/5 object-cover",
          className
        )}
      />
      {verified && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md"
          title="Verified photo"
        >
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
        </span>
      )}
    </div>
  );
}
