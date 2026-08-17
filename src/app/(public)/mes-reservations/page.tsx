import { cookies } from "next/headers";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { listDemandesByVisiteur } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mes réservations — Happy Life" };

export default async function MesReservationsPage() {
  const store = await cookies();
  const visiteurId = store.get("hp_visiteur")?.value ?? "";
  const demandes = listDemandesByVisiteur(visiteurId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Mes réservations</h1>
      <p className="mt-1 text-sm text-slate-500">
        Les demandes de réservation et d&apos;événements que vous avez envoyées depuis cet
        appareil.
      </p>

      {demandes.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <p>Aucune demande envoyée pour le moment.</p>
          <Link href="/recherche" className="mt-3 inline-block text-sm font-medium text-brand-teal">
            Découvrir des piscines et appartements →
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {demandes.map((d) => (
            <div key={d.id} className="rounded-2xl bg-white p-4 card-shadow ring-1 ring-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800">
                    {d.fiche_titre ?? d.evenement_titre ?? "Demande"}
                  </p>
                  {d.message && <p className="mt-1 text-sm text-slate-600">{d.message}</p>}
                  <p className="mt-2 text-xs text-slate-400">
                    Envoyée le {new Date(d.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                <StatusBadge status={d.statut} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
