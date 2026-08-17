import { listAllPromotions, listAllFiches } from "@/lib/data";
import {
  adminCreatePromotionAction,
  adminDeletePromotionAction,
  adminTogglePromotionActiveAction,
} from "@/lib/actions/admin";
import ToggleButton from "@/components/ToggleButton";
import StatusBadge from "@/components/StatusBadge";

export const metadata = { title: "Promotions — Administration" };

export default async function AdminPromotionsPage() {
  const promotions = listAllPromotions();
  const fiches = listAllFiches().filter((f) => f.statut_validation === "VALIDEE");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Promotions</h1>
      <p className="mt-1 text-sm text-slate-500">
        Mettez en avant une offre limitée sur une fiche validée (page d&apos;accueil, section
        « Promotions »).
      </p>

      <div className="mt-6 rounded-2xl bg-white p-5 card-shadow ring-1 ring-slate-100">
        <p className="text-sm font-semibold text-slate-900">Créer une promotion</p>
        {fiches.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            Aucune fiche validée n&apos;est disponible pour le moment.
          </p>
        ) : (
          <form action={adminCreatePromotionAction} className="mt-3 grid gap-3 sm:grid-cols-2">
            <select
              name="fiche_id"
              required
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal sm:col-span-2"
            >
              <option value="">Choisir une fiche…</option>
              {fiches.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.titre} — {f.zone}
                </option>
              ))}
            </select>
            <input
              name="titre"
              required
              placeholder="Titre (ex : Escapade Weekend)"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal sm:col-span-2"
            />
            <input
              name="badge"
              placeholder="Badge (ex : Offre Flash Weekend)"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
            />
            <input
              name="reduction_pct"
              type="number"
              min="1"
              max="90"
              required
              placeholder="Réduction en % (ex : 30)"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
            />
            <input
              name="prix_original"
              placeholder="Prix barré (ex : 199 $)"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
            />
            <input
              name="prix_promo"
              placeholder="Prix promo (ex : 99 $)"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
            />
            <input
              name="date_debut"
              type="date"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
            />
            <input
              name="date_fin"
              type="date"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
            />
            <button
              type="submit"
              className="rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 sm:col-span-2"
            >
              Créer la promotion
            </button>
          </form>
        )}
      </div>

      {promotions.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          Aucune promotion créée pour le moment.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {promotions.map((p) => (
            <div key={p.id} className="rounded-2xl bg-white p-4 card-shadow ring-1 ring-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800">
                    {p.titre} <span className="font-normal text-slate-400">— {p.fiche_titre}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    -{p.reduction_pct}% {p.badge ? `· ${p.badge}` : ""}
                    {p.prix_original || p.prix_promo
                      ? ` · ${p.prix_original ?? ""} → ${p.prix_promo ?? ""}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={p.active ? "ACTIF" : "INACTIVE"} />
                  <div className="flex gap-2">
                    <ToggleButton
                      action={adminTogglePromotionActiveAction.bind(null, p.id, !p.active)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      {p.active ? "Désactiver" : "Activer"}
                    </ToggleButton>
                    <ToggleButton
                      action={adminDeletePromotionAction.bind(null, p.id)}
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
