import Link from "next/link";
import Image from "next/image";
import { MegaphoneIcon } from "./icons";
import type { PubliciteRecord } from "@/lib/types";

// Encart publicitaire — affiche la publicité active la plus récente (les
// autres tournent au prochain chargement de page). Gestion complète côté
// admin (/admin/publicites) : création, activation/désactivation,
// suppression — voir demande explicite de l'utilisateur ("Vrai système
// admin").
export default function PubliciteBanner({ publicite }: { publicite: PubliciteRecord }) {
  const isExternal = publicite.lien?.startsWith("http");
  const content = (
    <div className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-white p-4 card-shadow ring-1 ring-slate-100 transition hover:-translate-y-0.5">
      {publicite.image && (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20">
          <Image src={publicite.image} alt="" fill className="object-cover" sizes="80px" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <MegaphoneIcon className="h-3.5 w-3.5" />
          Publicité
        </div>
        <p className="mt-0.5 truncate font-semibold text-slate-900">{publicite.titre}</p>
        {publicite.annonceur && (
          <p className="truncate text-sm text-slate-500">{publicite.annonceur}</p>
        )}
      </div>
    </div>
  );

  if (!publicite.lien) return content;

  if (isExternal) {
    return (
      <a href={publicite.lien} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return (
    <Link href={publicite.lien} className="block">
      {content}
    </Link>
  );
}
