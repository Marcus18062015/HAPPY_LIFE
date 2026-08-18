import { cookies } from "next/headers";
import FicheCard from "@/components/FicheCard";
import { listPublicFiches, avisStatsForFiches, listFavoriIdsForVisiteur } from "@/lib/data";
import { ZONES, TYPE_LABELS, TOUS_EQUIPEMENTS } from "@/lib/constants";

export const metadata = { title: "Rechercher — Happy Life" };

type SearchParams = { zone?: string; type?: string; q?: string; eq?: string | string[]; note?: string };

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const zone = params.zone || "";
  const type = params.type || "";
  const q = params.q || "";
  const equipementsChoisis = Array.isArray(params.eq)
    ? params.eq
    : params.eq
      ? [params.eq]
      : [];
  const noteMin = Number(params.note || "0");

  let fiches = listPublicFiches({ zone, type, q, equipements: equipementsChoisis });
  const store = await cookies();
  const visiteurId = store.get("hp_visiteur")?.value ?? "";
  const favoriIds = listFavoriIdsForVisiteur(visiteurId);
  let avisStats = avisStatsForFiches(fiches.map((f) => f.id));

  // Filtre "note minimale" : appliqué après coup, car la note moyenne est
  // calculée séparément (table avis), pas stockée sur la fiche elle-même.
  if (noteMin > 0) {
    fiches = fiches.filter((f) => (avisStats[f.id]?.moyenne ?? 0) >= noteMin);
    avisStats = avisStatsForFiches(fiches.map((f) => f.id));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Rechercher un lieu de détente</h1>
      <p className="mt-1 text-sm text-slate-500">
        Filtrez par zone et par type de service pour trouver la piscine ou l&apos;appartement
        meublé qui correspond à votre séjour.
      </p>

      <form
        method="get"
        className="mt-6 rounded-2xl bg-white p-4 card-shadow ring-1 ring-slate-100"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Mot-clé (nom, quartier...)"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          />
          <select
            name="zone"
            defaultValue={zone}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-teal"
          >
            <option value="">Toutes les zones</option>
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
          <select
            name="type"
            defaultValue={type}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-teal"
          >
            <option value="">Tous les types</option>
            <option value="PISCINE">Piscine</option>
            <option value="APPARTEMENT">Appartement meublé</option>
          </select>
          <button
            type="submit"
            className="rounded-xl brand-gradient px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Filtrer
          </button>
        </div>

        {/* Filtres avancés façon Booking.com : note minimale + équipements
            (case à cocher). Un <details> natif évite d'ajouter du JS côté
            client — tout reste dans le même formulaire GET, partageable
            par URL. */}
        <details className="mt-3 group" open={equipementsChoisis.length > 0}>
          <summary className="cursor-pointer list-none text-sm font-semibold text-brand-teal">
            <span className="inline-flex items-center gap-1">
              Plus de filtres
              {equipementsChoisis.length > 0 && (
                <span className="rounded-full bg-brand-teal/10 px-2 py-0.5 text-xs">
                  {equipementsChoisis.length}
                </span>
              )}
              <span className="transition group-open:rotate-180">▾</span>
            </span>
          </summary>
          <div className="mt-3 grid gap-4 border-t border-slate-100 pt-3 sm:grid-cols-[200px_1fr]">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Note minimale
              </label>
              <select
                name="note"
                defaultValue={String(noteMin || "")}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-teal"
              >
                <option value="">Toutes les notes</option>
                <option value="3">3+ (Bien)</option>
                <option value="3.7">3.7+ (Très bien)</option>
                <option value="4.2">4.2+ (Superbe)</option>
                <option value="4.6">4.6+ (Exceptionnel)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Équipements
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                {TOUS_EQUIPEMENTS.map((eq) => (
                  <label key={eq} className="flex items-center gap-1.5 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      name="eq"
                      value={eq}
                      defaultChecked={equipementsChoisis.includes(eq)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal"
                    />
                    {eq}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </details>
      </form>

      <p className="mt-6 text-sm text-slate-500">
        {fiches.length} résultat{fiches.length > 1 ? "s" : ""}
        {type ? ` · ${TYPE_LABELS[type]}` : ""}
        {zone ? ` · ${zone}` : ""}
        {noteMin > 0 ? ` · note ≥ ${noteMin}` : ""}
        {equipementsChoisis.length > 0 ? ` · ${equipementsChoisis.length} équipement(s)` : ""}
      </p>

      {fiches.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fiches.map((f) => (
            <FicheCard key={f.id} fiche={f} isFavori={favoriIds.has(f.id)} avis={avisStats[f.id]} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          Aucun résultat pour ces critères. Essayez une autre zone ou un autre type.
        </div>
      )}
    </div>
  );
}
