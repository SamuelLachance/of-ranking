export const LANGUAGE_FLAGS: Record<string, string> = {
  English: "🇬🇧",
  French: "🇫🇷",
  Spanish: "🇪🇸",
  Portuguese: "🇵🇹",
  German: "🇩🇪",
  Italian: "🇮🇹",
  Polish: "🇵🇱",
};

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function formatResponseTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

export function cn(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Resolve a public asset path for GitHub Pages basePath in production. */
export function publicAsset(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${normalized}`;
}
