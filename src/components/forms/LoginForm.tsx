"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const response = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/dashboard"
    });

    if (response?.error) {
      setError("Credenciales inválidas");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
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
        Ingresar
      </button>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </form>
  );
}
