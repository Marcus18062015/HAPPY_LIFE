"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import LogoMark from "./LogoMark";
import { MenuIcon, CloseIcon, UserIcon } from "./icons";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/recherche?type=PISCINE", label: "Piscines" },
  { href: "/recherche?type=APPARTEMENT", label: "Appartements meublés" },
  { href: "/recherche", label: "Rechercher" },
  { href: "/favoris", label: "Mes favoris" },
  { href: "/mes-reservations", label: "Mes réservations" },
  { href: "/a-propos", label: "À propos de Happy Life" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // La superposition (drawer) est rendue via un portail dans <body> : le
  // <header> parent utilise backdrop-blur (backdrop-filter), qui crée un
  // nouveau "containing block" pour les descendants en position fixed.
  // Sans portail, le drawer se positionnait par rapport à la barre d'en-tête
  // (~64px) au lieu du viewport entier, ce qui l'écrasait visuellement.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-brand-deep shadow-sm"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-50">
            <button
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-brand-deep/50 backdrop-blur-sm"
            />
            <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-white p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                  <LogoMark size={30} radius={9} />
                  <span className="text-base font-bold brand-gradient-text">Happy Life</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                >
                  <CloseIcon className="h-4.5 w-4.5" />
                </button>
              </div>

              <nav className="mt-8 flex flex-col gap-1 text-[15px] font-medium text-slate-700">
                {LINKS.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 hover:bg-brand-teal/10 hover:text-brand-deep"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-5">
                <Link
                  href="/proprietaire/inscription"
                  onClick={() => setOpen(false)}
                  className="rounded-full brand-gradient px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Publier une fiche
                </Link>
                <Link
                  href="/proprietaire"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-center text-sm font-medium text-brand-deep"
                >
                  <UserIcon className="h-4 w-4" /> Espace propriétaire
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="rounded-full px-4 py-2 text-center text-xs text-slate-400"
                >
                  Administration
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
