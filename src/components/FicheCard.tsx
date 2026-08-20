import Link from "next/link";
import Image from "next/image";
import type { Fiche } from "@/lib/types";
import { TYPE_LABELS, noteLabel } from "@/lib/constants";
import { PinIcon, StarIcon } from "./icons";
import FavoriButton from "./FavoriButton";

export default function FicheCard({
  fiche,
  isFavori = false,
  avis,
  compact = false,
}: {
  fiche: Fiche;
  isFavori?: boolean;
  avis?: { moyenne: number; total: number };
  compact?: boolean;
}) {
  const photo = fiche.photos[0];
  return (
    <Link
      href={`/fiche/${fiche.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white card-shadow ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className={`relative w-full overflow-hidden bg-slate-100 ${compact ? "h-32" : "h-40"}`}>
        {photo ? (
          <Image
            src={photo}
            alt={fiche.titre}
            fill
            sizes="(min-width: 1024px) 320px, 45vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center brand-gradient text-white/80 text-sm">
            Photo à venir
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-brand-deep shadow-sm">
          {TYPE_LABELS[fiche.type]}
        </span>
        <div className="absolute right-2.5 top-2.5">
          <FavoriButton ficheId={fiche.id} initialFavori={isFavori} size="sm" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-semibold text-slate-900 line-clamp-1">{fiche.titre}</h3>
        <p className="flex items-center gap-1 text-sm text-slate-500">
          <PinIcon className="h-3.5 w-3.5 shrink-0 text-brand-teal" />
          <span className="line-clamp-1">
            {fiche.zone}
            {fiche.quartier ? ` · ${fiche.quartier}` : ""}
          </span>
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p className="text-sm font-bold text-brand-teal">
            {fiche.tarif_indicatif || "Tarif sur demande"}
          </p>
          {avis && avis.total > 0 && (
            <span className="inline-flex shrink-0 flex-col items-end gap-0.5 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1">
                <StarIcon className="h-3.5 w-3.5 text-amber-400" />
                {avis.moyenne.toFixed(1)}
                <span className="text-slate-400">({avis.total})</span>
              </span>
              <span className="text-[10px] font-medium text-brand-teal">
                {noteLabel(avis.moyenne)}
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
