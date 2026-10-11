import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/site";
import { absolute } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const config = await getSiteConfig();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: absolute(config, "/sitemap.xml"),
  };
}
