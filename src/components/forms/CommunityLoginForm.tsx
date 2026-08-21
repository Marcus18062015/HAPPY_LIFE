"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginCommunityAction } from "@/lib/actions/community";
import SubmitButton from "../SubmitButton";

export default function CommunityLoginForm() {
  const [state, formAction] = useActionState(loginCommunityAction, undefined);
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
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
          <Link href="/communaute/mot-de-passe-oublie" className="text-xs font-medium text-brand-teal">
            Mot de passe oublié ?
          </Link>
        </div>
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
