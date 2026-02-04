"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ListingFormData = {
  id?: string;
  title?: string | null;
  locationText?: string | null;
  department?: string | null;
  district?: string | null;
  hectaresTotal?: number | null;
  type?: "AGRICOLA" | "GANADERO" | "MIXTO" | "ARROCERO" | "FORESTAL" | null;
  modality?: "VENTA" | "ALQUILER" | null;
  description?: string | null;
  phoneWhatsapp?: string | null;
  contactEmail?: string | null;
  salePriceTotalUsd?: number | null;
  salePriceUsdPerHa?: number | null;
  rentUsdPerHaPerYear?: number | null;
  rentCropSharePercent?: number | null;
  lat?: number | null;
  lng?: number | null;
  productiveAptitude?: string | null;
  currentUse?: string | null;
  rotationsHistory?: string | null;
  soilType?: string | null;
  productivityIndex?: number | null;
  waterSources?: string[];
  hasElectricity?: boolean | null;
  hasInternalRoads?: boolean | null;
  hasFences?: boolean | null;
  hasCorrals?: boolean | null;
  hasSilos?: boolean | null;
  hasSheds?: boolean | null;
  distanceToPavedRouteKm?: number | null;
  distanceToTownKm?: number | null;
  yearRoundAccess?: boolean | null;
  maxSlopePercentRange?: "P0_2" | "P2_5" | "P5_10" | "P10_PLUS" | null;
  status?: "DRAFT" | "PUBLISHED" | "PAUSED" | "ARCHIVED" | null;
};

const emptyForm: ListingFormData = {
  title: "",
  locationText: "",
  department: "",
  district: "",
  hectaresTotal: null,
  type: null,
  modality: null,
  description: "",
  phoneWhatsapp: "",
  contactEmail: "",
  salePriceTotalUsd: null,
  salePriceUsdPerHa: null,
  rentUsdPerHaPerYear: null,
  rentCropSharePercent: null,
  lat: null,
  lng: null,
  productiveAptitude: "",
  currentUse: "",
  rotationsHistory: "",
  soilType: "",
  productivityIndex: null,
  waterSources: [],
  hasElectricity: false,
  hasInternalRoads: false,
  hasFences: false,
  hasCorrals: false,
  hasSilos: false,
  hasSheds: false,
  distanceToPavedRouteKm: null,
  distanceToTownKm: null,
  yearRoundAccess: false,
  maxSlopePercentRange: null,
  status: "DRAFT"
};

const steps = [
  { id: 1, label: "Ubicación" },
  { id: 2, label: "Datos principales" },
  { id: 3, label: "Precio" },
  { id: 4, label: "Descripción + diferenciales" },
  { id: 5, label: "Fotos + mapa" },
  { id: 6, label: "Contacto" }
];

function buildChecklist(form: ListingFormData) {
  const items = [
    {
      key: "location",
      label: "Ubicación (departamento y distrito)",
      complete: Boolean(form.department && form.district)
    },
    {
      key: "surface",
      label: "Superficie total",
      complete: Boolean(form.hectaresTotal && form.hectaresTotal > 0)
    },
    {
      key: "type",
      label: "Tipo de campo",
      complete: Boolean(form.type)
    },
    {
      key: "modality",
      label: "Modalidad",
      complete: Boolean(form.modality)
    },
    {
      key: "price",
      label: "Precio",
      complete: Boolean(
        (form.modality === "VENTA" && (form.salePriceTotalUsd || form.salePriceUsdPerHa)) ||
          (form.modality === "ALQUILER" &&
            (form.rentUsdPerHaPerYear ||
              (form.rentCropSharePercent !== null && form.rentCropSharePercent !== undefined)))
      )
    },
    {
      key: "contact",
      label: "Contacto (WhatsApp y email)",
      complete: Boolean(form.phoneWhatsapp && form.contactEmail)
    }
  ];

  const completed = items.filter((item) => item.complete).length;
  return { items, completed, total: items.length };
}

