"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? "")
    };

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setError("No se pudo crear la cuenta");
      return;
    }

    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: true,
      callbackUrl: "/dashboard"
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <input
        name="name"
        placeholder="Nombre"
        className="rounded-xl border border-slate-200 px-4 py-2"
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="rounded-xl border border-slate-200 px-4 py-2"
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        className="rounded-xl border border-slate-200 px-4 py-2"
        required
      />
      <button className="rounded-xl bg-brand-600 px-4 py-2 text-white">
        Crear cuenta
      </button>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </form>
  );
}
