import LogoMark from "./LogoMark";
import SplashCarousel from "./SplashCarousel";
import { dismissSplashAction, dismissSplashAndGoAction } from "@/lib/actions/splash";
import { SPLASH_SLIDES } from "@/lib/splashSlides";

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

