import Link from "next/link";
import Image from "next/image";
import { formatUsd } from "@/lib/utils/format";

export type ListingCardData = {
  id: string;
  slug: string;
  title: string;
  priceUsd: number;
  hectares: number;
  locationText: string;
  department: string;
  district: string;
  images?: { url: string }[];
};

export default function ListingCard({ listing }: { listing: ListingCardData }) {
  const cover = listing.images?.[0]?.url;

  return (
    <Link
      href={`/campo/${listing.slug}`}
      className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-44 w-full overflow-hidden rounded-t-2xl bg-slate-100">
        {cover ? (
          <Image
            src={cover}
            alt={listing.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <h3 className="text-base font-semibold text-slate-900">{listing.title}</h3>
        <div className="text-sm text-slate-600">
          {listing.department} · {listing.district}
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-semibold text-brand-700">
            {formatUsd(listing.priceUsd)}
          </span>
          <span className="text-sm text-slate-500">{listing.hectares} ha</span>
        </div>
        <div className="text-xs text-slate-500 truncate">{listing.locationText}</div>
      </div>
    </Link>
  );
}
