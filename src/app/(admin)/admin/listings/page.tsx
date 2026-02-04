import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/db";
import AdminListingActions from "@/components/admin/AdminListingActions";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  const listings = await prisma.listing.findMany({
    include: { owner: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-semibold">Moderación de listings</h1>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4">
            {listings.map((listing) => (
              <div key={listing.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm text-slate-500">{listing.owner?.email}</div>
                    <div className="text-lg font-semibold">{listing.title}</div>
                    <div className="text-sm text-slate-600">
                      {listing.department} · {listing.district}
                    </div>
                  </div>
                  <AdminListingActions listingId={listing.id} status={listing.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
