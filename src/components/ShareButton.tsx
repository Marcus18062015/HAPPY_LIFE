"use client";

import { useState } from "react";
import { ShareIcon } from "./icons";

// Bouton de partage réel (pas juste décoratif) : utilise l'API native de
// partage du téléphone (Safari iOS/Chrome Android) quand disponible,
// sinon copie le lien dans le presse-papiers avec confirmation visuelle.
export default function ShareButton({
  title,
  text,
  variant = "ghost-dark",
}: {
  title: string;
  text?: string;
  variant?: "ghost-dark" | "ghost-light";
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // L'utilisateur a annulé le partage natif — pas d'erreur à afficher.
        return;
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const cls =
    variant === "ghost-dark"
      ? "flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/35 backdrop-blur-md transition hover:bg-white/25"
      : "flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200";

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Partager"
      className={`relative ${cls}`}
    >
      <ShareIcon className="h-4 w-4" />
      {copied && (
        <span className="absolute -bottom-8 right-0 whitespace-nowrap rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white shadow">
          Lien copié ✓
        </span>
      )}
    </button>
  );
}
