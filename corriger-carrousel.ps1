# Corrige automatiquement l'emplacement des fichiers du carrousel de la
# page de demarrage, quel que soit l'endroit ou ils ont pu atterrir par
# erreur lors de manipulations precedentes.

$ErrorActionPreference = "Stop"
$repo = "C:\Users\Marc\Desktop\Fichiers\HAPPY_PISCINE\HAPPY_LIFE"

Write-Host "=============================================="
Write-Host "  Happy Life - Correction du carrousel"
Write-Host "=============================================="
Write-Host ""

if (-not (Test-Path $repo)) {
    Write-Host "[ERREUR] Dossier introuvable : $repo" -ForegroundColor Red
    Write-Host "Le dossier de votre projet n'est pas a cet emplacement."
    Write-Host "Modifiez la ligne 'repo =' en haut de ce script avec le bon chemin."
    Pause
    exit 1
}

$targetComponents = Join-Path $repo "src\components"
$targetSplashImages = Join-Path $repo "public\images\splash"
$correctSplash = Join-Path $targetComponents "Splash.tsx"
$correctCarousel = Join-Path $targetComponents "SplashCarousel.tsx"

Write-Host "Etape 1/4 : recherche et suppression des copies mal placees..."
$stray = Get-ChildItem -Path $repo -Recurse -File -Include "Splash.tsx","SplashCarousel.tsx" -ErrorAction SilentlyContinue
foreach ($f in $stray) {
    if ($f.FullName -ne $correctSplash -and $f.FullName -ne $correctCarousel) {
        Write-Host "  Suppression de : $($f.FullName)"
        Remove-Item -Path $f.FullName -Force
    }
}

Write-Host ""
Write-Host "Etape 2/4 : creation des dossiers si necessaire..."
New-Item -ItemType Directory -Force -Path $targetComponents | Out-Null
New-Item -ItemType Directory -Force -Path $targetSplashImages | Out-Null

Write-Host ""
Write-Host "Etape 3/4 : ecriture du bon contenu dans src\components\..."

$splashContent = @'
import LogoMark from "./LogoMark";
import SplashCarousel from "./SplashCarousel";
import { dismissSplashAction, dismissSplashAndGoAction } from "@/lib/actions/splash";

// Les 4 photos qui défilent sur l'écran de démarrage, l'une après l'autre.
// Cliquer sur l'image (ou le bouton « En savoir plus ») affiche sa
// description dans une fenêtre dédiée.
const SPLASH_SLIDES = [
  {
    src: "/images/splash/gorille.jpg",
    titre: "Une faune exceptionnelle",
    description:
      "Le Gabon abrite l'une des faunes les plus riches d'Afrique centrale, entre forêts denses et grands mammifères emblématiques comme le gorille des plaines.",
  },
  {
    src: "/images/splash/cascade.jpg",
    titre: "Des paysages naturels préservés",
    description:
      "Cascades, rivières et forêt équatoriale : le Gabon regorge de sites naturels spectaculaires, loin de l'agitation des grandes villes.",
  },
  {
    src: "/images/splash/batiment.jpg",
    titre: "Un pays en plein développement",
    description:
      "Entre architecture moderne et institutions solides, le Gabon poursuit sa transformation urbaine et son ouverture sur le monde.",
  },
  {
    src: "/images/splash/esplanade.jpg",
    titre: "De nouveaux espaces de vie",
    description:
      "Promenades, esplanades et lieux de rencontre pensés pour le bien-être des habitants voient le jour le long du littoral.",
  },
];

