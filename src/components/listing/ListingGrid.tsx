import ListingCard, { ListingCardData } from "@/components/listing/ListingCard";

export default function ListingGrid({ listings }: { listings: ListingCardData[] }) {
  if (!listings.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-600">
        No hay resultados para los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
