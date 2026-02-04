import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { listingDraftSchema } from "@/lib/validators/listing";
import { getServerAuthSession } from "@/lib/auth";
import { ListingStatus } from "@prisma/client";
import { sanitizeText } from "@/lib/utils/sanitize";

const DEFAULT_PAGE_SIZE = 20;

function buildOrder(sort: string | null) {
  switch (sort) {
    case "price_asc":
      return { salePriceTotalUsd: "asc" as const };
    case "price_desc":
      return { salePriceTotalUsd: "desc" as const };
    case "hectares_asc":
      return { hectaresTotal: "asc" as const };
    case "hectares_desc":
      return { hectaresTotal: "desc" as const };
    case "best":
      return { completenessScore: "desc" as const };
    case "newest":
    default:
      return { createdAt: "desc" as const };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE)
  );
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const minHectares = searchParams.get("minHectares");
  const maxHectares = searchParams.get("maxHectares");
  const department = searchParams.get("department");
  const district = searchParams.get("district");
  const type = searchParams.get("type");
  const modality = searchParams.get("modality");
  const hasWater = searchParams.get("hasWater");
  const hasElectricity = searchParams.get("hasElectricity");
  const yearRoundAccess = searchParams.get("yearRoundAccess");
  const maxSlopePercentRange = searchParams.get("maxSlopePercentRange");
  const sort = searchParams.get("sort");

  const where: any = {
    status: ListingStatus.PUBLISHED
  };

  if (minHectares || maxHectares) {
    where.hectaresTotal = {
      ...(minHectares ? { gte: Number(minHectares) } : {}),
      ...(maxHectares ? { lte: Number(maxHectares) } : {})
    };
  }

  if (department) where.department = department;
  if (district) where.district = district;
  if (type) where.type = type;
  if (modality) where.modality = modality;
  if (maxSlopePercentRange) where.maxSlopePercentRange = maxSlopePercentRange;
  if (hasElectricity !== null && hasElectricity !== "") where.hasElectricity = hasElectricity === "true";
  if (yearRoundAccess !== null && yearRoundAccess !== "") where.yearRoundAccess = yearRoundAccess === "true";
  if (hasWater !== null && hasWater !== "") {
    if (hasWater === "true") {
      where.waterSources = {
        hasSome: ["TAJAMAR", "ARROYO", "RIO", "POZO"]
      };
    } else {
      where.NOT = [
        {
          waterSources: {
            hasSome: ["TAJAMAR", "ARROYO", "RIO", "POZO"]
          }
        }
      ];
    }
  }

  if (minPrice || maxPrice) {
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;

    if (!modality) {
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
    } else if (modality === "VENTA") {
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
    } else if (modality === "ALQUILER") {
      where.rentUsdPerHaPerYear = {
        ...(min !== undefined ? { gte: min } : {}),
        ...(max !== undefined ? { lte: max } : {})
      };
    }
  }

  const [total, data] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      include: { images: true },
      orderBy: buildOrder(sort),
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  return NextResponse.json({
    data,
    meta: { page, pageSize, total }
  });
}

export async function POST(request: Request) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await (async () => {
    try {
      return await request.json();
    } catch {
      return null;
    }
  })();

  const parsed = listingDraftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listing = await prisma.listing.create({
    data: {
      ownerId: user.id,
      ...parsed.data,
      description: parsed.data.description ? sanitizeText(parsed.data.description) : null,
      status: ListingStatus.DRAFT
    }
  });

  return NextResponse.json({ data: listing }, { status: 201 });
}
