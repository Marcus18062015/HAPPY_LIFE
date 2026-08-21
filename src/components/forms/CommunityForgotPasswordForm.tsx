"use client";

import { useActionState } from "react";
import Link from "next/link";
import { demanderReinitialisationCommunityAction } from "@/lib/actions/community";
import SubmitButton from "../SubmitButton";

export default function CommunityForgotPasswordForm() {
  const [state, formAction] = useActionState(demanderReinitialisationCommunityAction, undefined);

  if (state?.success && state.membreId) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-brand-teal/10 px-4 py-3.5 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          <p className="font-semibold">Code envoyé ✓</p>
          <p className="mt-1">
            Aucun fournisseur SMS/WhatsApp n&apos;est encore branché sur Happy Life : en
            attendant, voici votre code directement à l&apos;écran.
          </p>
          <p className="mt-3 text-center text-2xl font-bold tracking-[0.3em] text-brand-deep">
            {state.codeTest}
          </p>
        </div>
        <Link
          href={`/communaute/mot-de-passe-oublie/reinitialiser?membreId=${state.membreId}`}
          className="block w-full rounded-xl brand-gradient px-4 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90"
        >
          Continuer vers la réinitialisation →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Téléphone, WhatsApp ou email
        </label>
        <input
          name="contact"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>

      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <SubmitButton className="w-full rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
        Recevoir un code
      </SubmitButton>
    </form>
  );
}