export default function Splash() {
  const goToLogin = dismissSplashAndGoAction.bind(null, "/proprietaire/connexion");

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#04141c]">
      <div className="relative flex-1">
        <SplashCarousel slides={SPLASH_SLIDES} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
          <LogoMark size={96} className="drop-shadow-[0_10px_25px_rgba(4,20,28,0.55)]" />
          <p className="mt-2 text-2xl font-bold text-white drop-shadow-sm">
            Happy <span className="text-brand-cyan">Life</span>
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/85">
            Vivez vos meilleurs moments
          </p>
        </div>
      </div>

      <div className="relative rounded-t-[28px] bg-[#04141c] px-6 pb-8 pt-7 text-center shadow-[0_-20px_40px_rgba(0,0,0,0.35)] sm:px-10">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Vivez vos meilleurs moments
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/70">
          Découvrez les meilleures piscines et appartements meublés du Gabon, réservez et
          profitez en toute simplicité.
        </p>

        <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
          <form action={dismissSplashAction}>
            <button
              type="submit"
              className="w-full rounded-full brand-gradient px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(15,155,170,0.45)] hover:opacity-90"
            >
              Commencer
            </button>
          </form>
          <form action={goToLogin}>
            <button
              type="submit"
              className="w-full rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

'@
Set-Content -Path $correctSplash -Value $splashContent -Encoding UTF8
Write-Host "  OK : src\components\Splash.tsx"

$carouselContent = @'
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export type SplashSlide = {
  src: string;
  titre: string;
  description: string;
};

const INTERVALLE_MS = 4500;

export default function SplashCarousel({ slides }: { slides: SplashSlide[] }) {
  const [index, setIndex] = useState(0);
  const [detailOuvert, setDetailOuvert] = useState(false);

  // Fait défiler automatiquement les images les unes après les autres.
  // La rotation est mise en pause pendant que la fenêtre de description
  // est ouverte, pour ne pas changer l'image que la personne est en train
  // de lire.
  useEffect(() => {
    if (detailOuvert || slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVALLE_MS);
    return () => clearInterval(timer);
  }, [detailOuvert, slides.length]);

  if (slides.length === 0) return null;
  const slideActuel = slides[index];

  return (
    <>
      <div className="absolute inset-0">
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.src}
              alt={slide.titre}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
        {/* Voile sombre pour garder le texte et le logo lisibles */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-[#04141c]/70" />
      </div>

      {/* Zone cliquable : ouvre la description de l'image actuellement affichée */}
      <button
        type="button"
        onClick={() => setDetailOuvert(true)}
        aria-label={`En savoir plus : ${slideActuel.titre}`}
        className="absolute inset-x-0 top-0 bottom-20 z-10"
      />

      <span className="pointer-events-none absolute bottom-24 right-5 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
        ⓘ En savoir plus
      </span>

      {/* Indicateurs de position, cliquables pour naviguer directement */}
      <div className="absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIndex(i);
            }}
            aria-label={`Voir l'image ${i + 1} sur ${slides.length}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>

      {detailOuvert && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 px-4 pb-8 sm:items-center"
          onClick={() => setDetailOuvert(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 w-full">
              <Image
                src={slideActuel.src}
                alt={slideActuel.titre}
                fill
                sizes="400px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setDetailOuvert(false)}
                aria-label="Fermer"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <h2 className="text-lg font-bold text-slate-900">{slideActuel.titre}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {slideActuel.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'@
Set-Content -Path $correctCarousel -Value $carouselContent -Encoding UTF8
Write-Host "  OK : src\components\SplashCarousel.tsx"

Write-Host ""
Write-Host "Etape 4/4 : verification finale..."
Write-Host ""
Write-Host "Contenu de src\components\ (fichiers lies au carrousel) :"
Get-ChildItem $targetComponents -Filter "*.tsx" | Where-Object { $_.Name -in @("Splash.tsx","SplashCarousel.tsx","LogoMark.tsx") } | Format-Table Name, Length, LastWriteTime -AutoSize

Write-Host "Contenu de public\images\splash\ :"
if (Test-Path $targetSplashImages) {
    Get-ChildItem $targetSplashImages | Format-Table Name, Length -AutoSize
} else {
    Write-Host "  [ATTENTION] Ce dossier n'existe pas ou est vide." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=============================================="
Write-Host "  Termine ! Retournez dans GitHub Desktop :"
Write-Host "  verifiez Changes, tapez un resume, Commit,"
Write-Host "  puis Push origin."
Write-Host "=============================================="
Write-Host ""
Pause
