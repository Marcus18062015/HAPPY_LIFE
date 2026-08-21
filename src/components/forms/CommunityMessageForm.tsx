"use client";

import { useActionState } from "react";
import { sendMessageAction } from "@/lib/actions/community";
import type { FormState } from "@/lib/actions/auth";
import SubmitButton from "../SubmitButton";

export default function CommunityMessageForm({ conversationId }: { conversationId: string }) {
  const action = sendMessageAction.bind(null, conversationId);
  const [state, formAction] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="border-t border-slate-100 bg-white p-3">
      <div className="flex items-center gap-2">
        <input
          name="texte"
          required
          placeholder="Écrire un message…"
          autoComplete="off"
          className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
        <SubmitButton className="rounded-full brand-gradient px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
          Envoyer
        </SubmitButton>
      </div>
      {state?.error && <p className="mt-1.5 text-xs text-rose-600">{state.error}</p>}
    </form>
  );
}

