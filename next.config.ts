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
  experimental: {
    // La base est un fichier SQLite unique (node:sqlite). En build, Next
    // lance plusieurs workers en parallèle pour collecter les données de
    // chaque page, et plusieurs process qui ouvrent le même fichier en même
    // temps déclenchent une erreur "database is locked". On force un seul
    // worker pour cette étape : le build est un peu plus lent, mais fiable.
    cpus: 1,
  },
};

export default nextConfig;
