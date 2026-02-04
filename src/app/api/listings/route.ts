import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { listingSchema } from "@/lib/validators/listing";
import { getServerAuthSession } from "@/lib/auth";
import slugify from "slugify";
import { ListingStatus } from "@prisma/client";

const DEFAULT_PAGE_SIZE = 20;

function buildOrder(sort: string | null) {
  switch (sort) {
    case "price_asc":
      return { priceUsd: "asc" as const };
    case "price_desc":
      return { priceUsd: "desc" as const };
    case "hectares_asc":
      return { hectares: "asc" as const };
    case "hectares_desc":
      return { hectares: "desc" as const };
    case "newest":
    default:
      return { createdAt: "desc" as const };
  }
}

async function getUniqueSlug(base: string) {
  let slug = slugify(base, { lower: true, strict: true });
  let suffix = 1;

  while (await prisma.listing.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${slugify(base, { lower: true, strict: true })}-${suffix}`;
  }

  return slug;
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
  const hasWater = searchParams.get("hasWater");
  const hasTitle = searchParams.get("hasTitle");
  const accessType = searchParams.get("accessType");
  const sort = searchParams.get("sort");

  const where: any = {
    status: ListingStatus.PUBLISHED
  };

  if (minPrice || maxPrice) {
    where.priceUsd = {
      ...(minPrice ? { gte: Number(minPrice) } : {}),
      ...(maxPrice ? { lte: Number(maxPrice) } : {})
    };
  }

  if (minHectares || maxHectares) {
    where.hectares = {
      ...(minHectares ? { gte: Number(minHectares) } : {}),
      ...(maxHectares ? { lte: Number(maxHectares) } : {})
    };
  }

  if (department) where.department = department;
  if (district) where.district = district;
  if (type) where.type = type;
  if (accessType) where.accessType = accessType;
  if (hasWater !== null) where.hasWater = hasWater === "true";
  if (hasTitle !== null) where.hasTitle = hasTitle === "true";

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

  const parsed = listingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = await getUniqueSlug(parsed.data.title);

  const listing = await prisma.listing.create({
    data: {
      ownerId: user.id,
      title: parsed.data.title,
      slug,
      priceUsd: Math.round(parsed.data.priceUsd),
      hectares: parsed.data.hectares,
      locationText: parsed.data.locationText,
      department: parsed.data.department,
      district: parsed.data.district,
      lat: parsed.data.lat ?? null,
      lng: parsed.data.lng ?? null,
      description: parsed.data.description,
      type: parsed.data.type,
      hasWater: parsed.data.hasWater,
      hasTitle: parsed.data.hasTitle,
      accessType: parsed.data.accessType,
      status: ListingStatus.DRAFT
    }
  });

  return NextResponse.json({ data: listing }, { status: 201 });
}
