import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ListingGallery from "@/components/listing/ListingGallery";
import ContactForm from "@/components/forms/ContactForm";
import { prisma } from "@/lib/db";
import { buildListingMetadata } from "@/lib/seo/meta";
import { formatUsd } from "@/lib/utils/format";
import { ListingStatus } from "@prisma/client";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { slug: params.slug },
    include: { images: true }
  });

  if (!listing) return {};

  return buildListingMetadata({
    title: listing.title,
    description: listing.description.slice(0, 140),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/campo/${listing.slug}`,
    imageUrl: listing.images[0]?.url
  });
}

export default async function ListingDetailPage({ params }: { params: { slug: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { slug: params.slug },
    include: { images: true, owner: true }
  });

  if (!listing || listing.status !== ListingStatus.PUBLISHED) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
          <h1 className="text-2xl font-semibold">Publicación no disponible</h1>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold text-slate-900">{listing.title}</h1>
          <div className="text-slate-600">
            {listing.department} · {listing.district} · {listing.locationText}
          </div>
        </section>

        <ListingGallery images={listing.images} />

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Descripción</h2>
            <p className="mt-4 text-slate-700 whitespace-pre-line">{listing.description}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4 text-sm">
                <span className="text-slate-500">Precio</span>
                <div className="text-lg font-semibold text-brand-700">
                  {formatUsd(listing.priceUsd)}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-sm">
                <span className="text-slate-500">Hectáreas</span>
                <div className="text-lg font-semibold text-slate-900">
                  {listing.hectares} ha
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-sm">
                <span className="text-slate-500">Tipo</span>
                <div className="text-lg font-semibold text-slate-900">
                  {listing.type}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-sm">
                <span className="text-slate-500">Acceso</span>
                <div className="text-lg font-semibold text-slate-900">
                  {listing.accessType}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-sm">
                <span className="text-slate-500">Agua</span>
                <div className="text-lg font-semibold text-slate-900">
                  {listing.hasWater ? "Sí" : "No"}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-sm">
                <span className="text-slate-500">Título</span>
                <div className="text-lg font-semibold text-slate-900">
                  {listing.hasTitle ? "Sí" : "No"}
                </div>
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Consultar</h3>
              <p className="text-sm text-slate-600">
                Contactá al dueño sin exponer el email directamente.
              </p>
              <div className="mt-4">
                <ContactForm listingId={listing.id} />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              Publicado por {listing.owner?.name ?? "Propietario"}
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
