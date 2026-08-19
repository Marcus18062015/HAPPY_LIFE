import { listOwners, countFichesForOwner, getAbonnementStatutProprietaire } from "@/lib/data";
import StatusBadge from "@/components/StatusBadge";
import ToggleButton from "@/components/ToggleButton";
import {
  adminSetOwnerStatutAction,
  adminDeleteOwnerAction,
} from "@/lib/actions/admin";
import { envoyerRappelAbonnementAction } from "@/lib/actions/abonnement";

export const metadata = { title: "Comptes propriétaires — Administration" };

function libelleAbonnement(joursRestants: number, valide: boolean): string {
  if (!valide) {
    return joursRestants === 0
      ? "Expire aujourd'hui"
      : `Expiré depuis ${Math.abs(joursRestants)} j`;
  }
  return `${joursRestants} j restants`;
}

export default function AdminComptesPage() {
  const owners = listOwners();
  const nbEnAttente = owners.filter((o) => o.statut === "EN_ATTENTE").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Comptes propriétaires</h1>
      <p className="mt-1 text-sm text-slate-500">
        Validez les nouvelles inscriptions, activez ou suspendez l&apos;accès d&apos;un
        propriétaire, ou supprimez un compte non conforme.
      </p>
      {nbEnAttente > 0 && (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-700 ring-1 ring-amber-200">
          {nbEnAttente} compte{nbEnAttente > 1 ? "s" : ""} en attente de validation.
        </p>
      )}

      {owners.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          Aucun compte propriétaire pour le moment.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white card-shadow ring-1 ring-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Fiches</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Abonnement</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {owners.map((o) => {
                const abonnement = getAbonnementStatutProprietaire(o.id);
                return (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{o.nom}</td>
                  <td className="px-4 py-3 text-slate-500">{o.email}</td>
                  <td className="px-4 py-3 text-slate-500">{o.telephone || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{countFichesForOwner(o.id)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.statut} />
                  </td>
                  <td className="px-4 py-3">
                    {abonnement.abonnement ? (
                      <div className="flex items-center gap-2">
                        <StatusBadge status={abonnement.valide ? "ACTIF" : "SUSPENDU"} />
                        <span className="text-xs text-slate-400">
                          {libelleAbonnement(abonnement.joursRestants, abonnement.valide)}
                        </span>
                      </div>
                    ) : (
                      <StatusBadge status="INACTIVE" />
                    )}
                    {(!abonnement.abonnement || abonnement.joursRestants <= 7) && (
                      <ToggleButton
                        action={envoyerRappelAbonnementAction.bind(null, o.id)}
                        className="mt-1.5 block text-xs font-medium text-brand-deep underline decoration-dotted hover:text-brand-teal"
                      >
                        Envoyer un rappel SMS
                      </ToggleButton>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {o.statut === "EN_ATTENTE" ? (
                        <ToggleButton
                          action={adminSetOwnerStatutAction.bind(null, o.id, "ACTIF")}
                          className="rounded-full bg-brand-teal/10 px-3 py-1.5 text-xs font-medium text-brand-deep hover:bg-brand-teal/20"
                        >
                          Valider
                        </ToggleButton>
                      ) : (
                        <ToggleButton
                          action={adminSetOwnerStatutAction.bind(
                            null,
                            o.id,
                            o.statut === "ACTIF" ? "SUSPENDU" : "ACTIF"
                          )}
                          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          {o.statut === "ACTIF" ? "Suspendre" : "Réactiver"}
                        </ToggleButton>
                      )}
                      <ToggleButton
                        action={adminDeleteOwnerAction.bind(null, o.id)}
                        className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        Supprimer
                      </ToggleButton>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
