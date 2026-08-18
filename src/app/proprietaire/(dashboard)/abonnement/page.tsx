import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAbonnementStatutProprietaire } from "@/lib/data";
import { ABONNEMENT_OFFRES, ABONNEMENT_PRIX_MENSUEL, calculerMontantAbonnement } from "@/lib/constants";
import AbonnementProprietaireForm from "@/components/forms/AbonnementProprietaireForm";
import StatusBadge from "@/components/StatusBadge";

export const metadata = { title: "Mon abonnement — Espace propriétaire" };

function formatFcfa(montant: number): string {
  return `${montant.toLocaleString("fr-FR")} FCFA`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function AbonnementProprietairePage() {
  const session = await getSession();
  if (!session || session.role !== "PROPRIETAIRE") {
    redirect("/proprietaire/connexion");
  }

  const statut = getAbonnementStatutProprietaire(session.sub);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Mon abonnement</h1>
      <p className="mt-1 text-sm text-slate-500">
        Vos fiches ne sont visibles par les visiteurs que tant que votre abonnement est
        valide — {formatFcfa(ABONNEMENT_PRIX_MENSUEL)} par mois (30 jours), avec des remises
        pour les engagements plus longs.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-5 card-shadow ring-1 ring-slate-100">
        {statut.abonnement ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Statut actuel</p>
                <div className="mt-1">
                  <StatusBadge status={statut.valide ? "ACTIF" : "SUSPENDU"} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">
                  {statut.valide ? "Expire le" : "A expiré le"}
                </p>
                <p className="font-semibold text-slate-900">
                  {formatDate(statut.abonnement.date_fin)}
                </p>
              </div>
            </div>

            {statut.valide ? (
              statut.joursRestants <= 7 && (
                <p className="mt-4 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-700 ring-1 ring-amber-200">
                  Votre abonnement expire dans {statut.joursRestants} jour
                  {statut.joursRestants > 1 ? "s" : ""}. Renouvelez ci-dessous pour éviter
                  toute coupure de visibilité de vos fiches.
                </p>
              )
            ) : (
              <p className="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 ring-1 ring-rose-200">
                Votre abonnement a expiré : vos fiches ne sont plus visibles par les
                visiteurs. Renouvelez ci-dessous pour les republier immédiatement.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500">
            Vous n&apos;avez pas encore souscrit d&apos;abonnement. Vos fiches ne sont pas
            visibles par les visiteurs tant qu&apos;aucun abonnement n&apos;est actif.
          </p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {ABONNEMENT_OFFRES.map((offre) => (
          <div
            key={offre.mois}
            className="rounded-xl bg-slate-50 p-3.5 text-center ring-1 ring-slate-100"
          >
            <p className="text-xs text-slate-500">{offre.label}</p>
            <p className="mt-1 font-bold text-brand-deep">
              {formatFcfa(calculerMontantAbonnement(offre.mois))}
            </p>
            {offre.remisePct > 0 && (
              <p className="text-xs text-emerald-600">-{offre.remisePct}%</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-5 card-shadow ring-1 ring-slate-100">
        <h2 className="text-lg font-semibold text-slate-900">
          {statut.abonnement ? "Renouveler mon abonnement" : "Souscrire un abonnement"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Réglez le montant par le moyen électronique de votre choix (Mobile Money, virement...),
          puis confirmez ci-dessous — votre abonnement est activé immédiatement.
        </p>
        <div className="mt-5">
          <AbonnementProprietaireForm />
        </div>
      </div>
    </div>
  );
}
