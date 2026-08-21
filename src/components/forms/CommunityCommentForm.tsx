"use client";

import { useActionState } from "react";
import { addCommentAction } from "@/lib/actions/community";
import type { FormState } from "@/lib/actions/auth";
import SubmitButton from "../SubmitButton";

export default function CommunityCommentForm({ postId }: { postId: string }) {
  const action = addCommentAction.bind(null, postId);
  const [state, formAction] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="mt-2 flex items-center gap-2">
      <input
        name="texte"
        required
        placeholder="Ajouter un commentaire…"
        className="flex-1 rounded-full border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-brand-teal"
      />
      <SubmitButton className="rounded-full bg-brand-teal px-4 py-2 text-xs font-semibold text-white hover:opacity-90">
        Envoyer
      </SubmitButton>
      {state?.error && <p className="text-xs text-rose-600">{state.error}</p>}
    </form>
  );
}

