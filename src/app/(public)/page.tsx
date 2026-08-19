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

