export const LANGUAGE_FLAGS: Record<string, string> = {
  English: "🇬🇧",
  French: "🇫🇷",
  Spanish: "🇪🇸",
  Portuguese: "🇵🇹",
  German: "🇩🇪",
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
