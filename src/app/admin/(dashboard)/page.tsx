import Link from "next/link";
import { dashboardStats } from "@/lib/data";

export const metadata = { title: "Tableau de bord — Administration" };

export default function AdminDashboardPage() {
  const s = dashboardStats();

  const cards = [
    { label: "Fiches au total", value: s.nbFiches, href: "/admin/fiches" },
    { label: "Fiches validées", value: s.nbFichesValidees, href: "/admin/fiches" },
    {
      label: "En attente de validation",
      value: s.nbFichesEnAttente,
      href: "/admin/fiches",
      highlight: s.nbFichesEnAttente > 0,
    },
    { label: "Fiches refusées", value: s.nbFichesRefusees, href: "/admin/fiches" },
    { label: "Demandes reçues", value: s.nbDemandes, href: "/admin/demandes" },
    {
      label: "Demandes non traitées",
      value: s.nbDemandesNouvelles,
      href: "/admin/demandes",
      highlight: s.nbDemandesNouvelles > 0,
    },
    { label: "Comptes propriétaires", value: s.nbProprietaires, href: "/admin/comptes" },
    {
      label: "Avis en attente",
      value: s.nbAvisEnAttente,
      href: "/admin/avis",
      highlight: s.nbAvisEnAttente > 0,
    },
    { label: "Promotions actives", value: s.nbPromotionsActives, href: "/admin/promotions" },
    { label: "Événements actifs", value: s.nbEvenementsActifs, href: "/admin/evenements" },
    { label: "Abonnés aux alertes", value: s.nbAbonnes, href: "/admin/abonnes" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
      <p className="mt-1 text-sm text-slate-500">
        Vue d&apos;ensemble de l&apos;activité Happy Life : fiches, demandes et
        contenus publiés.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`rounded-2xl bg-white p-5 card-shadow ring-1 transition hover:-translate-y-0.5 ${
              c.highlight ? "ring-brand-teal/40" : "ring-slate-100"
            }`}
          >
            <p className="text-3xl font-bold text-brand-deep">{c.value}</p>
            <p className="mt-1 text-sm text-slate-500">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
