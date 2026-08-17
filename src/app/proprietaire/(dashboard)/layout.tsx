import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/data";
import DashboardNav from "@/components/DashboardNav";

const LINKS = [
  { href: "/proprietaire", label: "Mes fiches" },
  { href: "/proprietaire/fiches/nouvelle", label: "Nouvelle fiche" },
  { href: "/proprietaire/demandes", label: "Demandes reçues" },
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

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav nom={session.nom} links={LINKS} homeHref="/proprietaire" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
