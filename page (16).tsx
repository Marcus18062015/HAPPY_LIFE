import FicheForm from "@/components/forms/FicheForm";
import { createFicheAction } from "@/lib/actions/fiches";

export const metadata = { title: "Nouvelle fiche — Espace propriétaire" };

export default function NouvelleFichePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Créer une nouvelle fiche</h1>
      <p className="mt-1 text-sm text-slate-500">
        Votre fiche sera visible publiquement après validation par l&apos;administrateur
        Happy Life.
      </p>
      <div className="mt-6 rounded-2xl bg-white p-6 card-shadow ring-1 ring-slate-100">
        <FicheForm action={createFicheAction} />
      </div>
    </div>
  );
}
