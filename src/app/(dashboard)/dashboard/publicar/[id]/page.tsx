import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ListingForm from "@/components/forms/ListingForm";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id }
  });

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
          <h1 className="text-2xl font-semibold">Publicación no encontrada</h1>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-semibold">Editar campo</h1>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <ListingForm
            initial={{
              id: listing.id,
              title: listing.title,
              locationText: listing.locationText,
              department: listing.department,
              district: listing.district,
              hectaresTotal: listing.hectaresTotal,
              type: listing.type,
              modality: listing.modality,
              description: listing.description,
              phoneWhatsapp: listing.phoneWhatsapp,
              contactEmail: listing.contactEmail,
              salePriceTotalUsd: listing.salePriceTotalUsd,
              salePriceUsdPerHa: listing.salePriceUsdPerHa,
              rentUsdPerHaPerYear: listing.rentUsdPerHaPerYear,
              rentCropSharePercent: listing.rentCropSharePercent,
              lat: listing.lat,
              lng: listing.lng,
              productiveAptitude: listing.productiveAptitude,
              currentUse: listing.currentUse,
              rotationsHistory: listing.rotationsHistory,
              soilType: listing.soilType,
              productivityIndex: listing.productivityIndex,
              waterSources: listing.waterSources,
              hasElectricity: listing.hasElectricity,
              hasInternalRoads: listing.hasInternalRoads,
              hasFences: listing.hasFences,
              hasCorrals: listing.hasCorrals,
              hasSilos: listing.hasSilos,
              hasSheds: listing.hasSheds,
              distanceToPavedRouteKm: listing.distanceToPavedRouteKm,
              distanceToTownKm: listing.distanceToTownKm,
              yearRoundAccess: listing.yearRoundAccess,
              maxSlopePercentRange: listing.maxSlopePercentRange,
              status: listing.status
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
