export function buildListingJsonLd(listing: {
  title?: string | null;
  description?: string | null;
  createdAt?: Date;
  department?: string | null;
  district?: string | null;
  modality?: string | null;
  salePriceTotalUsd?: number | null;
  salePriceUsdPerHa?: number | null;
  rentUsdPerHaPerYear?: number | null;
  rentCropSharePercent?: number | null;
}) {
  const price =
    listing.modality === "VENTA"
      ? listing.salePriceTotalUsd ?? listing.salePriceUsdPerHa
      : listing.rentUsdPerHaPerYear ?? listing.rentCropSharePercent;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title ?? "Campo en Paraguay",
    description: listing.description ?? "",
    datePosted: listing.createdAt?.toISOString() ?? new Date().toISOString(),
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
