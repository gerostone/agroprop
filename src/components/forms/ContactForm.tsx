"use client";

import { useState } from "react";

export default function ContactForm({ listingId }: { listingId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      listingId,
      senderName: formData.get("senderName"),
      senderEmail: formData.get("senderEmail"),
      senderPhone: formData.get("senderPhone"),
      message: formData.get("message")
    };

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      form.reset();
      setStatus("success");
      return;
    }

    setStatus("error");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <input
        name="senderName"
        placeholder="Nombre"
        className="rounded-xl border border-slate-200 px-4 py-2"
        required
      />
      <input
        name="senderEmail"
        type="email"
        placeholder="Email"
        className="rounded-xl border border-slate-200 px-4 py-2"
        required
      />
      <input
        name="senderPhone"
        placeholder="Teléfono"
        className="rounded-xl border border-slate-200 px-4 py-2"
        required
      />
      <textarea
        name="message"
        placeholder="Mensaje"
        rows={4}
        className="rounded-xl border border-slate-200 px-4 py-2"
        required
      />
      <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-white">
        Enviar consulta
      </button>
      {status === "success" && (
        <p className="text-sm text-emerald-600">Consulta enviada.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-rose-600">No se pudo enviar. Intenta de nuevo.</p>
      )}
    </form>
  );
}
