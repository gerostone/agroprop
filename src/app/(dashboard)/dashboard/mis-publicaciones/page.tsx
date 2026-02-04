import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import ListingGrid from "@/components/listing/ListingGrid";

export const dynamic = "force-dynamic";

export default async function MyListingsPage() {
  const session = await getServerAuthSession();
  const userEmail = session?.user?.email;

  const listings = userEmail
    ? await prisma.listing.findMany({
        where: { owner: { email: userEmail } },
        include: { images: true },
        orderBy: { updatedAt: "desc" }
      })
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-semibold">Mis publicaciones</h1>
        <ListingGrid listings={listings} />
      </main>
      <Footer />
    </div>
  );
}
