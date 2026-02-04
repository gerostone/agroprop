import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchForm from "@/components/forms/SearchForm";
import ListingGrid from "@/components/listing/ListingGrid";
import { prisma } from "@/lib/db";
import { ListingStatus } from "@prisma/client";

export const revalidate = 60;

export default async function HomePage() {
  const listings = await prisma.listing.findMany({
    where: { status: ListingStatus.PUBLISHED },
    include: { images: true },
    orderBy: { createdAt: "desc" },
    take: 6
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-3">
            <h1 className="text-3xl font-semibold text-slate-900">
              AgroProp: encontrá tu próximo campo en Paraguay
            </h1>
            <p className="text-slate-600">
              Buscá por precio, hectáreas, departamento y más.
            </p>
          </div>
          <SearchForm />
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Destacados</h2>
          </div>
          <ListingGrid listings={listings} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
