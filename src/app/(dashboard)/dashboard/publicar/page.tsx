import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ListingForm from "@/components/forms/ListingForm";

export default function PublishListingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-semibold">Publicar campo</h1>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <ListingForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
