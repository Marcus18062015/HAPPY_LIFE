import Link from "next/link";
import { getSession } from "@/lib/auth";
import { listFichesByOwner } from "@/lib/data";
import { TYPE_LABELS } from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";
import ToggleButton from "@/components/ToggleButton";
import { toggleFicheActiveAction } from "@/lib/actions/fiches";

export const metadata = { title: "Mes fiches — Espace propriétaire" };

export default async function OwnerDashboardPage() {
  const session = await getSession();
  const fiches = listFichesByOwner(session!.sub);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes fiches</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gérez vos piscines et appartements meublés publiés sur Happy Life.
          </p>
        </div>
        <Link
          href="/proprietaire/fiches/nouvelle"
          className="rounded-full brand-gradient px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          + Nouvelle fiche
        </Link>
      </div>

      {fiches.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">Vous n&apos;avez pas encore de fiche.</p>
          <Link
            href="/proprietaire/fiches/nouvelle"
            className="mt-3 inline-block text-sm font-medium text-brand-teal"
          >
            Créer ma première fiche →
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white card-shadow ring-1 ring-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Fiche</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Validation</th>
                <th className="px-4 py-3">Publication</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fiches.map((f) => (
                <tr key={f.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{f.titre}</td>
                  <td className="px-4 py-3 text-slate-500">{TYPE_LABELS[f.type]}</td>
                  <td className="px-4 py-3 text-slate-500">{f.zone}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={f.statut_validation} />
                    {f.statut_validation === "REFUSEE" && f.motif_refus && (
                      <p className="mt-1 text-xs text-rose-500">{f.motif_refus}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={f.active ? "ACTIF" : "INACTIVE"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/proprietaire/fiches/${f.id}`}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Modifier
                      </Link>
                      <ToggleButton
                        action={toggleFicheActiveAction.bind(null, f.id, !f.active)}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        {f.active ? "Désactiver" : "Activer"}
                      </ToggleButton>
                    </div>
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
