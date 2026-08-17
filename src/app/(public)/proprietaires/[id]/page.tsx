import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  getOwnerPublicProfile,
  listPublicFichesByOwner,
  ownerPublicStats,
  avisStatsForFiches,
  listFavoriIdsForVisiteur,
  isFavoriProprietaire,
} from "@/lib/data";
import ProfileHero from "@/components/ProfileHero";
import { noteLabel } from "@/lib/constants";
import OwnerAvatar from "@/components/OwnerAvatar";
import FavoriProprietaireButton from "@/components/FavoriProprietaireButton";
import ContactProprietaireDialog from "@/components/ContactProprietaireDialog";
import ShareButton from "@/components/ShareButton";
import FicheCard from "@/components/FicheCard";
import CarouselRow from "@/components/CarouselRow";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function ProprietairePublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const owner = getOwnerPublicProfile(id);
  if (!owner) notFound();

  const fiches = listPublicFichesByOwner(owner.id);
  const stats = ownerPublicStats(owner.id);

  const store = await cookies();
  const visiteurId = store.get("hp_visiteur")?.value ?? "";
  const favoriIds = listFavoriIdsForVisiteur(visiteurId);
  const favoriProprietaire = isFavoriProprietaire(visiteurId, owner.id);
  const avisStats = avisStatsForFiches(fiches.map((f) => f.id));

  const anneeDepuis = new Date(owner.created_at).getFullYear();
  const coverImage = fiches[0]?.photos[0] || "/hero-sunset.jpg";

  return (
    <div className="pb-10">
      <ProfileHero
        coverImage={coverImage}
        coverAlt={owner.nom}
        priority
        avatar={<OwnerAvatar nom={owner.nom} />}
        title={owner.nom}
        verified
        subtitle="Propriétaire partenaire Happy Life"
        stats={[
          { value: stats.nbFiches, label: stats.nbFiches > 1 ? "Fiches" : "Fiche" },
          {
            value: stats.nbAvis > 0 ? stats.noteMoyenne.toFixed(1) : "—",
            label: stats.nbAvis > 0 ? noteLabel(stats.noteMoyenne) : "Note",
          },
          { value: stats.nbAvis, label: stats.nbAvis > 1 ? "Avis" : "Avis" },
        ]}
        topLeft={
          <Link
            href="/"
            aria-label="Retour à l'accueil"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/35 backdrop-blur-md transition hover:bg-white/25"
          >
            <ArrowLeftIcon className="h-4.5 w-4.5" />
          </Link>
        }
        topRight={
          <ShareButton
            title={`${owner.nom} sur Happy Life`}
            text={`Découvrez les piscines et appartements de ${owner.nom} sur Happy Life.`}
          />
        }
        actions={
          <>
            <FavoriProprietaireButton ownerId={owner.id} initialFavori={favoriProprietaire} />
            <ContactProprietaireDialog
              ownerId={owner.id}
              ownerNom={owner.nom}
              fiches={fiches.map((f) => ({ id: f.id, titre: f.titre }))}
            />
          </>
        }
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="mt-1 text-xs text-slate-400">Partenaire Happy Life depuis {anneeDepuis}</p>

        <div className="mt-8 flex items-end justify-between">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            {fiches.length > 0
              ? `Fiches de ${owner.nom.split(" ")[0]}`
              : "Aucune fiche publiée pour le moment"}
          </h2>
        </div>

        {fiches.length > 0 ? (
          <div className="mt-5">
            <CarouselRow>
              {fiches.map((f) => (
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
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
            Ce propriétaire n&apos;a aucune fiche validée actuellement.
          </div>
        )}

        <div className="mt-8">
          <HeroPillButtonLight href="/recherche">
            Découvrir d&apos;autres piscines & appartements
          </HeroPillButtonLight>
        </div>
      </div>
    </div>
  );
}

function HeroPillButtonLight({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full bg-brand-teal/10 px-5 py-2.5 text-sm font-semibold text-brand-deep transition hover:bg-brand-teal/20"
    >
      {children}
    </Link>
  );
}
