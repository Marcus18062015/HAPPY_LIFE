import "server-only";
import path from "node:path";

// Dossier de stockage des photos du mur communautaire — volontairement HORS
// de `public/` : sur cette version de Next.js, `next start` ne sert que les
// fichiers présents dans `public/` au moment du `next build`, un fichier
// ajouté après coup (upload utilisateur) renvoie 404 tant qu'un nouveau
// build n'a pas eu lieu. Les fichiers stockés ici sont donc servis par un
// gestionnaire de route qui lit le disque à chaque requête, voir
// src/app/api/communaute/photo/[...segments]/route.ts.
export const COMMUNAUTE_UPLOADS_DIR = path.join(process.cwd(), "data", "uploads", "communaute");

export const PHOTO_URL_PREFIX = "/api/communaute/photo/";

