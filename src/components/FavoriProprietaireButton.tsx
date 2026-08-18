"use client";

import { useState, useTransition } from "react";
import { HeartIcon } from "./icons";
import { toggleFavoriProprietaireAction } from "@/lib/actions/favoris";

// Bouton "♥ Favoris" façon pilule verre, utilisé dans le ProfileHero de la
// vitrine propriétaire — remplace le "+ Follow" du mockup (Happy Life
// n'a pas de compte visiteur ni de suivi social, voir README).
export default function FavoriProprietaireButton({
  ownerId,
  initialFavori,
}: {
  ownerId: string;
  initialFavori: boolean;
}) {
  const [favori, setFavori] = useState(initialFavori);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={favori}
      disabled={isPending}
      onClick={() => {
        setFavori((f) => !f);
        startTransition(async () => {
          const result = await toggleFavoriProprietaireAction(ownerId);
          setFavori(result.isFavori);
        });
      }}
      className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/35 backdrop-blur-md transition hover:bg-white/25 disabled:opacity-70"
    >
      <HeartIcon className="h-4 w-4" filled={favori} />
      {favori ? "Favori" : "Favoris"}
    </button>
  );
}
