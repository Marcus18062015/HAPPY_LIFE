import { cookies } from "next/headers";
import Link from "next/link";
import { listFavorisForVisiteur, listDemandesByVisiteur } from "@/lib/data";
import { HeartIcon, CalendarIcon, UserIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil — Happy Life" };

export default async function ProfilPage() {
  const store = await cookies();
  const visiteurId = store.get("hp_visiteur")?.value ?? "";
  const favoris = listFavorisForVisiteur(visiteurId);
  const reservations = listDemandesByVisiteur(visiteurId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full brand-gradient text-white">
          <UserIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Votre profil visiteur</h1>
          <p className="text-sm text-slate-500">
            Aucun compte requis — vos favoris et réservations restent liés à cet appareil.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Link
          href="/favoris"
          className="flex flex-col items-center gap-2 rounded-2xl bg-white p-6 text-center card-shadow ring-1 ring-slate-100 hover:-translate-y-0.5 hover:shadow-md"
        >
          <HeartIcon className="h-6 w-6 text-rose-500" filled />
          <p className="text-2xl font-bold text-slate-900">{favoris.length}</p>
          <p className="text-sm text-slate-500">Favoris</p>
        </Link>
        <Link
          href="/mes-reservations"
          className="flex flex-col items-center gap-2 rounded-2xl bg-white p-6 text-center card-shadow ring-1 ring-slate-100 hover:-translate-y-0.5 hover:shadow-md"
        >
          <CalendarIcon className="h-6 w-6 text-brand-teal" />
          <p className="text-2xl font-bold text-slate-900">{reservations.length}</p>
          <p className="text-sm text-slate-500">Réservations</p>
        </Link>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-5 card-shadow ring-1 ring-slate-100">
        <p className="text-sm font-semibold text-slate-900">Espaces professionnels</p>
        <div className="mt-3 flex flex-col gap-2">
          <Link
            href="/proprietaire"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-brand-deep hover:bg-brand-teal/10"
          >
            Espace propriétaire
          </Link>
          <Link
            href="/proprietaire/inscription"
            className="rounded-xl brand-gradient px-4 py-3 text-center text-sm font-semibold text-white hover:opacity-90"
          >
            Publier une fiche
          </Link>
          <Link
            href="/admin"
            className="rounded-xl px-4 py-3 text-center text-xs text-slate-400 hover:text-slate-600"
          >
            Administration
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        <Link href="/a-propos" className="hover:text-brand-deep">
          À propos de Happy Life
        </Link>
      </p>
    </div>
  );
}
