"use client";

import { useActionState, useState } from "react";
import { souscrireAbonnementAction } from "@/lib/actions/abonnement";
import { ABONNEMENT_OFFRES, MOYENS_PAIEMENT_ABONNEMENT, calculerMontantAbonnement } from "@/lib/constants";
import SubmitButton from "../SubmitButton";

function formatFcfa(montant: number): string {
  return `${montant.toLocaleString("fr-FR")} FCFA`;
}

export default function AbonnementProprietaireForm() {
  const [state, formAction] = useActionState(souscrireAbonnementAction, undefined);
  const [dureeMois, setDureeMois] = useState(1);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <p className="block text-sm font-medium text-slate-700">Choisissez une durée</p>
        <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {ABONNEMENT_OFFRES.map((offre) => {
            const montant = calculerMontantAbonnement(offre.mois);
            const checked = dureeMois === offre.mois;
            return (
              <label
                key={offre.mois}
                className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                  checked
                    ? "border-brand-teal bg-brand-teal/5 ring-1 ring-brand-teal"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="dureeMois"
                    value={offre.mois}
                    checked={checked}
                    onChange={() => setDureeMois(offre.mois)}
                    className="h-4 w-4 accent-brand-teal"
                  />
                  <span>
                    <span className="block font-semibold text-slate-900">{offre.label}</span>
                    {offre.remisePct > 0 && (
                      <span className="block text-xs text-emerald-600">
                        -{offre.remisePct}% de remise
                      </span>
                    )}
                  </span>
                </span>
                <span className="font-bold text-brand-deep">{formatFcfa(montant)}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Moyen de paiement utilisé
        </label>
        <select
          name="moyenPaiement"
          required
          defaultValue=""
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        >
          <option value="" disabled>
            Sélectionner...
          </option>
          {MOYENS_PAIEMENT_ABONNEMENT.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Référence de paiement (optionnel)
        </label>
        <input
          name="referencePaiement"
          type="text"
          placeholder="Ex: référence de la transaction Mobile Money"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>

      <label className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3.5 text-sm text-slate-600 ring-1 ring-slate-100">
        <input
          type="checkbox"
          name="confirmation"
          required
          className="mt-0.5 h-4 w-4 accent-brand-teal"
        />
        <span>
          Je confirme avoir effectué le paiement de{" "}
          <strong>{formatFcfa(calculerMontantAbonnement(dureeMois))}</strong> par le moyen
          indiqué ci-dessus. Cette souscription active immédiatement (ou prolonge) mon
          abonnement.
        </span>
      </label>

      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm font-medium text-emerald-600">
          Abonnement enregistré avec succès — vos fiches restent (ou redeviennent) visibles.
        </p>
      )}

      <SubmitButton className="w-full rounded-xl brand-gradient px-5 py-3 text-sm font-semibold text-white hover:opacity-90 sm:w-auto">
        Valider mon paiement
      </SubmitButton>
    </form>
  );
}
