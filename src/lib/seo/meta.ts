import type { Metadata } from "next";

export function buildListingMetadata(input: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    openGraph: {
      title: input.title,
      description: input.description,
      url: input.url,
      images: input.imageUrl ? [input.imageUrl] : undefined
    }
  };
}
