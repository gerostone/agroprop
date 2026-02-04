import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Filters from "@/components/forms/Filters";
import ListingGrid from "@/components/listing/ListingGrid";
import { prisma } from "@/lib/db";
import { ListingStatus } from "@prisma/client";

export const revalidate = 60;
export const dynamic = "force-dynamic";

function parseNumber(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export default async function ResultsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const page = Math.max(1, parseNumber(searchParams.page) ?? 1);
  const pageSize = Math.min(60, Math.max(1, parseNumber(searchParams.pageSize) ?? 12));
  const minPrice = parseNumber(searchParams.minPrice);
  const maxPrice = parseNumber(searchParams.maxPrice);
  const minHectares = parseNumber(searchParams.minHectares);
  const maxHectares = parseNumber(searchParams.maxHectares);

  const where: any = { status: ListingStatus.PUBLISHED };

  if (minHectares !== null || maxHectares !== null) {
    where.hectaresTotal = {
      ...(minHectares !== null ? { gte: minHectares } : {}),
      ...(maxHectares !== null ? { lte: maxHectares } : {})
    };
  }

  if (searchParams.department) where.department = searchParams.department;
  if (searchParams.district) where.district = searchParams.district;
  if (searchParams.type) where.type = searchParams.type;
  if (searchParams.modality) where.modality = searchParams.modality;
  if (searchParams.maxSlopePercentRange) where.maxSlopePercentRange = searchParams.maxSlopePercentRange;
  if (searchParams.hasElectricity !== undefined && searchParams.hasElectricity !== "") {
    where.hasElectricity = searchParams.hasElectricity === "true";
  }
  if (searchParams.yearRoundAccess !== undefined && searchParams.yearRoundAccess !== "") {
    where.yearRoundAccess = searchParams.yearRoundAccess === "true";
  }
  if (searchParams.hasWater !== undefined && searchParams.hasWater !== "") {
    if (searchParams.hasWater === "true") {
      where.waterSources = { hasSome: ["TAJAMAR", "ARROYO", "RIO", "POZO"] };
    } else {
      where.NOT = [
        {
          waterSources: { hasSome: ["TAJAMAR", "ARROYO", "RIO", "POZO"] }
        }
      ];
    }
  }

  if (minPrice !== null || maxPrice !== null) {
    const min = minPrice ?? undefined;
    const max = maxPrice ?? undefined;

    if (!searchParams.modality) {
      where.OR = [
        {
          modality: "VENTA",
          OR: [
            {
              salePriceTotalUsd: {
                ...(min !== undefined ? { gte: min } : {}),
                ...(max !== undefined ? { lte: max } : {})
              }
            },
            {
              salePriceUsdPerHa: {
                ...(min !== undefined ? { gte: min } : {}),
                ...(max !== undefined ? { lte: max } : {})
              }
            }
          ]
        },
        {
          modality: "ALQUILER",
          rentUsdPerHaPerYear: {
            ...(min !== undefined ? { gte: min } : {}),
            ...(max !== undefined ? { lte: max } : {})
          }
        }
      ];
    } else if (searchParams.modality === "VENTA") {
      where.OR = [
        {
          salePriceTotalUsd: {
            ...(min !== undefined ? { gte: min } : {}),
            ...(max !== undefined ? { lte: max } : {})
          }
        },
        {
          salePriceUsdPerHa: {
            ...(min !== undefined ? { gte: min } : {}),
            ...(max !== undefined ? { lte: max } : {})
          }
        }
      ];
    } else if (searchParams.modality === "ALQUILER") {
      where.rentUsdPerHaPerYear = {
        ...(min !== undefined ? { gte: min } : {}),
        ...(max !== undefined ? { lte: max } : {})
      };
    }
  }

  const sort = searchParams.sort ?? "newest";
  const orderBy =
    sort === "price_asc"
      ? { salePriceTotalUsd: "asc" as const }
      : sort === "price_desc"
        ? { salePriceTotalUsd: "desc" as const }
        : sort === "hectares_asc"
          ? { hectaresTotal: "asc" as const }
          : sort === "hectares_desc"
            ? { hectaresTotal: "desc" as const }
            : sort === "best"
              ? { completenessScore: "desc" as const }
              : { createdAt: "desc" as const };

  const [total, listings] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      include: { images: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Resultados</h1>
          <p className="text-sm text-slate-600">{total} publicaciones encontradas</p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Filters searchParams={searchParams} />
        </section>

        <section>
          <ListingGrid listings={listings} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
