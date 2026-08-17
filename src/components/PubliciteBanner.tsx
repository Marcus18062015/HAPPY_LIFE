import Link from "next/link";
import Image from "next/image";
import { MegaphoneIcon } from "./icons";
import type { PubliciteRecord } from "@/lib/types";

function PubliciteCard({ publicite }: { publicite: PubliciteRecord }) {
  const isExternal = publicite.lien?.startsWith("http");
  const content = (
    <div className="group flex h-full items-center gap-4 overflow-hidden rounded-2xl bg-white p-4 card-shadow ring-1 ring-slate-100 transition hover:-translate-y-0.5">
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
      <a href={publicite.lien} target="_blank" rel="noopener noreferrer" className="block h-full">
        {content}
      </a>
    );
  }

  return (
    <Link href={publicite.lien} className="block h-full">
      {content}
    </Link>
  );
}

// Encart publicitaire — fait défiler horizontalement, de droite à gauche, la
// totalité des publicités actives (déposées par l'administrateur ou par un
// propriétaire actif — mêmes droits, voir /admin/publicites). Le nombre de
// cartes affichées et la vitesse du défilement suivent automatiquement le
// nombre d'annonces en base : une seule annonce reste affichée simplement,
// sans défilement inutile.
export default function PubliciteBanner({ publicites }: { publicites: PubliciteRecord[] }) {
  if (publicites.length === 0) return null;

  if (publicites.length === 1) {
    return (
      <div className="w-full sm:w-[420px]">
        <PubliciteCard publicite={publicites[0]} />
      </div>
    );
  }

  // Vitesse constante par carte (~6s), quel que soit le nombre d'annonces.
  const duration = publicites.length * 6;

  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <div
        className="animate-marquee flex w-max gap-4"
        style={{ animationDuration: `${duration}s` }}
      >
        {[...publicites, ...publicites].map((p, i) => (
          <div key={`${p.id}-${i}`} className="w-[260px] shrink-0 sm:w-[340px]">
            <PubliciteCard publicite={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
