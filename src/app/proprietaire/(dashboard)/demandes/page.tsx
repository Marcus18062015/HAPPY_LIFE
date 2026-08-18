import { getSession } from "@/lib/auth";
import { listDemandesForOwner } from "@/lib/data";
import { TYPE_LABELS } from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";
import ToggleButton from "@/components/ToggleButton";
import { ownerSetDemandeStatutAction } from "@/lib/actions/demandes";

export const metadata = { title: "Demandes reçues — Espace propriétaire" };

export default async function OwnerDemandesPage() {
  const session = await getSession();
  const demandes = listDemandesForOwner(session!.sub);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Demandes reçues</h1>
      <p className="mt-1 text-sm text-slate-500">
        Ces demandes vous sont transmises par Happy Life. Contactez le client
        directement pour finaliser sa venue.
      </p>

      {demandes.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          Aucune demande reçue pour le moment.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {demandes.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl bg-white p-4 card-shadow ring-1 ring-slate-100"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800">
                    {d.nom} <span className="font-normal text-slate-400">— {d.telephone}</span>
                  </p>
                  <p className="text-sm text-slate-500">
                    {TYPE_LABELS[d.fiche_type]} · {d.fiche_titre}
                  </p>
                  {d.email && <p className="text-sm text-slate-500">{d.email}</p>}
                  {d.message && <p className="mt-2 text-sm text-slate-600">{d.message}</p>}
                  <p className="mt-2 text-xs text-slate-400">
                    Reçue le {new Date(d.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={d.statut} />
                  <ToggleButton
                    action={ownerSetDemandeStatutAction.bind(
                      null,
                      d.id,
                      d.statut === "NOUVELLE" ? "TRAITEE" : "NOUVELLE"
                    )}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    {d.statut === "NOUVELLE" ? "Marquer traitée" : "Remettre en nouvelle"}
                  </ToggleButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
