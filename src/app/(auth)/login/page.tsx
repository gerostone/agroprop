import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-md flex-col gap-6 px-6 py-12">
        <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
}
