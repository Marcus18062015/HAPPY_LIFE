import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/access";
import DashboardNav from "@/components/DashboardNav";

const LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/fiches", label: "Validation des fiches" },
  { href: "/admin/comptes", label: "Comptes propriétaires" },
  { href: "/admin/demandes", label: "Suivi des demandes" },
  { href: "/admin/avis", label: "Avis" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/evenements", label: "Événements" },
  { href: "/admin/publicites", label: "Publicités" },
  { href: "/admin/abonnes", label: "Abonnés" },
  { href: "/admin/mot-de-passe", label: "Mot de passe" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/connexion");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav nom={session.nom} links={LINKS} homeHref="/admin" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
