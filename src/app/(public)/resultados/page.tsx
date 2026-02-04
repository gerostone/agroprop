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

  if (minPrice !== null || maxPrice !== null) {
    where.priceUsd = {
      ...(minPrice !== null ? { gte: minPrice } : {}),
      ...(maxPrice !== null ? { lte: maxPrice } : {})
    };
  }

  if (minHectares !== null || maxHectares !== null) {
    where.hectares = {
      ...(minHectares !== null ? { gte: minHectares } : {}),
      ...(maxHectares !== null ? { lte: maxHectares } : {})
    };
  }

  if (searchParams.department) where.department = searchParams.department;
  if (searchParams.district) where.district = searchParams.district;
  if (searchParams.type) where.type = searchParams.type;
  if (searchParams.accessType) where.accessType = searchParams.accessType;
  if (searchParams.hasWater !== undefined && searchParams.hasWater !== "") {
    where.hasWater = searchParams.hasWater === "true";
  }
  if (searchParams.hasTitle !== undefined && searchParams.hasTitle !== "") {
    where.hasTitle = searchParams.hasTitle === "true";
  }

  const sort = searchParams.sort ?? "newest";
  const orderBy =
    sort === "price_asc"
      ? { priceUsd: "asc" as const }
      : sort === "price_desc"
        ? { priceUsd: "desc" as const }
        : sort === "hectares_asc"
          ? { hectares: "asc" as const }
          : sort === "hectares_desc"
            ? { hectares: "desc" as const }
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
