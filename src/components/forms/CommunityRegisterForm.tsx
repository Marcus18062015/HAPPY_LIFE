"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registerCommunityAction } from "@/lib/actions/community";
import SubmitButton from "../SubmitButton";

const TYPES_CONTACT = [
  { value: "telephone", label: "Téléphone" },
  { value: "whatsapp", label: "Numéro WhatsApp" },
  { value: "email", label: "Email" },
];

export default function CommunityRegisterForm() {
  const [state, formAction] = useActionState(registerCommunityAction, undefined);
  const [typeContact, setTypeContact] = useState("telephone");

  if (state?.success && state.membreId) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-brand-teal/10 px-4 py-3.5 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          <p className="font-semibold">Compte créé ✓</p>
          <p className="mt-1">
            Aucun fournisseur SMS/WhatsApp n&apos;est encore branché sur Happy Life : en
            attendant, voici votre code de vérification directement à l&apos;écran.
          </p>
          <p className="mt-3 text-center text-2xl font-bold tracking-[0.3em] text-brand-deep">
            {state.codeTest}
          </p>
        </div>
        <Link
          href={`/communaute/inscription/verification?membreId=${state.membreId}`}
          className="block w-full rounded-xl brand-gradient px-4 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90"
        >
          Continuer vers la vérification →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Votre nom</label>
        <input
          name="nom"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Vous nous rejoignez avec</label>
        <div className="mt-1 flex gap-2">
          {TYPES_CONTACT.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTypeContact(t.value)}
              className={`flex-1 rounded-xl px-2 py-2 text-xs font-semibold ring-1 transition ${
                typeContact === t.value
                  ? "bg-brand-teal text-white ring-brand-teal"
                  : "bg-white text-slate-600 ring-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="typeContact" value={typeContact} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          {typeContact === "email" ? "Adresse email" : "Numéro (+241...)"}
        </label>
        <input
          name="contact"
          required
          type={typeContact === "email" ? "email" : "tel"}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
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
        Rejoindre la communauté
      </SubmitButton>
    </form>
  );
}