async function uploadImages(listingId: string, files: File[]) {
  if (!files.length) return;

  const uploadedUrls: string[] = [];

  for (const file of files) {
    const signRes = await fetch("/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        fileName: file.name,
        contentType: file.type
      })
    });

    if (!signRes.ok) throw new Error("No se pudo firmar el upload");
    const signJson = await signRes.json();

    const { uploadUrl, fileUrl } = signJson.data;

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file
    });

    if (!putRes.ok) throw new Error("No se pudo subir la imagen");
    uploadedUrls.push(fileUrl);
  }

  if (uploadedUrls.length) {
    await fetch(`/api/listings/${listingId}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(uploadedUrls.map((url, index) => ({ url, sortOrder: index })))
    });
  }
}

export default function ListingForm({ initial }: { initial?: ListingFormData }) {
  const [form, setForm] = useState<ListingFormData>(initial ?? emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [autoSaveState, setAutoSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const didMount = useRef(false);

  const checklist = useMemo(() => buildChecklist(form), [form]);
  const hasTitle = Boolean(form.title && form.title.length >= 5);
  const hasDescription = Boolean(form.description && form.description.length >= 80);
  const canPublish = checklist.completed === checklist.total && hasTitle && hasDescription;

  function updateField<K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveDraft() {
    setAutoSaveState("saving");
    const payload = { ...form };
    delete (payload as any).status;

    try {
      const response = await fetch(form.id ? `/api/listings/${form.id}` : "/api/listings", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        setAutoSaveState("error");
        return;
      }

      const json = await response.json();
      if (!form.id) {
        setForm((prev) => ({ ...prev, id: json.data.id }));
      }
      setAutoSaveState("saved");
    } catch (err) {
      setAutoSaveState("error");
    }
  }

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveDraft();
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form]);

  async function handlePublish() {
    if (!form.id) {
      await saveDraft();
    }

    if (!form.id) {
      setError("No se pudo crear el borrador para publicar");
      return;
    }

    setStatus("loading");
    setError(null);

    const response = await fetch(`/api/listings/${form.id}/publish`, {
      method: "POST"
    });

    if (!response.ok) {
      const json = await response.json().catch(() => null);
      setError(json?.error ?? "No se pudo publicar");
      setStatus("error");
      return;
    }

    if (files.length) {
      await uploadImages(form.id, files);
    }

    setStatus("success");
    router.push("/dashboard/mis-publicaciones");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <div>
            Paso {step} de {steps.length}: {steps[step - 1].label}
          </div>
          <div>
            Autosave: {autoSaveState === "saving" ? "guardando" : autoSaveState === "saved" ? "guardado" : ""}
          </div>
        </div>
        {autoSaveState === "error" && (
          <p className="text-sm text-rose-600">No se pudo guardar el borrador.</p>
        )}

        {step === 1 && (
          <div className="grid gap-4">
            <input
              value={form.department ?? ""}
              onChange={(e) => updateField("department", e.target.value)}
              placeholder="Departamento"
              className="rounded-xl border border-slate-200 px-4 py-2"
            />
            <input
              value={form.district ?? ""}
              onChange={(e) => updateField("district", e.target.value)}
              placeholder="Distrito"
              className="rounded-xl border border-slate-200 px-4 py-2"
            />
            <input
              value={form.locationText ?? ""}
              onChange={(e) => updateField("locationText", e.target.value)}
              placeholder="Ubicación adicional (opcional)"
              className="rounded-xl border border-slate-200 px-4 py-2"
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <select
              value={form.type ?? ""}
              onChange={(e) => updateField("type", e.target.value as ListingFormData["type"])}
              className="rounded-xl border border-slate-200 px-4 py-2"
            >
              <option value="">Tipo de campo</option>
              <option value="AGRICOLA">Agrícola</option>
              <option value="GANADERO">Ganadero</option>
              <option value="MIXTO">Mixto</option>
              <option value="ARROCERO">Arrocero</option>
              <option value="FORESTAL">Forestal</option>
            </select>
            <select
              value={form.modality ?? ""}
              onChange={(e) => updateField("modality", e.target.value as ListingFormData["modality"])}
              className="rounded-xl border border-slate-200 px-4 py-2"
            >
              <option value="">Modalidad</option>
              <option value="VENTA">Venta</option>
              <option value="ALQUILER">Alquiler</option>
            </select>
            <input
              value={form.hectaresTotal ?? ""}
              onChange={(e) => updateField("hectaresTotal", e.target.value ? Number(e.target.value) : null)}
              placeholder="Hectáreas totales"
              type="number"
              className="rounded-xl border border-slate-200 px-4 py-2"
            />
            <input
              value={form.title ?? ""}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Título (opcional, se auto-sugiere)"
              className="rounded-xl border border-slate-200 px-4 py-2"
            />
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4">
            {form.modality === "VENTA" && (
              <>
                <input
                  value={form.salePriceTotalUsd ?? ""}
                  onChange={(e) => updateField("salePriceTotalUsd", e.target.value ? Number(e.target.value) : null)}
                  placeholder="Precio total USD"
                  type="number"
                  className="rounded-xl border border-slate-200 px-4 py-2"
                />
                <input
                  value={form.salePriceUsdPerHa ?? ""}
                  onChange={(e) => updateField("salePriceUsdPerHa", e.target.value ? Number(e.target.value) : null)}
                  placeholder="Precio USD por ha"
                  type="number"
                  className="rounded-xl border border-slate-200 px-4 py-2"
                />
              </>
            )}
            {form.modality === "ALQUILER" && (
              <>
                <input
                  value={form.rentUsdPerHaPerYear ?? ""}
                  onChange={(e) => updateField("rentUsdPerHaPerYear", e.target.value ? Number(e.target.value) : null)}
                  placeholder="USD por ha / año"
                  type="number"
                  className="rounded-xl border border-slate-200 px-4 py-2"
                />
                <input
                  value={form.rentCropSharePercent ?? ""}
                  onChange={(e) => updateField("rentCropSharePercent", e.target.value ? Number(e.target.value) : null)}
                  placeholder="% cosecha"
                  type="number"
                  className="rounded-xl border border-slate-200 px-4 py-2"
                />
              </>
            )}
            {!form.modality && (
              <p className="text-sm text-slate-600">Seleccioná modalidad para cargar precios.</p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-4">
            <textarea
              value={form.description ?? ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Descripción (mín. 80 caracteres)"
              rows={6}
              className="rounded-xl border border-slate-200 px-4 py-2"
            />
            <input
              value={form.productiveAptitude ?? ""}
              onChange={(e) => updateField("productiveAptitude", e.target.value)}
              placeholder="Aptitud productiva"
              className="rounded-xl border border-slate-200 px-4 py-2"
            />
            <input
              value={form.currentUse ?? ""}
              onChange={(e) => updateField("currentUse", e.target.value)}
              placeholder="Uso actual"
              className="rounded-xl border border-slate-200 px-4 py-2"
            />
            <input
              value={form.rotationsHistory ?? ""}
              onChange={(e) => updateField("rotationsHistory", e.target.value)}
              placeholder="Historia de rotaciones"
              className="rounded-xl border border-slate-200 px-4 py-2"
            />
            <input
              value={form.soilType ?? ""}
              onChange={(e) => updateField("soilType", e.target.value)}
              placeholder="Tipo de suelo"
              className="rounded-xl border border-slate-200 px-4 py-2"
            />
            <input
              value={form.productivityIndex ?? ""}
              onChange={(e) => updateField("productivityIndex", e.target.value ? Number(e.target.value) : null)}
              placeholder="Índice de productividad"
              type="number"
              className="rounded-xl border border-slate-200 px-4 py-2"
            />

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-700">Infraestructura</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[
                  ["hasElectricity", "Electricidad"],
                  ["hasInternalRoads", "Caminos internos"],
                  ["hasFences", "Alambrados"],
                  ["hasCorrals", "Corrales"],
                  ["hasSilos", "Silos"],
                  ["hasSheds", "Galpones"]
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={Boolean((form as any)[key])}
                      onChange={(e) => updateField(key as keyof ListingFormData, e.target.checked as any)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-700">Agua</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[
                  "TAJAMAR",
                  "ARROYO",
                  "RIO",
                  "POZO",
                  "NINGUNO"
                ].map((source) => (
                  <label key={source} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={form.waterSources?.includes(source) ?? false}
                      onChange={(e) => {
                        const current = new Set(form.waterSources ?? []);
                        if (e.target.checked) {
                          if (source === "NINGUNO") {
                            updateField("waterSources", ["NINGUNO"]);
                            return;
                          }
                          current.add(source);
                          current.delete("NINGUNO");
                        } else {
                          current.delete(source);
                        }
                        updateField("waterSources", Array.from(current));
                      }}
                    />
                    {source}
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-700">Logística</p>
              <div className="mt-2 grid gap-2">
                <input
                  value={form.distanceToPavedRouteKm ?? ""}
                  onChange={(e) => updateField("distanceToPavedRouteKm", e.target.value ? Number(e.target.value) : null)}
                  placeholder="Distancia a ruta pavimentada (km)"
                  type="number"
                  className="rounded-xl border border-slate-200 px-4 py-2"
                />
                <input
                  value={form.distanceToTownKm ?? ""}
                  onChange={(e) => updateField("distanceToTownKm", e.target.value ? Number(e.target.value) : null)}
                  placeholder="Distancia a ciudad (km)"
                  type="number"
                  className="rounded-xl border border-slate-200 px-4 py-2"
                />
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={Boolean(form.yearRoundAccess)}
                    onChange={(e) => updateField("yearRoundAccess", e.target.checked)}
                  />
                  Acceso todo el año
                </label>
              </div>
            </div>

            <select
              value={form.maxSlopePercentRange ?? ""}
              onChange={(e) => updateField("maxSlopePercentRange", e.target.value as ListingFormData["maxSlopePercentRange"])}
              className="rounded-xl border border-slate-200 px-4 py-2"
            >
              <option value="">Pendiente máxima</option>
              <option value="P0_2">0-2%</option>
              <option value="P2_5">2-5%</option>
              <option value="P5_10">5-10%</option>
              <option value="P10_PLUS">10%+</option>
            </select>
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-4">
            <div>
              <label className="text-sm text-slate-600">Fotos</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="mt-2"
              />
              <p className="text-xs text-slate-500">Recomendado: 5+ imágenes.</p>
            </div>
            <div className="grid gap-2">
              <input
                value={form.lat ?? ""}
                onChange={(e) => updateField("lat", e.target.value ? Number(e.target.value) : null)}
                placeholder="Latitud (opcional)"
                type="number"
                className="rounded-xl border border-slate-200 px-4 py-2"
              />
              <input
                value={form.lng ?? ""}
                onChange={(e) => updateField("lng", e.target.value ? Number(e.target.value) : null)}
                placeholder="Longitud (opcional)"
                type="number"
                className="rounded-xl border border-slate-200 px-4 py-2"
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="grid gap-4">
            <input
              value={form.phoneWhatsapp ?? ""}
              onChange={(e) => updateField("phoneWhatsapp", e.target.value)}
              placeholder="WhatsApp"
              className="rounded-xl border border-slate-200 px-4 py-2"
            />
            <input
              value={form.contactEmail ?? ""}
              onChange={(e) => updateField("contactEmail", e.target.value)}
              placeholder="Email de contacto"
              type="email"
              className="rounded-xl border border-slate-200 px-4 py-2"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            className="rounded-xl border border-slate-200 px-4 py-2"
            disabled={step === 1}
          >
            Atrás
          </button>
          <button
            type="button"
            onClick={() => setStep((prev) => Math.min(steps.length, prev + 1))}
            className="rounded-xl bg-slate-900 px-4 py-2 text-white"
            disabled={step === steps.length}
          >
            Siguiente
          </button>
        </div>
      </div>

      <aside className="flex flex-col gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Completar para publicar</span>
            <span>
              {checklist.completed}/{checklist.total}
            </span>
          </div>
          <ul className="mt-3 grid gap-2 text-slate-600">
            {checklist.items.map((item) => (
              <li key={item.key} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${item.complete ? "bg-emerald-500" : "bg-slate-300"}`} />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={handlePublish}
          className="rounded-xl bg-brand-600 px-4 py-2 text-white"
          disabled={!canPublish || status === "loading"}
        >
          {status === "loading" ? "Publicando..." : "Publicar"}
        </button>

        {!canPublish && (
          <p className="text-xs text-slate-500">
            Completá los datos obligatorios para habilitar la publicación.
          </p>
        )}
        {!hasTitle && (
          <p className="text-xs text-amber-600">Falta título (mínimo 5 caracteres).</p>
        )}
        {!hasDescription && (
          <p className="text-xs text-amber-600">Falta descripción (mínimo 80 caracteres).</p>
        )}
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </aside>
    </div>
  );
}
