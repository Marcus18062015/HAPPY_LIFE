"use client";

import { useActionState } from "react";
import { createDemandeAction, type DemandeState } from "@/lib/actions/demandes";
import SubmitButton from "./SubmitButton";

export default function DemandeForm({ ficheId }: { ficheId: string }) {
  const action = createDemandeAction.bind(null, ficheId);
  const [state, formAction] = useActionState<DemandeState, FormData>(action, undefined);

  if (state?.success) {
    return (
      <div className="rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-800 ring-1 ring-emerald-200">
        <p className="font-semibold">Demande envoyée ✓</p>
        <p className="mt-1">
          Votre demande a bien été transmise à Happy Life. Le propriétaire vous
          recontactera directement — vos coordonnées ne sont partagées qu&apos;avec lui,
          jamais affichées publiquement.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700">Nom complet</label>
        <input
          name="nom"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          placeholder="Votre nom"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Téléphone</label>
        <input
          name="telephone"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          placeholder="Ex : 074 00 00 00"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Email <span className="text-slate-400">(optionnel)</span>
        </label>
        <input
          name="email"
          type="email"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          placeholder="vous@exemple.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Message <span className="text-slate-400">(dates souhaitées, nombre de personnes...)</span>
        </label>
        <textarea
          name="message"
          rows={3}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          placeholder="Précisez votre demande..."
        />
      </div>

      {state && "error" in state && state.error && (
        <p className="text-sm text-rose-600">{state.error}</p>
      )}

      <SubmitButton className="w-full rounded-xl brand-gradient px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
        Demande de réservation / Contacter via Happy Life
      </SubmitButton>
      <p className="text-center text-xs text-slate-400">
        Les numéros des propriétaires sont masqués. Toutes les demandes passent par
        Happy Life.
      </p>
    </form>
  );
}
