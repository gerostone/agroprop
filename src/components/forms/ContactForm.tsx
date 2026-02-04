"use client";

export default function ContactForm() {
  return (
    <form className="grid gap-3">
      <input
        name="senderName"
        placeholder="Nombre"
        className="rounded-xl border border-slate-200 px-4 py-2"
        disabled
      />
      <input
        name="senderEmail"
        type="email"
        placeholder="Email"
        className="rounded-xl border border-slate-200 px-4 py-2"
        disabled
      />
      <input
        name="senderPhone"
        placeholder="Teléfono"
        className="rounded-xl border border-slate-200 px-4 py-2"
        disabled
      />
      <textarea
        name="message"
        placeholder="Mensaje"
        rows={4}
        className="rounded-xl border border-slate-200 px-4 py-2"
        disabled
      />
      <button type="button" className="rounded-xl bg-brand-600 px-4 py-2 text-white" disabled>
        Enviar consulta
      </button>
      <p className="text-xs text-slate-500">Demo estática: formulario deshabilitado.</p>
    </form>
  );
}
