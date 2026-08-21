$ErrorActionPreference = "Stop"

$racine = $PSScriptRoot
if (-not (Test-Path (Join-Path $racine "package.json"))) {
    $racine = "C:\Users\Marc\Desktop\Fichiers\HAPPY_PISCINE\HAPPY_LIFE"
}

Write-Host "=================================================="
Write-Host "Ajout du lien Communaute au menu desktop/tablette"
Write-Host "Dossier utilise comme racine du projet :"
Write-Host "  $racine"
Write-Host "=================================================="
Write-Host ""

if (-not (Test-Path (Join-Path $racine "package.json"))) {
    Write-Host "ERREUR : impossible de trouver package.json dans ce dossier." -ForegroundColor Red
    Write-Host "Ce script doit etre lance depuis (ou copie dans) le dossier HAPPY_LIFE."
    exit 1
}

$resultats = @{}

function Ecrire-Fichier {
    param(
        [string]$CheminRelatif,
        [string]$Contenu,
        [string]$SignatureAttendue
    )

    $chemin = Join-Path $racine $CheminRelatif
    $dossier = Split-Path -Path $chemin -Parent

    if (-not (Test-Path -LiteralPath $dossier)) {
        [System.IO.Directory]::CreateDirectory($dossier) | Out-Null
    }

    if (Test-Path -LiteralPath $chemin) {
        try {
            $item = Get-Item -LiteralPath $chemin -Force
            if ($item.IsReadOnly) {
                Set-ItemProperty -LiteralPath $chemin -Name IsReadOnly -Value $false
            }
        } catch {
            Write-Host "   Avertissement attributs : $_" -ForegroundColor Yellow
        }
    }

    Write-Host "-> $CheminRelatif"
    try {
        Set-Content -LiteralPath $chemin -Value $Contenu -Encoding UTF8 -Force
    } catch {
        Write-Host "   *** ECHEC DE L'ECRITURE : $_" -ForegroundColor Red
        Write-Host "   (le fichier est peut-etre ouvert dans un autre programme - fermez-le et relancez le script)" -ForegroundColor Red
        return $false
    }

    Start-Sleep -Milliseconds 120
    $verif = Get-Content -LiteralPath $chemin -Raw -ErrorAction SilentlyContinue
    if ($verif -and $verif.Contains($SignatureAttendue)) {
        Write-Host "   OK" -ForegroundColor Green
        return $true
    } else {
        Write-Host "   *** ECHEC DE LA VERIFICATION (contenu inattendu apres ecriture) ***" -ForegroundColor Red
        return $false
    }
}

$f0 = @'
import Link from "next/link";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { BellIcon } from "./icons";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <MobileMenu />
          <Logo />
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/recherche?type=PISCINE" className="hover:text-brand-deep">
            Piscines
          </Link>
          <Link href="/recherche?type=APPARTEMENT" className="hover:text-brand-deep">
            Appartements meublés
          </Link>
          <Link href="/recherche" className="hover:text-brand-deep">
            Rechercher
          </Link>
          <Link href="/communaute" className="hover:text-brand-deep">
            Communauté
          </Link>
          <Link href="/a-propos" className="hover:text-brand-deep">
            À propos
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/proprietaire"
            className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-brand-deep hover:bg-brand-teal/10 md:block"
          >
            Espace propriétaire
          </Link>
          <Link
            href="/proprietaire/inscription"
            className="hidden rounded-full brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 sm:block"
          >
            Publier une fiche
          </Link>
          <Link
            href="/mes-reservations"
            aria-label="Mes réservations"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-brand-deep"
          >
            <BellIcon className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
'@

$f1 = @'
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
  { href: "/communaute", label: "Communauté" },
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
'@

$resultats["src\components\PublicHeader.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\PublicHeader.tsx" -Contenu $f0 -SignatureAttendue "communaute"
$resultats["src\components\MobileMenu.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\MobileMenu.tsx" -Contenu $f1 -SignatureAttendue "communaute"

Write-Host ""
Write-Host "=================================================="
$total = $resultats.Count
$ok = ($resultats.Values | Where-Object { $_ -eq $true }).Count
Write-Host "TERMINE - $ok / $total fichiers corrects sur le disque."
Write-Host "=================================================="
