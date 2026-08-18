"use client";

import { useState, useTransition } from "react";
import { HeartIcon } from "./icons";
import { toggleFavoriAction } from "@/lib/actions/favoris";

export default function FavoriButton({
  ficheId,
  initialFavori,
  size = "md",
}: {
  ficheId: string;
  initialFavori: boolean;
  size?: "sm" | "md";
}) {
  const [favori, setFavori] = useState(initialFavori);
  const [isPending, startTransition] = useTransition();

  const dim = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const iconDim = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";

  return (
    <button
      type="button"
      aria-label={favori ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={favori}
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setFavori((f) => !f);
        startTransition(async () => {
          const result = await toggleFavoriAction(ficheId);
          setFavori(result.isFavori);
        });
      }}
      className={`flex ${dim} items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-sm backdrop-blur transition hover:bg-white disabled:opacity-70`}
    >
      <HeartIcon className={iconDim} filled={favori} />
    </button>
  );
}
