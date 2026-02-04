import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Filters from "@/components/forms/Filters";
import ListingGrid from "@/components/listing/ListingGrid";
import { demoListings } from "@/lib/demo/data";

export default function ResultsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Resultados</h1>
          <p className="text-sm text-slate-600">{demoListings.length} publicaciones encontradas</p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Filters searchParams={searchParams} />
        </section>

        <section>
          <ListingGrid listings={demoListings} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
