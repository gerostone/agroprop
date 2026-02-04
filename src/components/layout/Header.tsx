import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-brand-700">
          AgroProp
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-700">
          <Link href="/resultados">Buscar</Link>
          <Link href="/login" className="rounded-full border border-slate-200 px-3 py-1">
            Ingresar
          </Link>
        </nav>
      </div>
    </header>
  );
}
