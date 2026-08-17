"use client";

import { useActionState, useState } from "react";
import { createAvisAction, type AvisState } from "@/lib/actions/avis";
import { StarIcon } from "./icons";
import SubmitButton from "./SubmitButton";

export default function AvisForm({ ficheId }: { ficheId: string }) {
  const action = createAvisAction.bind(null, ficheId);
  const [state, formAction] = useActionState<AvisState, FormData>(action, undefined);
  const [note, setNote] = useState(0);
  const [hover, setHover] = useState(0);

  if (state?.success) {
    return (
      <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
        <p className="font-semibold">Merci pour votre avis ✓</p>
        <p className="mt-1">
          Il sera publié après vérification par l&apos;équipe Happy Life.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <p className="text-sm font-medium text-slate-700">Votre note</p>
        <div className="mt-1 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setNote(n)}
              className="p-0.5"
            >
              <StarIcon
                className={`h-6 w-6 ${
                  n <= (hover || note) ? "text-amber-400" : "text-slate-200"
                }`}
              />
            </button>
          ))}
        </div>
        <input type="hidden" name="note" value={note} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Votre nom</label>
        <input
          name="auteur_nom"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          placeholder="Votre nom"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Commentaire <span className="text-slate-400">(optionnel)</span>
        </label>
        <textarea
          name="commentaire"
          rows={3}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          placeholder="Votre expérience..."
        />
      </div>

      {state && "error" in state && state.error && (
        <p className="text-sm text-rose-600">{state.error}</p>
      )}

      <SubmitButton className="w-full rounded-xl border border-brand-teal px-4 py-2.5 text-sm font-semibold text-brand-deep hover:bg-brand-teal/10">
        Publier mon avis
      </SubmitButton>
    </form>
  );
}
