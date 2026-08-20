import Link from "next/link";
import { TagIcon } from "./icons";

export default function PromotionCard({
  ficheId,
  ficheTitre,
  titre,
  badge,
  reductionPct,
  prixOriginal,
  prixPromo,
}: {
  ficheId: string;
  ficheTitre: string;
  titre: string;
  badge: string;
  reductionPct: number;
  prixOriginal?: string | null;
  prixPromo?: string | null;
}) {
  return (
    <Link
      href={`/fiche/${ficheId}`}
      className="flex w-64 shrink-0 snap-start flex-col gap-2 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 ring-1 ring-amber-100 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white">
          <TagIcon className="h-3.5 w-3.5" />-{reductionPct}%
        </span>
        {badge && (
          <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-semibold text-rose-600">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-slate-900 line-clamp-1">{titre}</p>
      <p className="text-xs text-slate-500 line-clamp-1">{ficheTitre}</p>
      {(prixOriginal || prixPromo) && (
        <p className="mt-1 flex items-baseline gap-2">
          {prixOriginal && (
            <span className="text-xs text-slate-400 line-through">{prixOriginal}</span>
          )}
          {prixPromo && <span className="text-base font-bold text-orange-600">{prixPromo}</span>}
        </p>
      )}
    </Link>
  );
}
