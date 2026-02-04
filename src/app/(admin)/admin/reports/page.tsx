import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-semibold">Reportes</h1>
        <p className="text-slate-600">Contenido reportado y logs básicos.</p>
      </main>
      <Footer />
    </div>
  );
}
