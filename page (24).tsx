import { cookies } from "next/headers";
import Link from "next/link";
import FicheCard from "@/components/FicheCard";
import OwnerAvatar from "@/components/OwnerAvatar";
import {
  listFavorisForVisiteur,
  avisStatsForFiches,
  listFavorisProprietairesForVisiteur,
} from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mes favoris — Happy Life" };

export default async function FavorisPage() {
  const store = await cookies();
  const visiteurId = store.get("hp_visiteur")?.value ?? "";
  const fiches = listFavorisForVisiteur(visiteurId);
  const avisStats = avisStatsForFiches(fiches.map((f) => f.id));
  const proprietaires = listFavorisProprietairesForVisiteur(visiteurId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Mes favoris</h1>
      <p className="mt-1 text-sm text-slate-500">
        Les fiches et propriétaires que vous avez enregistrés sur cet appareil.
      </p>

      {fiches.length === 0 && proprietaires.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <p>Aucun favori pour le moment.</p>
          <Link href="/recherche" className="mt-3 inline-block text-sm font-medium text-brand-teal">
            Découvrir des piscines et appartements →
          </Link>
        </div>
      ) : (
        <>
          {proprietaires.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-slate-900">Propriétaires favoris</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {proprietaires.map((p) => (
                  <Link
                    key={p.id}
                    href={`/proprietaires/${p.id}`}
                    className="flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-4 card-shadow ring-1 ring-slate-100 transition hover:-translate-y-0.5"
                  >
                    <OwnerAvatar nom={p.nom} size={34} />
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">
                        {p.nom}
                      </span>
                      <span className="block text-xs text-slate-400">
                        {p.nbFiches} fiche{p.nbFiches > 1 ? "s" : ""}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {fiches.length > 0 && (
            <div className="mt-8">
              {proprietaires.length > 0 && (
                <h2 className="text-lg font-semibold text-slate-900">Fiches favorites</h2>
              )}
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {fiches.map((f) => (
                  <FicheCard key={f.id} fiche={f} isFavori avis={avisStats[f.id]} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
