"use client";

import { useActionState } from "react";
import { loginProprietaireAction } from "@/lib/actions/auth";
import SubmitButton from "../SubmitButton";

export default function OwnerLoginForm() {
  const [state, formAction] = useActionState(loginProprietaireAction, undefined);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
        <input
          name="password"
          type="password"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <SubmitButton className="w-full rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
        Se connecter
      </SubmitButton>
    </form>
  );
}
