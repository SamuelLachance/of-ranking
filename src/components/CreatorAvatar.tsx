"use client";

import { useState } from "react";
import { publicAsset } from "@/lib/utils";
import { cn } from "@/lib/utils";

type CreatorAvatarProps = {
  src: string;
  name: string;
  className?: string;
};

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function CreatorAvatar({ src, name, className }: CreatorAvatarProps) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = publicAsset(src);

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-pink-500/30 to-purple-600/30 font-semibold text-white",
          className
        )}
        aria-label={name}
      >
        {initialsFromName(name)}
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(
        "rounded-xl border border-white/10 bg-white/5 object-cover",
        className
      )}
    />
  );
}
