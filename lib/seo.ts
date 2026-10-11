import type { SiteConfig } from "@/lib/site";
import { imageUrl } from "@/lib/media";

// Canonical origin for sitemap, robots and structured data: dashboard URL,
// then NEXT_PUBLIC_FRONTEND_BASE_URL, then the production domain.
export function siteUrl(config: SiteConfig): string {
  const raw = config.url || process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || "https://triphighland.com";
  return raw.replace(/\/+$/, "");
}

export function absolute(config: SiteConfig, path = "/"): string {
  return `${siteUrl(config)}${path.startsWith("/") ? path : `/${path}`}`;
}

// Media URL on this site's domain (imageUrl gives a same-origin /uploads path).
export function absoluteMedia(config: SiteConfig, path?: string | null): string | undefined {
  const url = imageUrl(path);
  if (!url) return undefined;
  return url.startsWith("/") ? absolute(config, url) : url;
}

// schema.org TravelAgency for the whole site.
export function organizationLd(config: SiteConfig) {
  const url = siteUrl(config);
  const r = config.reviews;
  const ratings = [r?.googleReview, r?.tripadvisor].filter((x): x is { count: number; rating: number; link: string } => Boolean(x?.count));
  const count = ratings.reduce((n, x) => n + x.count, 0);
  const average = count ? ratings.reduce((n, x) => n + x.rating * x.count, 0) / count : 0;
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${url}/#organization`,
    name: config.name,
    url,
    description: config.description,
    logo: absoluteMedia(config, config.logo),
    image: absoluteMedia(config, config.image),
    email: config.email,
    telephone: config.phoneNumbers[0]?.number,
    address: config.fullAddress ? { "@type": "PostalAddress", streetAddress: config.fullAddress } : undefined,
    sameAs: Object.values(config.socials).filter(Boolean),
    aggregateRating: count
      ? { "@type": "AggregateRating", ratingValue: Number(average.toFixed(1)), reviewCount: count, bestRating: 5 }
      : undefined,
  };
}

export function breadcrumbLd(config: SiteConfig, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absolute(config, it.path) })),
  };
}
