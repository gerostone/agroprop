import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const listings = await prisma.listing.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true }
  });

  return [
    {
      url: siteUrl,
      lastModified: new Date()
    },
    {
      url: `${siteUrl}/resultados`,
      lastModified: new Date()
    },
    ...listings.map((listing) => ({
      url: `${siteUrl}/campo/${listing.slug}`,
      lastModified: listing.updatedAt
    }))
  ];
}
