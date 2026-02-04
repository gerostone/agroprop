import { Listing } from "@prisma/client";

function resolvePrice(listing: Listing) {
  if (listing.modality === "VENTA") {
    return listing.salePriceTotalUsd ?? listing.salePriceUsdPerHa ?? null;
  }
  if (listing.modality === "ALQUILER") {
    return listing.rentUsdPerHaPerYear ?? listing.rentCropSharePercent ?? null;
  }
  return null;
}

export function buildListingJsonLd(listing: Listing) {
  const price = resolvePrice(listing);
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title ?? "Campo en Paraguay",
    description: listing.description ?? "",
    datePosted: listing.createdAt.toISOString(),
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "USD"
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.district,
      addressRegion: listing.department,
      addressCountry: "PY"
    }
  };
}
