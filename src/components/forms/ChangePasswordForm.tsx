"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/lib/actions/auth";
import SubmitButton from "../SubmitButton";

export default function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, undefined);

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Mot de passe actuel
        </label>
        <input
          name="motDePasseActuel"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Nouveau mot de passe
        </label>
        <input
          name="nouveauMotDePasse"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
        <p className="mt-1 text-xs text-slate-400">Au moins 6 caractères.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Confirmer le nouveau mot de passe
        </label>
        <input
          name="confirmation"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>

      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm font-medium text-emerald-600">
          Mot de passe mis à jour avec succès.
        </p>
      )}

      <SubmitButton className="rounded-xl brand-gradient px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
        Mettre à jour
      </SubmitButton>
    </form>
  );
}
