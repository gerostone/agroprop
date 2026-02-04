export default function SearchForm({ action = "/resultados" }: { action?: string }) {
  return (
    <form action={action} method="get" className="grid gap-3 md:grid-cols-4">
      <input
        name="q"
        placeholder="Buscar por zona o título"
        className="rounded-xl border border-slate-200 px-4 py-2"
      />
      <input
        name="minPrice"
        placeholder="Precio mín. (USD)"
        type="number"
        className="rounded-xl border border-slate-200 px-4 py-2"
      />
      <input
        name="maxPrice"
        placeholder="Precio máx. (USD)"
        type="number"
        className="rounded-xl border border-slate-200 px-4 py-2"
      />
      <button
        type="submit"
        className="rounded-xl bg-brand-600 px-4 py-2 text-white"
      >
        Buscar
      </button>
    </form>
  );
}
