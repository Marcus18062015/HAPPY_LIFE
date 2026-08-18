import { listAllDemandes } from "@/lib/data";
import { TYPE_LABELS } from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";
import ToggleButton from "@/components/ToggleButton";
import { adminSetDemandeStatutAction } from "@/lib/actions/admin";

export const metadata = { title: "Suivi des demandes — Administration" };

export default function AdminDemandesPage() {
  const demandes = listAllDemandes();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Suivi des demandes</h1>
      <p className="mt-1 text-sm text-slate-500">
        Toutes les demandes envoyées via Happy Life, tous propriétaires confondus.
      </p>

      {demandes.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          Aucune demande enregistrée pour le moment.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white card-shadow ring-1 ring-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Fiche</th>
                <th className="px-4 py-3">Propriétaire</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {demandes.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{d.nom}</p>
                    <p className="text-xs text-slate-400">{d.telephone}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {d.fiche_type
                      ? `${TYPE_LABELS[d.fiche_type as "PISCINE" | "APPARTEMENT"]} · ${d.fiche_titre}`
                      : `Événement · ${d.evenement_titre ?? "—"}`}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{d.owner_nom ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(d.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.statut} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ToggleButton
                      action={adminSetDemandeStatutAction.bind(
                        null,
                        d.id,
                        d.statut === "NOUVELLE" ? "TRAITEE" : "NOUVELLE"
                      )}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      {d.statut === "NOUVELLE" ? "Marquer traitée" : "Remettre en nouvelle"}
                    </ToggleButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
