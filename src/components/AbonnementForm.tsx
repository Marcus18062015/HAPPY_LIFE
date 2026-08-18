"use client";

import { useActionState } from "react";
import { subscribeAbonneAction, type AbonneState } from "@/lib/actions/abonnes";
import { BellIcon } from "./icons";
import SubmitButton from "./SubmitButton";

export default function AbonnementForm() {
  const [state, formAction] = useActionState<AbonneState, FormData>(
    subscribeAbonneAction,
    undefined
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
      <div className="rounded-3xl bg-gradient-to-br from-brand-deep to-[#0f9baa] px-6 py-10 text-white sm:px-10">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2">
              <BellIcon className="h-5 w-5" />
              <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Espace visiteur
              </p>
            </div>
            <h2 className="mt-2 text-xl font-bold sm:text-2xl">
              Recevez les alertes Happy Life
            </h2>
            <p className="mt-1 text-sm text-white/80">
              Nouveaux événements, promotions et fiches publiées : inscrivez-vous pour ne
              rien manquer.
            </p>
          </div>

          <div className="w-full max-w-sm">
            {state?.success ? (
              <div className="rounded-2xl bg-white/15 p-4 text-sm ring-1 ring-white/25">
                <p className="font-semibold">Inscription confirmée ✓</p>
                <p className="mt-1 text-white/85">
                  Vous serez prévenu des prochaines actualités Happy Life.
                </p>
              </div>
            ) : (
              <form action={formAction} className="flex flex-col gap-2">
                <input
                  name="email"
                  type="email"
                  placeholder="Votre email"
                  className="rounded-xl bg-white/95 px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                <input
                  name="telephone"
                  placeholder="Votre téléphone"
                  className="rounded-xl bg-white/95 px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                {state && "error" in state && state.error && (
                  <p className="text-sm text-rose-100">{state.error}</p>
                )}
                <SubmitButton className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-deep hover:bg-white/90">
                  S&apos;abonner aux alertes
                </SubmitButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
