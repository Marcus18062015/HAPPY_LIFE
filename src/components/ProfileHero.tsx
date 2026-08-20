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
