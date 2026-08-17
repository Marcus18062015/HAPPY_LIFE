import type { MetadataRoute } from "next";

// Manifeste d'application web (PWA) : permet d'« Ajouter à l'écran d'accueil »
// depuis le navigateur du téléphone (Chrome Android / Safari iOS) pour obtenir
// une icône et un lancement en plein écran, comme une vraie application.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Happy Life",
    short_name: "Happy Life",
    description:
      "Piscines ouvertes au public et appartements meublés au Gabon : découvrez, comparez, envoyez une demande.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b2c3d",
    theme_color: "#0b3d4c",
    lang: "fr",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
