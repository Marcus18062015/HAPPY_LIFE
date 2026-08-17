import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserById, getAbonnementStatutProprietaire } from "@/lib/data";
import { ABONNEMENT_RAPPEL_JOURS } from "@/lib/constants";
import DashboardNav from "@/components/DashboardNav";

const LINKS = [
  { href: "/proprietaire", label: "Mes fiches" },
  { href: "/proprietaire/fiches/nouvelle", label: "Nouvelle fiche" },
  { href: "/proprietaire/demandes", label: "Demandes reçues" },
  { href: "/proprietaire/abonnement", label: "Mon abonnement" },
  // Un propriétaire actif a les mêmes droits que l'administrateur : ce lien
  // donne accès à l'espace /admin (validation des fiches et des comptes,
  // avis, promotions, événements, toutes les demandes).
  { href: "/admin", label: "Administration" },
];

export default async function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "PROPRIETAIRE") {
    redirect("/proprietaire/connexion");
  }
  const user = getUserById(session.sub);
  if (!user || user.statut === "SUSPENDU") {
    redirect("/proprietaire/connexion?suspendu=1");
  }
  if (user.statut === "EN_ATTENTE") {
    redirect("/proprietaire/connexion?attente=1");
  }

  // Bandeau de rappel d'échéance d'abonnement — demande explicite de
  // l'utilisateur ("Bandeau dans l'espace propriétaire et sms"). Le SMS est
  // pour l'instant un stub (voir src/lib/sms.ts) ; ce bandeau, lui, est
  // toujours visible dès que l'échéance approche ou est dépassée.
  const abonnement = getAbonnementStatutProprietaire(session.sub);
  const afficherRappel =
    !abonnement.abonnement || abonnement.joursRestants <= ABONNEMENT_RAPPEL_JOURS;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav nom={session.nom} links={LINKS} homeHref="/proprietaire" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {afficherRappel && (
          <Link
            href="/proprietaire/abonnement"
            className={`mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm ring-1 transition hover:opacity-90 ${
              !abonnement.abonnement || !abonnement.valide
                ? "bg-rose-50 text-rose-700 ring-rose-200"
                : "bg-amber-50 text-amber-700 ring-amber-200"
            }`}
          >
            <span>
              {!abonnement.abonnement
                ? "Vous n'avez pas encore d'abonnement actif : vos fiches ne sont pas visibles par les visiteurs."
                : !abonnement.valide
                  ? "Votre abonnement a expiré : vos fiches ne sont plus visibles par les visiteurs."
                  : `Votre abonnement expire dans ${abonnement.joursRestants} jour${
                      abonnement.joursRestants > 1 ? "s" : ""
                    }.`}
            </span>
            <span className="font-semibold underline">
              {abonnement.abonnement ? "Renouveler" : "Souscrire"} →
            </span>
          </Link>
        )}
        {children}
      </main>
    </div>
  );
}
