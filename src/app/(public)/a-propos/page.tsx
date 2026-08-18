import Link from "next/link";

export const metadata = { title: "À propos — Happy Life" };

export default function AProposPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <span className="inline-block rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-deep">
        Vision & modèle économique
      </span>
      <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
        À propos de Happy Life
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Happy Life est conçue pour devenir la plateforme digitale de référence des
        loisirs, de l&apos;hébergement de courte durée et des expériences locales au
        Gabon — en commençant par une version simple et solide avant d&apos;élargir
        progressivement ses fonctionnalités.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">Le problème</h2>
        <p className="mt-3 text-slate-600">
          Au Gabon, l&apos;offre de piscines ouvertes au public et d&apos;appartements
          meublés reste dispersée entre le bouche-à-oreille, WhatsApp et les réseaux
          sociaux. Les visiteurs peinent à comparer les options fiables, tandis que les
          propriétaires perdent en visibilité faute d&apos;un espace centralisé et
          crédible pour présenter leurs biens.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-slate-900">Notre approche : avancer par étapes</h2>
        <p className="mt-3 text-slate-600">
          Plutôt que de lancer d&apos;emblée une application complexe, Happy Life
          démarre avec un MVP volontairement simple : centraliser les fiches, faciliter
          la recherche par zone et permettre l&apos;envoi de demandes de réservation
          sans jamais exposer les coordonnées des propriétaires. Cette première version
          sert à valider l&apos;adoption réelle du marché avant d&apos;investir dans des
          fonctionnalités plus avancées.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 card-shadow ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-brand-deep">Aujourd&apos;hui (MVP)</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              <li>Découverte et recherche par zone</li>
              <li>Fiches détaillées (photos, tarifs indicatifs, équipements)</li>
              <li>Demandes de réservation centralisées, contacts protégés</li>
              <li>Modération humaine avant publication</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-5 card-shadow ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-brand-teal">Vision à terme</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              <li>Paiement Mobile Money & carte bancaire</li>
              <li>Réservation et disponibilité en temps réel</li>
              <li>Avis clients et historique</li>
              <li>Tableau de bord statistiques pour les partenaires</li>
              <li>Événements, promotions et programme de fidélité</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-slate-900">Modèle économique envisagé</h2>
        <p className="mt-3 text-slate-600">
          Une fois l&apos;usage validé, plusieurs sources de revenus sont à l&apos;étude
          pour financer la croissance de la plateforme : commissions sur les
          réservations de piscines et d&apos;appartements, abonnements premium pour les
          propriétaires, mise en avant sponsorisée des fiches, publicités locales, et à
          plus long terme des revenus indirects (restauration, transport, événements).
          Aucun de ces éléments n&apos;est activé sur la version actuelle.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-slate-900">Notre ambition</h2>
        <p className="mt-3 text-slate-600">
          Faire de Happy Life la plateforme incontournable des loisirs, week-ends et
          séjours au Gabon, puis accompagner progressivement la structuration du
          tourisme local et régional — avec une exécution prudente, phase après phase.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/recherche"
          className="rounded-full brand-gradient px-5 py-2.5 text-sm font-semibold text-white"
        >
          Découvrir les fiches disponibles
        </Link>
        <Link
          href="/proprietaire/inscription"
          className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-brand-deep"
        >
          Devenir propriétaire partenaire
        </Link>
      </div>
    </div>
  );
}
