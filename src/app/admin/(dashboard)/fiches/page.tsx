import { listAllFiches, getUserById } from "@/lib/data";
import FicheAdminRow from "@/components/admin/FicheAdminRow";
import Link from "next/link";

export const metadata = { title: "Validation des fiches — Administration" };

const TABS = [
  { value: "", label: "Toutes" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "VALIDEE", label: "Validées" },
  { value: "REFUSEE", label: "Refusées" },
];

export default async function AdminFichesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut = "" } = await searchParams;
  const fiches = listAllFiches().filter((f) => !statut || f.statut_validation === statut);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Validation des fiches</h1>
      <p className="mt-1 text-sm text-slate-500">
        Modérez le contenu (photos, textes) avant publication publique.
      </p>

      <div className="mt-4 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={t.value ? `/admin/fiches?statut=${t.value}` : "/admin/fiches"}
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

      {fiches.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          Aucune fiche dans cette catégorie.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {fiches.map((f) => {
            const owner = getUserById(f.owner_id);
            return <FicheAdminRow key={f.id} fiche={f} ownerNom={owner?.nom || "—"} />;
          })}
        </div>
      )}
    </div>
  );
}
