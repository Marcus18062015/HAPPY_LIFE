import { listAbonnes } from "@/lib/data";
import { adminDeleteAbonneAction } from "@/lib/actions/admin";
import ToggleButton from "@/components/ToggleButton";

export const metadata = { title: "Abonnés — Administration" };

export default async function AdminAbonnesPage() {
  const abonnes = listAbonnes();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Abonnés aux alertes</h1>
      <p className="mt-1 text-sm text-slate-500">
        Visiteurs inscrits depuis l&apos;espace « Alertes » de la page d&apos;accueil pour
        être prévenus des nouveaux événements, promotions et fiches. Aucun envoi
        automatique n&apos;est configuré dans ce MVP : ces coordonnées sont à utiliser
        manuellement (email groupé, SMS, WhatsApp...).
      </p>

      {abonnes.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          Aucun abonné pour le moment.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white card-shadow ring-1 ring-slate-100">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Inscrit le</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {abonnes.map((a) => (
                <tr key={a.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 text-slate-700">{a.email ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{a.telephone ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(a.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ToggleButton
                      action={adminDeleteAbonneAction.bind(null, a.id)}
                      className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
                    >
                      Supprimer
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
