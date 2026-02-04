import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RegisterForm from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-md flex-col gap-6 px-6 py-12">
        <h1 className="text-2xl font-semibold">Crear cuenta</h1>
        <RegisterForm />
      </main>
      <Footer />
    </div>
  );
}
