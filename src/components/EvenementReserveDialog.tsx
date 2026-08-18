"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useActionState } from "react";
import { createDemandeEvenementAction, type DemandeState } from "@/lib/actions/demandes";
import { CloseIcon } from "./icons";
import SubmitButton from "./SubmitButton";

export default function EvenementReserveDialog({
  evenementId,
  evenementTitre,
}: {
  evenementId: string;
  evenementTitre: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const action = createDemandeEvenementAction.bind(null, evenementId);
  const [state, formAction] = useActionState<DemandeState, FormData>(action, undefined);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 w-full rounded-full brand-gradient px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
      >
        Réserver ma place
      </button>

      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
            <button
              aria-label="Fermer"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-brand-deep/50 backdrop-blur-sm"
            />
            <div className="relative w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-teal">
                    Réservation
                  </p>
                  <h3 className="mt-0.5 text-lg font-bold text-slate-900">{evenementTitre}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              {state?.success ? (
                <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
                  <p className="font-semibold">Demande envoyée ✓</p>
                  <p className="mt-1">
                    Happy Life a bien reçu votre demande de place pour cet événement et vous
                    recontactera pour confirmer.
                  </p>
                </div>
              ) : (
                <form action={formAction} className="mt-4 space-y-3">
                  <input
                    name="nom"
                    required
                    placeholder="Votre nom"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
                  />
                  <input
                    name="telephone"
                    required
                    placeholder="Téléphone"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email (optionnel)"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
                  />
                  <textarea
                    name="message"
                    rows={2}
                    placeholder="Nombre de places souhaitées..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
                  />
                  {state && "error" in state && state.error && (
                    <p className="text-sm text-rose-600">{state.error}</p>
                  )}
                  <SubmitButton className="w-full rounded-xl brand-gradient px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
                    Confirmer ma demande
                  </SubmitButton>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
