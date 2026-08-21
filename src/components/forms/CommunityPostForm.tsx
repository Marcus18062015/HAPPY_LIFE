"use client";

import { useActionState, useRef, useState } from "react";
import { createPostAction } from "@/lib/actions/community";
import SubmitButton from "../SubmitButton";
import { ImageIcon } from "../icons";

export default function CommunityPostForm() {
  const [state, formAction] = useActionState(createPostAction, undefined);
  const [apercu, setApercu] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setApercu(file ? URL.createObjectURL(file) : null);
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl bg-white p-4 card-shadow ring-1 ring-slate-100"
    >
      <p className="text-sm font-semibold text-slate-900">Partager une photo</p>

      <label
        htmlFor="communaute-photo"
        className="mt-3 flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 hover:border-brand-teal hover:text-brand-teal"
      >
        {apercu ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={apercu} alt="Aperçu" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1.5 text-xs font-medium">
            <ImageIcon className="h-6 w-6" />
            Choisir une photo
          </span>
        )}
      </label>
      <input
        ref={inputRef}
        id="communaute-photo"
        name="photo"
        type="file"
        accept="image/*"
        required
        onChange={handleFichier}
        className="hidden"
      />

      <textarea
        name="legende"
        rows={2}
        maxLength={280}
        placeholder="Une légende (optionnel)…"
        className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
      />

      {state?.error && <p className="mt-2 text-sm text-rose-600">{state.error}</p>}

      <SubmitButton className="mt-3 w-full rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
        Publier
      </SubmitButton>
    </form>
  );
}

