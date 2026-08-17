import { listAllPublicites } from "@/lib/data";
import {
  adminCreatePubliciteAction,
  adminDeletePubliciteAction,
  adminTogglePubliciteActiveAction,
} from "@/lib/actions/admin";
import ToggleButton from "@/components/ToggleButton";
import StatusBadge from "@/components/StatusBadge";

export const metadata = { title: "Publicités — Administration" };

export default async function AdminPublicitesPage() {
  const publicites = listAllPublicites();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Encart publicitaire</h1>
      <p className="mt-1 text-sm text-slate-500">
        Gérez les annonces affichées dans l&apos;encart publicitaire de la page
        d&apos;accueil (image, annonceur, lien de destination).
      </p>

      <div className="mt-6 rounded-2xl bg-white p-5 card-shadow ring-1 ring-slate-100">
        <p className="text-sm font-semibold text-slate-900">Créer une publicité</p>
        <form action={adminCreatePubliciteAction} className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            name="titre"
            required
            placeholder="Titre (ex : Votre publicité ici)"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal sm:col-span-2"
          />
          <input
            name="annonceur"
            placeholder="Annonceur (ex : Nom de l'entreprise)"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          />
          <input
            name="lien"
            placeholder="Lien (ex : https://... ou /recherche)"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          />
          <input
            name="image"
            placeholder="Chemin de l'image (ex : /seed/piscine-1.jpg)"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal sm:col-span-2"
          />
          <textarea
            name="description"
            rows={3}
            placeholder="Description détaillée, affichée quand un visiteur clique sur la publicité"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal sm:col-span-2"
          />
          <button
            type="submit"
            className="rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 sm:col-span-2"
          >
            Créer la publicité
          </button>
        </form>
      </div>

      {publicites.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          Aucune publicité créée pour le moment.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {publicites.map((p) => (
            <div key={p.id} className="rounded-2xl bg-white p-4 card-shadow ring-1 ring-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800">{p.titre}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {p.annonceur ? `${p.annonceur}` : "Annonceur non précisé"}
                    {p.lien ? ` · ${p.lien}` : ""}
                  </p>
                  {p.description && (
                    <p className="mt-1 max-w-xl text-sm text-slate-400">{p.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={p.active ? "ACTIF" : "INACTIVE"} />
                  <div className="flex gap-2">
                    <ToggleButton
                      action={adminTogglePubliciteActiveAction.bind(null, p.id, !p.active)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      {p.active ? "Désactiver" : "Activer"}
                    </ToggleButton>
                    <ToggleButton
                      action={adminDeletePubliciteAction.bind(null, p.id)}
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
