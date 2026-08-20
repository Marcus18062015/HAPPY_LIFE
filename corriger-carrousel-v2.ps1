$ErrorActionPreference = "Stop"

# Racine du dépôt (dossier où se trouve ce script -> HAPPY_LIFE)
$racine = $PSScriptRoot
if (-not (Test-Path (Join-Path $racine "package.json"))) {
    # Si le script est ailleurs, on essaie le chemin connu en dur.
    $racine = "C:\Users\Marc\Desktop\Fichiers\HAPPY_PISCINE\HAPPY_LIFE"
}

Write-Host "=================================================="
Write-Host "Dossier utilisé comme racine du projet :"
Write-Host "  $racine"
Write-Host "=================================================="
Write-Host ""

if (-not (Test-Path (Join-Path $racine "package.json"))) {
    Write-Host "ERREUR : impossible de trouver package.json dans ce dossier." -ForegroundColor Red
    Write-Host "Ce script doit être lancé depuis (ou copié dans) le dossier HAPPY_LIFE."
    Read-Host "Appuyez sur Entrée pour fermer"
    exit 1
}

# ------------------------------------------------------------------
# ÉTAPE 1 : recherche de doublons — on cherche partout dans le dépôt
# s'il existe plus d'un fichier portant ces noms.
# ------------------------------------------------------------------
$nomsAVerifier = @("SplashCarousel.tsx", "Splash.tsx", "ProfileHero.tsx", "splashSlides.ts", "page.tsx")

Write-Host "--- Étape 1/3 : recherche de fichiers en double dans tout le dépôt ---"
foreach ($nom in $nomsAVerifier) {
    $trouves = Get-ChildItem -Path $racine -Recurse -Filter $nom -File -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch "\\node_modules\\" -and $_.FullName -notmatch "\\\.next\\" -and $_.FullName -notmatch "\\\.git\\" }
    Write-Host ""
    Write-Host "Fichier(s) trouvé(s) nommé(s) '$nom' :"
    foreach ($f in $trouves) {
        $ro = if ($f.IsReadOnly) { " [LECTURE SEULE]" } else { "" }
        Write-Host ("   {0}  ({1} octets, modifié {2}){3}" -f $f.FullName, $f.Length, $f.LastWriteTime, $ro)
    }
    if ($trouves.Count -gt 1) {
        Write-Host "   >>> ATTENTION : plusieurs fichiers portent ce nom ! C'est peut-être la cause du problème." -ForegroundColor Yellow
    }
    if ($trouves.Count -eq 0) {
        Write-Host "   (aucun trouvé)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "--- Étape 2/3 : écriture des 5 fichiers corrigés ---"
Write-Host ""

function Ecrire-Fichier($cheminRelatif, $contenu, $signatureAttendue) {
    $chemin = Join-Path $racine $cheminRelatif
    $dossier = Split-Path $chemin -Parent
    if (-not (Test-Path $dossier)) {
        New-Item -ItemType Directory -Path $dossier -Force | Out-Null
    }

    Write-Host "-> $cheminRelatif"

    if (Test-Path $chemin) {
        try {
            $item = Get-Item $chemin -Force
            if ($item.IsReadOnly) {
                Write-Host "   (le fichier était en lecture seule -> je retire cette protection)"
                Set-ItemProperty -Path $chemin -Name IsReadOnly -Value $false
            }
        } catch {
            Write-Host "   Avertissement : impossible de lire les attributs ($_)" -ForegroundColor Yellow
        }
    }

    try {
        Set-Content -Path $chemin -Value $contenu -Encoding UTF8 -Force
    } catch {
        Write-Host "   *** ÉCHEC DE L'ÉCRITURE : $_" -ForegroundColor Red
        Write-Host "   (le fichier est probablement ouvert dans un autre programme — fermez-le et relancez le script)" -ForegroundColor Red
        return
    }

    Start-Sleep -Milliseconds 200
    $verif = Get-Content -Path $chemin -Raw -ErrorAction SilentlyContinue
    if ($verif -and $verif.Contains($signatureAttendue)) {
        Write-Host "   OK — contenu vérifié sur le disque." -ForegroundColor Green
    } else {
        Write-Host "   *** ÉCHEC DE LA VÉRIFICATION : le fichier ne contient pas le nouveau contenu après écriture." -ForegroundColor Red
        Write-Host "   Taille actuelle sur disque : $((Get-Item $chemin).Length) octets" -ForegroundColor Red
    }
    Write-Host ""
}

$splashSlides = @'
export type SplashSlide = {
  src: string;
  titre: string;
  description: string;
};

// Les 4 photos utilisées à la fois sur l'écran de démarrage (Splash) et sur
// le bandeau de la page d'accueil (ProfileHero) — centralisées ici pour ne
// pas dupliquer la liste à deux endroits.
export const SPLASH_SLIDES: SplashSlide[] = [
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
'@

$splashCarousel = @'
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { SplashSlide } from "@/lib/splashSlides";

const INTERVALLE_MS_DEFAUT = 4500;

export default function SplashCarousel({
  slides,
  intervalMs = INTERVALLE_MS_DEFAUT,
  // "splash" : positionnement pensé pour l'écran de démarrage plein écran.
  // "compact" : positionnement resserré, pour un bandeau plus bas (ex :
  // ProfileHero sur la page d'accueil, ~300-360px de hauteur).
  variant = "splash",
}: {
  slides: SplashSlide[];
  intervalMs?: number;
  variant?: "splash" | "compact";
}) {
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
    }, intervalMs);
    return () => clearInterval(timer);
  }, [detailOuvert, slides.length, intervalMs]);

  if (slides.length === 0) return null;
  const slideActuel = slides[index];
  const compact = variant === "compact";

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
        className={`absolute inset-x-0 top-0 z-10 ${compact ? "bottom-0" : "bottom-20"}`}
      />

      <span
        className={`pointer-events-none absolute z-10 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm ${
          compact ? "bottom-3 right-3" : "bottom-24 right-5"
        }`}
      >
        ⓘ En savoir plus
      </span>

      {/* Indicateurs de position, cliquables pour naviguer directement */}
      <div
        className={`absolute left-1/2 z-10 flex -translate-x-1/2 gap-2 ${
          compact ? "bottom-3" : "bottom-16"
        }`}
      >
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

