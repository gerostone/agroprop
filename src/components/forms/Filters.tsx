import { ListingType } from "@prisma/client";

export default function Filters({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <form action="/resultados" method="get" className="grid gap-3 md:grid-cols-3">
      <input
        name="department"
        defaultValue={searchParams.department as string}
        placeholder="Departamento"
        className="rounded-xl border border-slate-200 px-4 py-2"
      />
      <input
        name="district"
        defaultValue={searchParams.district as string}
        placeholder="Distrito"
        className="rounded-xl border border-slate-200 px-4 py-2"
      />
      <select
        name="type"
        defaultValue={(searchParams.type as string) ?? ""}
        className="rounded-xl border border-slate-200 px-4 py-2"
      >
        <option value="">Tipo</option>
        {Object.values(ListingType).map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>

      <input
        name="minPrice"
        defaultValue={searchParams.minPrice as string}
        placeholder="Precio mín."
        type="number"
        className="rounded-xl border border-slate-200 px-4 py-2"
      />
      <input
        name="maxPrice"
        defaultValue={searchParams.maxPrice as string}
        placeholder="Precio máx."
        type="number"
        className="rounded-xl border border-slate-200 px-4 py-2"
      />
      <input
        name="minHectares"
        defaultValue={searchParams.minHectares as string}
        placeholder="Hectáreas mín."
        type="number"
        className="rounded-xl border border-slate-200 px-4 py-2"
      />

      <input
        name="maxHectares"
        defaultValue={searchParams.maxHectares as string}
        placeholder="Hectáreas máx."
        type="number"
        className="rounded-xl border border-slate-200 px-4 py-2"
      />
      <select
        name="hasWater"
        defaultValue={(searchParams.hasWater as string) ?? ""}
        className="rounded-xl border border-slate-200 px-4 py-2"
      >
        <option value="">Agua</option>
        <option value="true">Tiene agua</option>
        <option value="false">Sin agua</option>
      </select>
      <select
        name="hasTitle"
        defaultValue={(searchParams.hasTitle as string) ?? ""}
        className="rounded-xl border border-slate-200 px-4 py-2"
      >
        <option value="">Título</option>
        <option value="true">Con título</option>
        <option value="false">Sin título</option>
      </select>

      <select
        name="accessType"
        defaultValue={(searchParams.accessType as string) ?? ""}
        className="rounded-xl border border-slate-200 px-4 py-2"
      >
        <option value="">Acceso</option>
        <option value="RUTA">Ruta</option>
        <option value="CAMINO">Camino</option>
        <option value="MIXTO">Mixto</option>
      </select>
      <select
        name="sort"
        defaultValue={(searchParams.sort as string) ?? "newest"}
        className="rounded-xl border border-slate-200 px-4 py-2"
      >
        <option value="newest">Más nuevos</option>
        <option value="price_asc">Precio: menor a mayor</option>
        <option value="price_desc">Precio: mayor a menor</option>
        <option value="hectares_asc">Hectáreas: menor a mayor</option>
        <option value="hectares_desc">Hectáreas: mayor a menor</option>
      </select>

      <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-white">
        Aplicar filtros
      </button>
    </form>
  );
}
