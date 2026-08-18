"use client";

import { useActionState } from "react";
import { registerProprietaireAction } from "@/lib/actions/auth";
import SubmitButton from "../SubmitButton";

export default function OwnerRegisterForm() {
  const [state, formAction] = useActionState(registerProprietaireAction, undefined);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Nom / Raison sociale</label>
        <input
          name="nom"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>
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
        <label className="block text-sm font-medium text-slate-700">Téléphone</label>
        <input
          name="telephone"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          placeholder="Ce numéro reste privé, jamais affiché publiquement"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
        <input
          name="password"
          type="password"
          minLength={6}
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <SubmitButton className="w-full rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
        Créer mon compte propriétaire
      </SubmitButton>
      <p className="text-xs text-slate-400">
        Votre fiche sera visible publiquement uniquement après validation par
        l&apos;administrateur Happy Life.
      </p>
    </form>
  );
}
