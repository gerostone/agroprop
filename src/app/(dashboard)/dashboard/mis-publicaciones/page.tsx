import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function MyListingsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-semibold">Mis publicaciones</h1>
        <p className="text-slate-600">
          Demo estática: esta sección se habilita con backend.
        </p>
      </main>
      <Footer />
    </div>
  );
}
