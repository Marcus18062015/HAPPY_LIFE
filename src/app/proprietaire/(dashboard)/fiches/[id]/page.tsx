import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getFicheById } from "@/lib/data";
import FicheForm from "@/components/forms/FicheForm";
import StatusBadge from "@/components/StatusBadge";
import { updateFicheAction, deletePhotoAction } from "@/lib/actions/fiches";

export const metadata = { title: "Modifier une fiche — Espace propriétaire" };

export default async function ModifierFichePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const fiche = getFicheById(id);

  if (!fiche || fiche.owner_id !== session!.sub) {
    notFound();
  }

  const boundUpdate = updateFicheAction.bind(null, id);
  const boundDelete = deletePhotoAction.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{fiche.titre}</h1>
        <StatusBadge status={fiche.statut_validation} />
        <StatusBadge status={fiche.active ? "ACTIF" : "INACTIVE"} />
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Modifiez les informations de votre fiche. Toute modification est de nouveau
        soumise à validation.
      </p>
      <div className="mt-6 rounded-2xl bg-white p-6 card-shadow ring-1 ring-slate-100">
        <FicheForm action={boundUpdate} initial={fiche} onDeletePhoto={boundDelete} />
      </div>
    </div>
  );
}
