import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const session = await getServerAuthSession();
  const userEmail = session?.user?.email;

  const leads = userEmail
    ? await prisma.lead.findMany({
        where: { listing: { owner: { email: userEmail } } },
        include: { listing: true },
        orderBy: { createdAt: "desc" }
      })
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {leads.length === 0 ? (
            <p className="text-slate-600">No hay consultas todavía.</p>
          ) : (
            <ul className="grid gap-4">
              {leads.map((lead) => (
                <li key={lead.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="text-sm text-slate-500">{lead.listing.title}</div>
                  <div className="font-semibold">{lead.senderName}</div>
                  <div className="text-sm text-slate-600">{lead.senderEmail}</div>
                  <div className="text-sm text-slate-600">{lead.senderPhone}</div>
                  <p className="mt-2 text-sm text-slate-700">{lead.message}</p>
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
