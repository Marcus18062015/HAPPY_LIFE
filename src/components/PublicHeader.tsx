import Link from "next/link";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { BellIcon } from "./icons";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <MobileMenu />
          <Logo />
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/recherche?type=PISCINE" className="hover:text-brand-deep">
            Piscines
          </Link>
          <Link href="/recherche?type=APPARTEMENT" className="hover:text-brand-deep">
            Appartements meublés
          </Link>
          <Link href="/recherche" className="hover:text-brand-deep">
            Rechercher
          </Link>
          <Link href="/a-propos" className="hover:text-brand-deep">
            À propos
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/proprietaire"
            className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-brand-deep hover:bg-brand-teal/10 md:block"
          >
            Espace propriétaire
          </Link>
          <Link
            href="/proprietaire/inscription"
            className="hidden rounded-full brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 sm:block"
          >
            Publier une fiche
          </Link>
          <Link
            href="/mes-reservations"
            aria-label="Mes réservations"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-brand-deep"
          >
            <BellIcon className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
