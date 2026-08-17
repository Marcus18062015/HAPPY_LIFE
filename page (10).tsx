import Link from "next/link";
import { listAllAvis } from "@/lib/data";
import { adminSetAvisStatutAction } from "@/lib/actions/admin";
import { StarRatingStatic } from "@/components/StarRating";
import StatusBadge from "@/components/StatusBadge";
import ToggleButton from "@/components/ToggleButton";

export const metadata = { title: "Modération des avis — Administration" };

const TABS = [
  { value: "", label: "Tous" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "VALIDEE", label: "Publiés" },
  { value: "REFUSEE", label: "Refusés" },
];

export default async function AdminAvisPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut = "" } = await searchParams;
  const avis = listAllAvis().filter((a) => !statut || a.statut === statut);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Modération des avis</h1>
      <p className="mt-1 text-sm text-slate-500">
        Vérifiez chaque avis avant publication publique sur la fiche concernée.
      </p>

      <div className="mt-4 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={t.value ? `/admin/avis?statut=${t.value}` : "/admin/avis"}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
              statut === t.value
                ? "bg-brand-deep text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {avis.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          Aucun avis dans cette catégorie.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {avis.map((a) => (
            <div key={a.id} className="rounded-2xl bg-white p-4 card-shadow ring-1 ring-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800">
                    {a.auteur_nom}{" "}
                    <span className="font-normal text-slate-400">— {a.fiche_titre}</span>
                  </p>
                  <div className="mt-1">
                    <StarRatingStatic note={a.note} size="h-3.5 w-3.5" />
                  </div>
                  {a.commentaire && <p className="mt-2 text-sm text-slate-600">{a.commentaire}</p>}
                  <p className="mt-2 text-xs text-slate-400">
                    Envoyé le {new Date(a.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={a.statut} />
                  <div className="flex gap-2">
                    {a.statut !== "VALIDEE" && (
                      <ToggleButton
                        action={adminSetAvisStatutAction.bind(null, a.id, "VALIDEE")}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        Valider
                      </ToggleButton>
                    )}
                    {a.statut !== "REFUSEE" && (
                      <ToggleButton
                        action={adminSetAvisStatutAction.bind(null, a.id, "REFUSEE")}
                        className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
                      >
                        Refuser
                      </ToggleButton>
                    )}
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
