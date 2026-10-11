// Client-safe helpers shared by server and client components.

const apiOrigin = (() => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  try {
    return new URL(base).origin;
  } catch {
    return "";
  }
})();

// True for media served by the TripEleven API (allow-listed for next/image).
export function isApiMedia(url: string): boolean {
  return url.startsWith("/uploads/") || (Boolean(apiOrigin) && url.startsWith(apiOrigin));
}

// TripEleven returns media as "/uploads/..." paths on the API host. Those are
// served from this site's own /uploads (proxied by the rewrite in
// next.config.ts), so visitors only ever see this domain, including when a
// document or image is opened in a new tab.
export function imageUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) {
    return apiOrigin && path.startsWith(`${apiOrigin}/uploads/`) ? path.slice(apiOrigin.length) : path;
  }
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean.startsWith("/uploads/") ? clean : `${apiOrigin}${clean}`;
}

export function formatPrice(value?: number | null, currency = "$"): string {
  if (value == null) return "";
  const amount = value.toLocaleString("en-US");
  // Symbols prefix ("$565"); ISO codes read better spaced ("USD 565").
  return /^[A-Za-z]{2,}$/.test(currency) ? `${currency} ${amount}` : `${currency}${amount}`;
}

export function formatAltitude(m?: number | null): string {
  if (!m) return "";
  return `${m.toLocaleString("en-US")} m`;
}

const GRADES: Record<string, string> = {
  EASY: "Easy",
  MODERATE: "Moderate",
  MEDIUM: "Moderate",
  HARD: "Challenging",
  DIFFICULT: "Challenging",
  EXTREME: "Strenuous",
};

export function formatGrade(level?: string | null): string {
  if (!level) return "";
  return GRADES[level.toUpperCase()] ?? level.charAt(0) + level.slice(1).toLowerCase();
}

export function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// "<ul><li><p>A</p></li><li>B</li></ul>" -> ["A", "B"]
export function htmlListItems(html?: string | null): string[] {
  if (!html) return [];
  const items = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) =>
    stripHtml(m[1]),
  );
  return items.filter(Boolean);
}

export function whatsappLink(number?: string | null, text?: string): string {
  const digits = (number ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function readingTime(html?: string | null): number {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
