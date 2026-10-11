import type { MetadataRoute } from "next";
import { getBlogs, getInfoPages, getSiteConfig, getTrips } from "@/lib/site";
import { absolute } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [config, { trips }, blogs, pages] = await Promise.all([getSiteConfig(), getTrips({ limit: 100 }), getBlogs(100), getInfoPages()]);
  const url = (path: string) => absolute(config, path);

  const fixed = ["/", "/explore", "/design-your-trip", "/blog", "/our-team", "/contact", "/booking"];
  if (config.documents.some((d) => d.published)) fixed.push("/legal-documents");

  return [
    ...fixed.map((path) => ({ url: url(path), changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.7 })),
    ...trips.map((t) => ({ url: url(`/trip/${t.slug}`), changeFrequency: "weekly" as const, priority: 0.9 })),
    ...blogs.map((b) => ({ url: url(`/blog/${b.slug}`), lastModified: b.publishedAt ?? undefined, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...pages.map((p) => ({ url: url(`/${p.slug}`), changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
