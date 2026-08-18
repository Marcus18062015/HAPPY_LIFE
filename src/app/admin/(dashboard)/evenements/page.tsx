import { listAllEvenements } from "@/lib/data";
import {
  adminCreateEvenementAction,
  adminDeleteEvenementAction,
  adminToggleEvenementActiveAction,
} from "@/lib/actions/admin";
import ToggleButton from "@/components/ToggleButton";
import StatusBadge from "@/components/StatusBadge";

export const metadata = { title: "Événements — Administration" };

export default async function AdminEvenementsPage() {
  const evenements = listAllEvenements();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Événements</h1>
      <p className="mt-1 text-sm text-slate-500">
        Publiez des événements (concerts, festivals, activités partenaires) affichés en page
        d&apos;accueil, avec demande de place centralisée par Happy Life.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-5 card-shadow ring-1 ring-slate-100">
        <p className="text-sm font-semibold text-slate-900">Créer un événement</p>
        <form action={adminCreateEvenementAction} className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            name="titre"
            required
            placeholder="Titre (ex : Concert Jazz en Plein Air)"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal sm:col-span-2"
          />
          <input
            name="lieu"
            required
            placeholder="Lieu (ex : Libreville, Glass)"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          />
          <input
            name="date_evenement"
            type="date"
            required
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          />
          <input
            name="prix_info"
            placeholder="Info tarif (ex : À partir de 10 000 FCFA)"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal sm:col-span-2"
          />
          <textarea
            name="description"
            rows={2}
            placeholder="Description"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal sm:col-span-2"
          />
          <input
            name="image"
            placeholder="Image (chemin optionnel, ex : /uploads/evenements/xxx.svg)"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal sm:col-span-2"
          />
          <button
            type="submit"
            className="rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 sm:col-span-2"
          >
            Créer l&apos;événement
          </button>
        </form>
      </div>

      {evenements.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          Aucun événement créé pour le moment.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {evenements.map((e) => (
            <div key={e.id} className="rounded-2xl bg-white p-4 card-shadow ring-1 ring-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800">{e.titre}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {e.lieu} · {new Date(e.date_evenement).toLocaleDateString("fr-FR")}
                  </p>
                  {e.prix_info && <p className="mt-1 text-sm text-slate-500">{e.prix_info}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={e.active ? "ACTIF" : "INACTIVE"} />
                  <div className="flex gap-2">
                    <ToggleButton
                      action={adminToggleEvenementActiveAction.bind(null, e.id, !e.active)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      {e.active ? "Désactiver" : "Activer"}
                    </ToggleButton>
                    <ToggleButton
                      action={adminDeleteEvenementAction.bind(null, e.id)}
                      className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
                    >
                      Supprimer
                    </ToggleButton>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
