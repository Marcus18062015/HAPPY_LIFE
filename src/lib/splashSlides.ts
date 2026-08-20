export type SplashSlide = {
  src: string;
  titre: string;
  description: string;
};

// Les 4 photos utilisées à la fois sur l'écran de démarrage (Splash) et sur
// le bandeau de la page d'accueil (ProfileHero) — centralisées ici pour ne
// pas dupliquer la liste à deux endroits.
export const SPLASH_SLIDES: SplashSlide[] = [
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
