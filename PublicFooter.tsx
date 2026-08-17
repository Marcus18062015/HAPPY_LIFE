import Link from "next/link";
import SocialButtons from "./SocialButtons";

export default function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-lg font-bold brand-gradient-text">Happy Life</p>
            <p className="mt-2 text-sm text-slate-500">
              La plateforme qui centralise piscines ouvertes au public et appartements
              meublés au Gabon, pour des loisirs et des séjours simples à organiser.
            </p>
            <SocialButtons variant="light" className="mt-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Découvrir</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-500">
              <li>
                <Link href="/recherche?type=PISCINE" className="hover:text-brand-deep">
                  Piscines
                </Link>
              </li>
              <li>
                <Link href="/recherche?type=APPARTEMENT" className="hover:text-brand-deep">
                  Appartements meublés
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="hover:text-brand-deep">
                  À propos & vision
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Professionnels</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-500">
              <li>
                <Link href="/proprietaire/inscription" className="hover:text-brand-deep">
                  Devenir propriétaire partenaire
                </Link>
              </li>
              <li>
                <Link href="/proprietaire" className="hover:text-brand-deep">
                  Espace propriétaire
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-deep">
                  Administration
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-slate-100 pt-6 text-xs text-slate-400">
          Happy Life — MVP. Les numéros des propriétaires sont masqués : toutes les
          demandes passent par la plateforme. © {new Date().getFullYear()} Happy Life —
          Fondateurs : Joseph Mbeng Yannick & Juste Cléona Ntoutoume, Libreville.
        </p>
      </div>
    </footer>
  );
}
