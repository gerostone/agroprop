import type { MetadataRoute } from "next";
import { demoListings } from "@/lib/demo/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://gerostone.github.io/agroprop";

  return [
    {
      url: siteUrl,
      lastModified: new Date()
    },
    {
      url: `${siteUrl}/resultados`,
      lastModified: new Date()
    },
    ...demoListings.map((listing) => ({
      url: `${siteUrl}/campo/${listing.slug}`,
      lastModified: new Date()
    }))
  ];
}