$splash = @'
import LogoMark from "./LogoMark";
import SplashCarousel from "./SplashCarousel";
import { dismissSplashAction, dismissSplashAndGoAction } from "@/lib/actions/splash";
import { SPLASH_SLIDES } from "@/lib/splashSlides";

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

$profileHero = @'
import Image from "next/image";
import Link from "next/link";
import { VerifiedBadgeIcon } from "./icons";
import SplashCarousel from "./SplashCarousel";
import type { SplashSlide } from "@/lib/splashSlides";

// Bandeau "façon profil" réutilisé sur trois écrans (accueil, fiche détail,
// vitrine propriétaire) : photo pleine largeur, avatar, titre + badge
// vérifié, sous-titre, statistiques et boutons d'action — inspiré du
// mockup fourni par l'utilisateur, réinterprété avec des données réelles
// de la plateforme (jamais de coordonnées propriétaire, jamais de faux
// compteurs "Follower/Following").
export default function ProfileHero({
  coverImage,
  coverAlt = "",
  // Si fourni, remplace la photo de couverture statique par un carrousel
  // de plusieurs photos qui défilent automatiquement (utilisé sur la page
  // d'accueil). `coverImage` sert alors uniquement de repli si `coverSlides`
  // est vide.
  coverSlides,
  coverIntervalMs,
  avatar,
  title,
  verified = false,
  subtitle,
  stats,
  actions,
  topLeft,
  topRight,
  children,
  priority = false,
  // Certains avatars (ex : logo Happy Life, fond transparent) ne doivent
  // pas recevoir l'ombre portée rectangulaire par défaut — elle dessinerait
  // un faux encadré derrière un visuel sans fond. Les avatars pleins (ex :
  // OwnerAvatar, cercle de couleur) gardent l'ombre par défaut.
  avatarShadow = true,
}: {
  coverImage: string;
  coverAlt?: string;
  coverSlides?: SplashSlide[];
  coverIntervalMs?: number;
  avatar?: React.ReactNode;
  title: string;
  verified?: boolean;
  subtitle?: React.ReactNode;
  stats?: { value: string | number; label: string }[];
  actions?: React.ReactNode;
  topLeft?: React.ReactNode;
  topRight?: React.ReactNode;
  children?: React.ReactNode;
  priority?: boolean;
  avatarShadow?: boolean;
}) {
  return (
    // Fond uni sombre sur toute la section (pas seulement sous la photo) :
    // le contenu (titre, stats, boutons, et tout ce qui suit dans
    // `children`, dont la hauteur varie selon la page) reste toujours
    // lisible en blanc, même après la zone couverte par la photo.
    <section className="relative overflow-hidden bg-[#04141c] text-white">
      <div className="relative h-[300px] w-full sm:h-[360px]">
        {coverSlides && coverSlides.length > 0 ? (
          <SplashCarousel
            slides={coverSlides}
            intervalMs={coverIntervalMs}
            variant="compact"
          />
        ) : (
          <Image
            src={coverImage}
            alt={coverAlt}
            fill
            priority={priority}
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04141c] via-[#04141c]/45 to-[#04141c]/10" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#04141c]/50 via-transparent to-transparent" />

        {(topLeft || topRight) && (
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4 sm:px-6">
            <div>{topLeft}</div>
            <div>{topRight}</div>
          </div>
        )}
      </div>

      <div className="relative -mt-16 px-4 pb-8 sm:px-6">
        {avatar && (
          <div
            className={`mb-3 inline-flex rounded-[22px] ${
              avatarShadow ? "shadow-[0_10px_30px_rgba(4,20,28,0.45)]" : ""
            }`}
          >
            {avatar}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{title}</h1>
          {verified && <VerifiedBadgeIcon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />}
        </div>

        {subtitle && (
          <p className="mt-1.5 inline-block border-b border-brand-cyan/60 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cyan">
            {subtitle}
          </p>
        )}

        {stats && stats.length > 0 && (
          <div className="mt-4 flex items-center gap-6">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-xl font-bold sm:text-2xl">{s.value}</p>
                <p className="text-xs text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {actions && <div className="mt-4 flex flex-wrap items-center gap-2.5">{actions}</div>}

        {children}
      </div>
    </section>
  );
}

// Bouton "pilule" transparent (effet verre) utilisé dans les ProfileHero —
// pour les actions type Favoris / Contacter / Rechercher sur fond photo.
export function HeroPillButton({
  children,
  onClick,
  href,
  variant = "ghost",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "ghost" | "solid";
  type?: "button" | "submit";
}) {
  const cls =
    variant === "solid"
      ? "inline-flex items-center gap-1.5 rounded-full bg-brand-cyan px-5 py-2.5 text-sm font-semibold text-brand-deep shadow-lg transition hover:bg-brand-cyan/90"
      : "inline-flex items-center gap-1.5 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/35 backdrop-blur-md transition hover:bg-white/25";
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
'@

$pageAccueil = @'
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import FicheCard from "@/components/FicheCard";
import CarouselRow from "@/components/CarouselRow";
import PromotionCard from "@/components/PromotionCard";
import EvenementCard from "@/components/EvenementCard";
import LogoMark from "@/components/LogoMark";
import ProfileHero, { HeroPillButton } from "@/components/ProfileHero";
import ShareButton from "@/components/ShareButton";
import AbonnementForm from "@/components/AbonnementForm";
import PubliciteBanner from "@/components/PubliciteBanner";
import {
  listPublicFiches,
  avisStatsForFiches,
  listFavoriIdsForVisiteur,
  listActivePromotions,
  listActiveEvenements,
  listActivePublicites,
  siteWidePublicStats,
  zonesTendance,
} from "@/lib/data";
import { ZONES } from "@/lib/constants";
import { PinIcon } from "@/components/icons";
import { SPLASH_SLIDES } from "@/lib/splashSlides";

// La page d'accueil affiche les dernières fiches validées, les favoris du
// visiteur et les promotions/événements actifs : on désactive le cache
// statique pour refléter ces données en temps réel.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const piscines = listPublicFiches({ type: "PISCINE" }).slice(0, 8);
  const appartements = listPublicFiches({ type: "APPARTEMENT" }).slice(0, 8);
  const recentes = listPublicFiches({}).slice(0, 8);
  const promotions = listActivePromotions().slice(0, 8);
  const evenements = listActiveEvenements().slice(0, 8);
  const publicites = listActivePublicites();
  const siteStats = siteWidePublicStats();
  const zones = zonesTendance(6);

  const store = await cookies();
  const visiteurId = store.get("hp_visiteur")?.value ?? "";
  const favoriIds = listFavoriIdsForVisiteur(visiteurId);
  const avisStats = avisStatsForFiches(
    [...piscines, ...appartements, ...recentes].map((f) => f.id)
  );

  return (
    <div>
      <ProfileHero
        coverImage="/hero-photo.jpg"
        coverSlides={SPLASH_SLIDES}
        coverIntervalMs={2250}
        priority
        avatar={
          <LogoMark size={72} className="drop-shadow-[0_8px_20px_rgba(4,20,28,0.55)]" />
        }
        avatarShadow={false}
        title="Happy Life"
        verified
        subtitle="Vivez vos meilleurs moments"
        stats={[
          { value: siteStats.nbFiches, label: "Fiches disponibles" },
          { value: siteStats.nbAvis, label: "Avis vérifiés" },
        ]}
        topRight={
          <ShareButton
            title="Happy Life"
            text="Piscines et appartements meublés au Gabon, sur Happy Life."
          />
        }
        actions={
          <>
            <HeroPillButton href="/favoris">♥ Favoris</HeroPillButton>
            <HeroPillButton href="/recherche" variant="solid">
              Rechercher
            </HeroPillButton>
          </>
        }
      >
        <p className="mt-4 max-w-xl text-sm text-white/80 sm:text-base">
          Happy Life réunit les piscines ouvertes au public et les appartements meublés
          du Gabon : découvrez, comparez et envoyez votre demande, sans jamais échanger vos
          coordonnées personnelles.
        </p>

        <form
          action="/recherche"
          method="get"
          className="mt-5 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg sm:flex-row"
        >
          <select
            name="zone"
            defaultValue=""
            className="flex-1 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none"
          >
            <option value="">Où voulez-vous vous détendre ?</option>
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
          <div className="hidden h-8 w-px self-center bg-slate-200 sm:block" />
          <select
            name="type"
            defaultValue=""
            className="rounded-xl px-4 py-3 text-sm text-slate-700 outline-none sm:w-44"
          >
            <option value="">Piscine ou appartement ?</option>
            <option value="PISCINE">Piscine</option>
            <option value="APPARTEMENT">Appartement meublé</option>
          </select>
          <button
            type="submit"
            className="rounded-xl brand-gradient px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Rechercher
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/recherche?type=PISCINE"
            className="rounded-full bg-white/10 px-4 py-1.5 ring-1 ring-white/20 hover:bg-white/20"
          >
            Voir les piscines
          </Link>
          <Link
            href="/recherche?type=APPARTEMENT"
            className="rounded-full bg-white/10 px-4 py-1.5 ring-1 ring-white/20 hover:bg-white/20"
          >
            Voir les appartements meublés
          </Link>
          <Link
            href="/proprietaire/inscription"
            className="rounded-full bg-brand-cyan px-4 py-1.5 font-semibold text-brand-deep hover:bg-brand-cyan/90"
          >
            Publier une fiche
          </Link>
        </div>
      </ProfileHero>

      {publicites.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
          <PubliciteBanner publicites={publicites} />
        </section>
      )}

      {zones.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Zones tendance</h2>
          <p className="mt-1 text-sm text-slate-500">
            Les zones les plus demandées par les visiteurs de Happy Life en ce moment.
          </p>
          <div className="mt-5">
            <CarouselRow>
              {zones.map((z) => (
                <Link
                  key={z.zone}
                  href={`/recherche?zone=${encodeURIComponent(z.zone)}`}
                  className="group relative block h-32 w-40 shrink-0 snap-start overflow-hidden rounded-2xl bg-slate-200 shadow-sm sm:h-36 sm:w-48"
                >
                  {z.photo ? (
                    <Image
                      src={z.photo}
                      alt={z.zone}
                      fill
                      sizes="192px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center brand-gradient text-white/80">
                      <PinIcon className="h-6 w-6" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                    <p className="font-semibold leading-tight">{z.zone}</p>
                    <p className="text-xs text-white/80">
                      {z.count} fiche{z.count > 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </CarouselRow>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Piscines</h2>
          <Link href="/recherche?type=PISCINE" className="text-sm font-medium text-brand-teal">
            Voir tout →
          </Link>
        </div>
        {piscines.length > 0 ? (
          <div className="mt-5">
            <CarouselRow>
              {piscines.map((f) => (
                <div key={f.id} className="w-44 shrink-0 snap-start sm:w-52">
                  <FicheCard
                    fiche={f}
                    isFavori={favoriIds.has(f.id)}
                    avis={avisStats[f.id]}
                    compact
                  />
                </div>
              ))}
            </CarouselRow>
          </div>
        ) : (
          <EmptyState label="Aucune piscine publiée pour le moment." />
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Appartements meublés
          </h2>
          <Link
            href="/recherche?type=APPARTEMENT"
            className="text-sm font-medium text-brand-teal"
          >
            Voir tout →
          </Link>
        </div>
        {appartements.length > 0 ? (
          <div className="mt-5">
            <CarouselRow>
              {appartements.map((f) => (
                <div key={f.id} className="w-44 shrink-0 snap-start sm:w-52">
                  <FicheCard
                    fiche={f}
                    isFavori={favoriIds.has(f.id)}
                    avis={avisStats[f.id]}
                    compact
                  />
                </div>
              ))}
            </CarouselRow>
          </div>
        ) : (
          <EmptyState label="Aucun appartement publié pour le moment." />
        )}
      </section>

      {recentes.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Ajoutées récemment</h2>
            <Link href="/recherche" className="text-sm font-medium text-brand-teal">
              Voir tout →
            </Link>
          </div>
          <div className="mt-5">
            <CarouselRow>
              {recentes.map((f) => (
                <div key={f.id} className="w-44 shrink-0 snap-start sm:w-52">
                  <FicheCard
                    fiche={f}
                    isFavori={favoriIds.has(f.id)}
                    avis={avisStats[f.id]}
                    compact
                  />
                </div>
              ))}
            </CarouselRow>
          </div>
        </section>
      )}

      {promotions.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Promotions</h2>
            <span className="text-sm font-medium text-slate-400">Offres du moment</span>
          </div>
          <div className="mt-5">
            <CarouselRow>
              {promotions.map((p) => (
                <PromotionCard
                  key={p.id}
                  ficheId={p.fiche_id}
                  ficheTitre={p.fiche_titre}
                  titre={p.titre}
                  badge={p.badge}
                  reductionPct={p.reduction_pct}
                  prixOriginal={p.prix_original}
                  prixPromo={p.prix_promo}
                />
              ))}
            </CarouselRow>
          </div>
        </section>
      )}

      {evenements.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Événements du moment
            </h2>
            <span className="text-sm font-medium text-slate-400">Organisés avec nos partenaires</span>
          </div>
          <div className="mt-5">
            <CarouselRow>
              {evenements.map((e) => (
                <EvenementCard
                  key={e.id}
                  id={e.id}
                  titre={e.titre}
                  lieu={e.lieu}
                  dateEvenement={e.date_evenement}
                  image={e.image}
                />
              ))}
            </CarouselRow>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Comment ça marche
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              n: "1",
              t: "Découvrez",
              d: "Parcourez les piscines et appartements par zone, quartier ou type de service.",
            },
            {
              n: "2",
              t: "Envoyez une demande",
              d: "Un seul bouton « Demande de réservation / Contacter via Happy Life » — vos coordonnées restent protégées.",
            },
            {
              n: "3",
              t: "Happy Life met en relation",
              d: "Le propriétaire reçoit votre demande via la plateforme et vous recontacte pour organiser votre venue.",
            },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl bg-white p-6 card-shadow ring-1 ring-slate-100">
              <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white">
                {s.n}
              </div>
              <p className="mt-3 font-semibold text-slate-900">{s.t}</p>
              <p className="mt-1 text-sm text-slate-500">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <AbonnementForm />

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="brand-gradient flex flex-col items-center gap-4 rounded-3xl px-6 py-10 text-center text-white sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Vous gérez une piscine ou un appartement meublé ?</h2>
            <p className="mt-1 text-white/85">
              Créez votre fiche gratuitement et gagnez en visibilité auprès des Gabonais.
            </p>
          </div>
          <Link
            href="/proprietaire/inscription"
            className="whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-deep hover:bg-white/90"
          >
            Publier une fiche
          </Link>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
      {label}
    </div>
  );
}
'@

Ecrire-Fichier "src\lib\splashSlides.ts" $splashSlides "SPLASH_SLIDES"
Ecrire-Fichier "src\components\SplashCarousel.tsx" $splashCarousel "intervalMs"
Ecrire-Fichier "src\components\Splash.tsx" $splash "SPLASH_SLIDES"
Ecrire-Fichier "src\components\ProfileHero.tsx" $profileHero "coverIntervalMs"
Ecrire-Fichier "src\app\(public)\page.tsx" $pageAccueil "coverIntervalMs={2250}"

Write-Host "--- Étape 3/3 : nouvelle recherche de doublons après écriture ---"
foreach ($nom in $nomsAVerifier) {
    $trouves = Get-ChildItem -Path $racine -Recurse -Filter $nom -File -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch "\\node_modules\\" -and $_.FullName -notmatch "\\\.next\\" -and $_.FullName -notmatch "\\\.git\\" }
    if ($trouves.Count -gt 1) {
        Write-Host ""
        Write-Host "'$nom' existe toujours en plusieurs exemplaires :" -ForegroundColor Yellow
        foreach ($f in $trouves) {
            Write-Host ("   {0}  ({1} octets, modifié {2})" -f $f.FullName, $f.Length, $f.LastWriteTime)
        }
    }
}

Write-Host ""
Write-Host "=================================================="
Write-Host "TERMINÉ. Copiez TOUT le texte affiché ci-dessus et envoyez-le si un problème persiste."
Write-Host "=================================================="
Read-Host "Appuyez sur Entrée pour fermer"
