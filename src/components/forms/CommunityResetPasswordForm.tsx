"use client";

import { useActionState, useState, useTransition } from "react";
import {
  reinitialiserMotDePasseCommunityAction,
  resendCommunityCodeAction,
} from "@/lib/actions/community";
import SubmitButton from "../SubmitButton";

export default function CommunityResetPasswordForm({ membreId }: { membreId: string }) {
  const [state, formAction] = useActionState(reinitialiserMotDePasseCommunityAction, undefined);
  const [nouveauCode, setNouveauCode] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleRenvoyer() {
    startTransition(async () => {
      // Régénère un code sur les mêmes colonnes que la vérification
      // d'inscription (voir community.ts) — même action que "renvoyer le
      // code" à l'inscription, réutilisée telle quelle ici.
      const res = await resendCommunityCodeAction(membreId);
      if (res?.codeTest) setNouveauCode(res.codeTest);
    });
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="membreId" value={membreId} />

      {nouveauCode && (
        <div className="rounded-xl bg-brand-teal/10 px-4 py-3 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          <p>Nouveau code de test :</p>
          <p className="mt-1 text-center text-2xl font-bold tracking-[0.3em]">{nouveauCode}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">Code à 6 chiffres</label>
        <input
          name="code"
          required
          maxLength={6}
          inputMode="numeric"
          autoComplete="one-time-code"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-center text-lg font-semibold tracking-[0.3em] outline-none focus:border-brand-teal"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
        <input
          name="nouveauMotDePasse"
          type="password"
          minLength={6}
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Confirmer le nouveau mot de passe
        </label>
        <input
          name="confirmation"
          type="password"
          minLength={6}
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>

      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <SubmitButton className="w-full rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
        Réinitialiser le mot de passe
      </SubmitButton>

      <button
        type="button"
        onClick={handleRenvoyer}
        disabled={pending}
        className="w-full text-center text-xs font-medium text-slate-400 hover:text-brand-teal disabled:opacity-60"
      >
        {pending ? "…" : "Je n'ai pas reçu de code — en générer un nouveau"}
      </button>
    </form>
  );
}
