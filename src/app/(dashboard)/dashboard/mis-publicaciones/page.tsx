import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MyListingsPage() {
  const session = await getServerAuthSession();
  const userEmail = session?.user?.email;

  const listings = userEmail
    ? await prisma.listing.findMany({
        where: { owner: { email: userEmail } },
        orderBy: { updatedAt: "desc" }
      })
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Mis publicaciones</h1>
          <Link href="/dashboard/publicar" className="rounded-xl bg-brand-600 px-4 py-2 text-white">
            Nuevo aviso
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {listings.length === 0 ? (
            <p className="text-slate-600">No hay publicaciones todavía.</p>
          ) : (
            <ul className="grid gap-4">
              {listings.map((listing) => (
                <li key={listing.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm text-slate-500">{listing.status}</div>
                      <div className="text-lg font-semibold">{listing.title ?? "Sin título"}</div>
                      <div className="text-sm text-slate-600">
                        {listing.department ?? ""} {listing.district ? `· ${listing.district}` : ""}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <Link
                        href={`/dashboard/publicar/${listing.id}`}
                        className="rounded-full border border-slate-200 px-3 py-1"
                      >
                        Editar
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
