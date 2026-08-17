import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Les photos de démonstration sont des SVG générés localement (aucune
    // photo externe) : on autorise leur affichage via next/image en toute
    // sécurité (pas de script, sandboxées).
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
