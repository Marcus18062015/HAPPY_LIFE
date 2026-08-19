"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { MegaphoneIcon, CloseIcon } from "./icons";
import type { PubliciteRecord } from "@/lib/types";

function PubliciteCard({
  publicite,
  onOpen,
}: {
  publicite: PubliciteRecord;
  onOpen: (p: PubliciteRecord) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(publicite)}
      className="group flex h-full w-full items-center gap-4 overflow-hidden rounded-2xl bg-white p-4 text-left card-shadow ring-1 ring-slate-100 transition hover:-translate-y-0.5"
    >
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
    </button>
  );
}

// Détail d'une publicité, affiché dans une fenêtre modale sans quitter
// l'application (demande explicite de l'utilisateur — auparavant un clic
// ouvrait directement le lien, ce qui faisait sortir de l'app).
function PubliciteDetailDialog({
  publicite,
  onClose,
}: {
  publicite: PubliciteRecord;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isExternal = publicite.lien?.startsWith("http");

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-brand-deep/50 backdrop-blur-sm"
      />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        {publicite.image && (
          <div className="relative h-48 w-full shrink-0 sm:h-56">
            <Image
              src={publicite.image}
              alt=""
              fill
              className="object-cover sm:rounded-t-3xl"
              sizes="448px"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="p-5">
          {!publicite.image && (
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-teal">
            <MegaphoneIcon className="h-3.5 w-3.5" />
            Publicité
          </div>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{publicite.titre}</h3>
          {publicite.annonceur && (
            <p className="mt-0.5 text-sm text-slate-500">{publicite.annonceur}</p>
          )}
          {publicite.description && (
            <p className="mt-4 whitespace-pre-line text-sm text-slate-600">
              {publicite.description}
            </p>
          )}

          {publicite.lien &&
            (isExternal ? (
              <a
                href={publicite.lien}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 block rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Visiter le site de l&apos;annonceur
              </a>
            ) : (
              <Link
                href={publicite.lien}
                onClick={onClose}
                className="mt-5 block rounded-xl brand-gradient px-4 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90"
              >
                En savoir plus
              </Link>
            ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

// Encart publicitaire — fait défiler horizontalement, de droite à gauche, la
// totalité des publicités actives (déposées par l'administrateur, voir
// /admin/publicites). Le nombre de
// cartes affichées et la vitesse du défilement suivent automatiquement le
// nombre d'annonces en base : une seule annonce reste affichée simplement,
// sans défilement inutile. Un clic ouvre le détail dans une fenêtre modale,
// sans quitter l'application.
export default function PubliciteBanner({ publicites }: { publicites: PubliciteRecord[] }) {
  const [selected, setSelected] = useState<PubliciteRecord | null>(null);

  if (publicites.length === 0) return null;

  if (publicites.length === 1) {
    return (
      <>
        <div className="w-full sm:w-[420px]">
          <PubliciteCard publicite={publicites[0]} onOpen={setSelected} />
        </div>
        {selected && (
          <PubliciteDetailDialog publicite={selected} onClose={() => setSelected(null)} />
        )}
      </>
    );
  }

  // Vitesse constante par carte (~6s), quel que soit le nombre d'annonces.
  const duration = publicites.length * 6;

  return (
    <>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div
          className="animate-marquee flex w-max gap-4"
          style={{ animationDuration: `${duration}s` }}
        >
          {[...publicites, ...publicites].map((p, i) => (
            <div key={`${p.id}-${i}`} className="w-[260px] shrink-0 sm:w-[340px]">
              <PubliciteCard publicite={p} onOpen={setSelected} />
            </div>
          ))}
        </div>
      </div>
      {selected && (
        <PubliciteDetailDialog publicite={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
