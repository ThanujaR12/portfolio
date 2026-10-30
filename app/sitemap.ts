import type { MetadataRoute } from "next";
import { getPortfolio } from "@/lib/content/portfolio";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getPortfolio();
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/resume`, changeFrequency: "monthly", priority: 0.6 },
    ...projects.map((p) => ({
      url: `${siteUrl}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      priority: 0.8,
    })),
  ];
}
