"use client";

import { useState } from "react";

export default function AdminListingActions({
  listingId,
  status
}: {
  listingId: string;
  status: string;
}) {
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);

  async function updateStatus(next: string) {
    setLoading(true);
    const response = await fetch("/api/admin/listings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, status: next })
    });

    if (response.ok) {
      setCurrent(next);
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <span className="rounded-full bg-slate-100 px-3 py-1">{current}</span>
      <button
        onClick={() => updateStatus("PUBLISHED")}
        className="rounded-full border border-slate-200 px-3 py-1"
        disabled={loading}
      >
        Aprobar
      </button>
      <button
        onClick={() => updateStatus("PAUSED")}
        className="rounded-full border border-slate-200 px-3 py-1"
        disabled={loading}
      >
        Pausar
      </button>
      <button
        onClick={() => updateStatus("ARCHIVED")}
        className="rounded-full border border-rose-200 px-3 py-1 text-rose-600"
        disabled={loading}
      >
        Archivar
      </button>
    </div>
  );
}
