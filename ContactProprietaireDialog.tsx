"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useActionState } from "react";
import {
  createDemandeContactProprietaireAction,
  type DemandeState,
} from "@/lib/actions/demandes";
import { CloseIcon } from "./icons";
import SubmitButton from "./SubmitButton";

export default function ContactProprietaireDialog({
  ownerId,
  ownerNom,
  fiches,
}: {
  ownerId: string;
  ownerNom: string;
  fiches: { id: string; titre: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const action = createDemandeContactProprietaireAction.bind(null, ownerId);
  const [state, formAction] = useActionState<DemandeState, FormData>(action, undefined);

  if (fiches.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-brand-cyan px-5 py-2.5 text-sm font-semibold text-brand-deep shadow-lg transition hover:bg-brand-cyan/90"
      >
        Contacter
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
            <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-teal">
                    Contacter via Happy Life
                  </p>
                  <h3 className="mt-0.5 text-lg font-bold text-slate-900">{ownerNom}</h3>
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
                    Happy Life a transmis votre demande. Le propriétaire vous recontactera
                    directement — vos coordonnées ne sont jamais affichées publiquement.
                  </p>
                </div>
              ) : (
                <form action={formAction} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      À propos de quelle fiche ?
                    </label>
                    <select
                      name="fiche_id"
                      required
                      defaultValue={fiches[0]?.id}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-teal"
                    >
                      {fiches.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.titre}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    rows={3}
                    placeholder="Votre message..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
                  />
                  {state && "error" in state && state.error && (
                    <p className="text-sm text-rose-600">{state.error}</p>
                  )}
                  <SubmitButton className="w-full rounded-xl brand-gradient px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
                    Envoyer la demande
                  </SubmitButton>
                  <p className="text-center text-xs text-slate-400">
                    Les numéros des propriétaires sont masqués. Toutes les demandes passent
                    par Happy Life.
                  </p>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
