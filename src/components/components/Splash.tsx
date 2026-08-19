import LogoMark from "./LogoMark";
import SplashCarousel from "./SplashCarousel";
import { dismissSplashAction, dismissSplashAndGoAction } from "@/lib/actions/splash";

// Les 4 photos qui défilent sur l'écran de démarrage, l'une après l'autre.
// Cliquer sur l'image (ou le bouton « En savoir plus ») affiche sa
// description dans une fenêtre dédiée.
const SPLASH_SLIDES = [
  {
    src: "/images/splash/gorille.jpg",
    titre: "Une faune exceptionnelle",
    description:
      "Le Gabon abrite l'une des faunes les plus riches d'Afrique centrale, entre forêts denses et grands mammifères emblématiques comme le gorille des plaines.",
  },
  {
    src: "/images/splash/cascade.jpg",
    titre: "Des paysages naturels préservés",
    description:
      "Cascades, rivières et forêt équatoriale : le Gabon regorge de sites naturels spectaculaires, loin de l'agitation des grandes villes.",
  },
  {
    src: "/images/splash/batiment.jpg",
    titre: "Un pays en plein développement",
    description:
      "Entre architecture moderne et institutions solides, le Gabon poursuit sa transformation urbaine et son ouverture sur le monde.",
  },
  {
    src: "/images/splash/esplanade.jpg",
    titre: "De nouveaux espaces de vie",
    description:
      "Promenades, esplanades et lieux de rencontre pensés pour le bien-être des habitants voient le jour le long du littoral.",
  },
];

export default function Splash() {
  const goToLogin = dismissSplashAndGoAction.bind(null, "/proprietaire/connexion");

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#04141c]">
      <div className="relative flex-1">
        <SplashCarousel slides={SPLASH_SLIDES} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
          <LogoMark size={96} className="drop-shadow-[0_10px_25px_rgba(4,20,28,0.55)]" />
          <p className="mt-2 text-2xl font-bold text-white drop-shadow-sm">
            Happy <span className="text-brand-cyan">Life</span>
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/85">
            Vivez vos meilleurs moments
          </p>
        </div>
      </div>

      <div className="relative rounded-t-[28px] bg-[#04141c] px-6 pb-8 pt-7 text-center shadow-[0_-20px_40px_rgba(0,0,0,0.35)] sm:px-10">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Vivez vos meilleurs moments
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/70">
          Découvrez les meilleures piscines et appartements meublés du Gabon, réservez et
          profitez en toute simplicité.
        </p>

        <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
          <form action={dismissSplashAction}>
            <button
              type="submit"
              className="w-full rounded-full brand-gradient px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(15,155,170,0.45)] hover:opacity-90"
            >
              Commencer
            </button>
          </form>
          <form action={goToLogin}>
            <button
              type="submit"
              className="w-full rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
