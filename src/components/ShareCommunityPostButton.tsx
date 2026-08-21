"use client";

import { useState } from "react";
import { ShareIcon } from "./icons";

// Partage une publication du mur communautaire : télécharge d'abord la
// version avec filigrane Happy Life générée à la volée (voir
// src/app/api/communaute/partage/[postId]/route.ts) — la photo d'origine
// affichée sur le mur, elle, n'a jamais de filigrane. Utilise l'API de
// partage native quand elle est disponible (avec le fichier image
// directement), sinon propose un téléchargement classique.
export default function ShareCommunityPostButton({
  postId,
  legende,
}: {
  postId: string;
  legende?: string;
}) {
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState(false);

  async function handleShare() {
    setEnCours(true);
    setErreur(false);
    try {
      const res = await fetch(`/api/communaute/partage/${postId}`);
      if (!res.ok) throw new Error("échec");
      const blob = await res.blob();
      const file = new File([blob], `happy-life-${postId}.jpg`, { type: "image/jpeg" });

      if (
        typeof navigator !== "undefined" &&
        navigator.share &&
        navigator.canShare?.({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: "Happy Life",
            text: legende || "Vu sur Happy Life",
          });
          return;
        } catch {
          // Partage annulé par l'utilisateur — pas d'erreur à afficher.
          return;
        }
      }

      // Pas d'API de partage native (desktop, navigateur non compatible) :
      // on déclenche un téléchargement classique de l'image filigranée.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `happy-life-${postId}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErreur(true);
      setTimeout(() => setErreur(false), 2500);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={enCours}
      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
    >
      <ShareIcon className="h-3.5 w-3.5" />
      {enCours ? "…" : erreur ? "Réessayer" : "Partager"}
    </button>
  );
}

