import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import {
  getFicheById,
  isFavori,
  listAvisForFiche,
  avisStatsForFiche,
  listSimilarFiches,
  avisStatsForFiches,
  listFavoriIdsForVisiteur,
  getOwnerPublicProfile,
} from "@/lib/data";
import { TYPE_LABELS, noteLabel } from "@/lib/constants";
import PhotoGallery from "@/components/PhotoGallery";
import DemandeForm from "@/components/DemandeForm";
import FavoriButton from "@/components/FavoriButton";
import AvisForm from "@/components/AvisForm";
import { StarRatingStatic } from "@/components/StarRating";
import ProfileHero, { HeroPillButton } from "@/components/ProfileHero";
import ShareButton from "@/components/ShareButton";
import FicheCard from "@/components/FicheCard";
import CarouselRow from "@/components/CarouselRow";
import OwnerAvatar from "@/components/OwnerAvatar";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function FicheDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fiche = getFicheById(id);

  if (!fiche || fiche.statut_validation !== "VALIDEE" || !fiche.active) {
    notFound();
  }

  const store = await cookies();
  const visiteurId = store.get("hp_visiteur")?.value ?? "";
  const favori = isFavori(visiteurId, fiche.id);
  const avis = listAvisForFiche(fiche.id);
  const avisStats = avisStatsForFiche(fiche.id);
  const owner = getOwnerPublicProfile(fiche.owner_id);
  const similaires = listSimilarFiches(fiche, 8);
  const favoriIds = listFavoriIdsForVisiteur(visiteurId);
  const avisStatsSimilaires = avisStatsForFiches(similaires.map((f) => f.id));

  return (
    <div className="pb-10">
      <ProfileHero
        coverImage={fiche.photos[0] || "/hero-sunset.jpg"}
        coverAlt={fiche.titre}
        priority
        title={fiche.titre}
        verified
        subtitle={`${TYPE_LABELS[fiche.type]} · ${fiche.zone}${fiche.quartier ? ` · ${fiche.quartier}` : ""}`}
        stats={[
          {
            value: avisStats.total > 0 ? avisStats.moyenne.toFixed(1) : "—",
            label: avisStats.total > 0 ? noteLabel(avisStats.moyenne) : "Note",
          },
          { value: avisStats.total, label: "Avis" },
        ]}
        topLeft={
          <Link
            href="/recherche"
            aria-label="Retour à la recherche"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/35 backdrop-blur-md transition hover:bg-white/25"
          >
            <ArrowLeftIcon className="h-4.5 w-4.5" />
          </Link>
        }
        topRight={
          <ShareButton
            title={fiche.titre}
            text={`${fiche.titre} — ${fiche.zone}, sur Happy Life.`}
          />
        }
        actions={
          <>
            <FavoriButton ficheId={fiche.id} initialFavori={favori} />
            <HeroPillButton href="#reserver" variant="solid">
              Contacter
            </HeroPillButton>
          </>
        }
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {owner && (
          <Link
            href={`/proprietaires/${owner.id}`}
            className="mt-2 inline-flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-4 card-shadow ring-1 ring-slate-100 transition hover:-translate-y-0.5"
          >
            <OwnerAvatar nom={owner.nom} size={30} />
            <span className="text-sm text-slate-600">
              Publié par <span className="font-semibold text-slate-900">{owner.nom}</span>
            </span>
          </Link>
        )}

        <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <PhotoGallery photos={fiche.photos} alt={fiche.titre} />

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">Description</h2>
            <p className="mt-2 whitespace-pre-line text-slate-600">{fiche.description}</p>
          </div>

          {fiche.equipements.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">
                Équipements & services
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {fiche.equipements.map((e) => (
                  <span
                    key={e}
                    className="rounded-full bg-brand-teal/10 px-3 py-1.5 text-sm text-brand-deep"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}

          {fiche.disponibilite && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">Disponibilités</h2>
              <p className="mt-2 whitespace-pre-line text-slate-600">{fiche.disponibilite}</p>
            </div>
          )}

          <div className="mt-10 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Avis</h2>
              {avisStats.total > 0 && (
                <span className="text-sm text-slate-400">
                  ({avisStats.total} avis · {avisStats.moyenne.toFixed(1)}/5)
                </span>
              )}
            </div>

            {avis.length > 0 ? (
              <ul className="mt-4 space-y-4">
                {avis.map((a) => (
                  <li key={a.id} className="rounded-2xl bg-white p-4 card-shadow ring-1 ring-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">{a.auteur_nom}</p>
                      <StarRatingStatic note={a.note} size="h-3.5 w-3.5" />
                    </div>
                    {a.commentaire && (
                      <p className="mt-1.5 text-sm text-slate-600">{a.commentaire}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-400">
                Aucun avis publié pour le moment — soyez le premier à partager votre expérience.
              </p>
            )}

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <p className="mb-3 text-sm font-semibold text-slate-900">Laisser un avis</p>
              <AvisForm ficheId={fiche.id} />
            </div>
          </div>
          </div>

          <aside id="reserver" className="scroll-mt-20 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl bg-white p-5 card-shadow ring-1 ring-slate-100">
              <p className="text-sm text-slate-500">Tarif indicatif</p>
              <p className="text-xl font-bold text-brand-deep">
                {fiche.tarif_indicatif || "Sur demande"}
              </p>
              <div className="mt-5 border-t border-slate-100 pt-5">
                <DemandeForm ficheId={fiche.id} />
              </div>
            </div>
          </aside>
        </div>

        {similaires.length > 0 && (
          <div className="mt-12 border-t border-slate-100 pt-8">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Fiches similaires
            </h2>
            <div className="mt-5">
              <CarouselRow>
                {similaires.map((f) => (
                  <div key={f.id} className="w-44 shrink-0 snap-start sm:w-52">
                    <FicheCard
                      fiche={f}
                      isFavori={favoriIds.has(f.id)}
                      avis={avisStatsSimilaires[f.id]}
                      compact
                    />
                  </div>
                ))}
              </CarouselRow>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
