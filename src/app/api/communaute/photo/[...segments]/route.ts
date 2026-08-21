import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { COMMUNAUTE_UPLOADS_DIR } from "@/lib/communityUploads";

// Sert les photos du mur communautaire depuis un dossier hors de `public/`
// (voir src/lib/communityUploads.ts pour l'explication) : un gestionnaire de
// route comme celui-ci exécute du code à chaque requête et lit donc toujours
// l'état réel du disque, contrairement au dossier `public/`.

const MIME_PAR_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ segments: string[] }> }
) {
  const { segments } = await params;

  // Refuse toute tentative de remonter hors du dossier (ex: "..") avant de
  // toucher le système de fichiers.
  if (segments.some((s) => s.includes("..") || s.includes("/") || s.includes("\\"))) {
    return NextResponse.json({ error: "Chemin invalide." }, { status: 400 });
  }

  const filePath = path.join(COMMUNAUTE_UPLOADS_DIR, ...segments);
  let buffer: Buffer;
  try {
    buffer = await fs.readFile(filePath);
  } catch {
    return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
  }

  const ext = (segments[segments.length - 1]?.split(".").pop() || "").toLowerCase();
  const contentType = MIME_PAR_EXTENSION[ext] || "application/octet-stream";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      // Le nom de fichier est un UUID généré à l'upload : son contenu ne
      // change jamais une fois écrit, la mise en cache longue durée est donc
      // sûre (une suppression de publication rendra simplement l'URL 404).
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

