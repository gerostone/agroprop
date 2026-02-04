import { Listing, ListingImage, WaterSource } from "@prisma/client";

export function calculateCompletenessScore(
  listing: Listing,
  images: ListingImage[]
) {
  let score = 0;

  if (listing.title) score += 5;
  if (listing.description && listing.description.length >= 200) score += 5;

  const imageCount = images.length;
  if (imageCount >= 5) score += 20;
  else if (imageCount >= 1) score += 10;

  if (listing.lat && listing.lng) score += 10;

  const productiveFields = [
    listing.productiveAptitude,
    listing.currentUse,
    listing.rotationsHistory,
    listing.soilType,
    listing.productivityIndex
  ].filter((value) => value !== null && value !== undefined && value !== "").length;
  score += Math.min(productiveFields * 4, 20);

  const infraFields = [
    listing.hasElectricity,
    listing.hasInternalRoads,
    listing.hasFences,
    listing.hasCorrals,
    listing.hasSilos,
    listing.hasSheds
  ].filter((value) => value === true).length;
  score += Math.min(infraFields * 3, 18);

  const hasWater = listing.waterSources?.some((source) => source !== WaterSource.NINGUNO);
  if (hasWater) score += 4;

  const logisticsFields = [listing.distanceToPavedRouteKm, listing.distanceToTownKm].filter(
    (value) => value !== null && value !== undefined
  ).length;
  score += Math.min(logisticsFields * 3, 6);
  if (listing.yearRoundAccess) score += 4;

  if (listing.maxSlopePercentRange) score += 5;

  return Math.min(score, 100);
}
