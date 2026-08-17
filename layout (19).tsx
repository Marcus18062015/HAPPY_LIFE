import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Happy Life — Piscines & appartements meublés au Gabon",
  description:
    "Happy Life centralise les piscines ouvertes au public et les appartements meublés au Gabon : découvrez, comparez et envoyez une demande de réservation en toute simplicité.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  // Permet d'ouvrir Happy Life « Ajouté à l'écran d'accueil » en plein
  // écran sur iPhone/iPad (sans la barre d'adresse Safari), comme une
  // véritable application.
  appleWebApp: {
    capable: true,
    title: "Happy Life",
    statusBarStyle: "black-translucent",
  },
  other: {
    // Next.js 16 n'émet plus que la balise standard "mobile-web-app-capable" ;
    // on ajoute l'ancienne balise préfixée pour les versions d'iOS Safari qui
    // ne reconnaissent encore que celle-ci (mode plein écran via "Sur l'écran
    // d'accueil").
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b3d4c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
