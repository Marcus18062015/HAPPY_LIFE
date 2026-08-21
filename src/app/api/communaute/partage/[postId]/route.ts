import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getPostById } from "@/lib/community";
import { COMMUNAUTE_UPLOADS_DIR, PHOTO_URL_PREFIX } from "@/lib/communityUploads";

// Génère à la volée une copie de la photo d'une publication communautaire
// avec le logo Happy Life en filigrane — appelée uniquement au moment où un
// membre partage la photo en dehors de l'application (bouton "Partager").
// La photo d'origine stockée sur le mur (public/uploads/communaute/...)
// n'est elle-même JAMAIS modifiée : le filigrane n'existe que sur cette
// copie générée ici, à chaque appel.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const post = getPostById(postId);
  if (!post) {
    return NextResponse.json({ error: "Publication introuvable." }, { status: 404 });
  }

  if (!post.photo.startsWith(PHOTO_URL_PREFIX)) {
    return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
  }
  const relatif = post.photo.slice(PHOTO_URL_PREFIX.length);
  const photoPath = path.join(COMMUNAUTE_UPLOADS_DIR, relatif);
  let baseBuffer: Buffer;
  try {
    baseBuffer = await fs.readFile(photoPath);
  } catch {
    return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
  }

  const base = sharp(baseBuffer).rotate(); // .rotate() sans argument : applique l'orientation EXIF puis la retire
  const { width = 1080, height = 1080 } = await base.metadata();

  // Le logo occupe environ 16% de la largeur de la photo, avec un minimum
  // et un maximum lisibles quelle que soit la taille d'origine.
  const logoWidth = Math.max(72, Math.min(240, Math.round(width * 0.16)));
  const logoPath = path.join(process.cwd(), "public", "brand", "logo-mark.png");
  const logoResized = await sharp(logoPath)
    .resize({ width: logoWidth })
    .toBuffer({ resolveWithObject: true });
  const logoHeight = logoResized.info.height;

  const margin = Math.round(width * 0.035);
  const left = Math.max(0, width - logoWidth - margin);
  const top = Math.max(0, height - logoHeight - margin);

  // Plaque semi-transparente derrière le logo pour qu'il reste lisible sur
  // n'importe quelle photo (claire ou foncée).
  const padding = Math.round(logoWidth * 0.18);
  const plaqueSvg = Buffer.from(
    `<svg width="${logoWidth + padding * 2}" height="${logoHeight + padding * 2}" xmlns="http://www.w3.org/2000/svg">
       <rect x="0" y="0" width="${logoWidth + padding * 2}" height="${logoHeight + padding * 2}"
             rx="${Math.round(padding * 1.1)}" fill="rgba(4,20,28,0.45)" />
     </svg>`
  );

  const composite = await base
    .composite([
      {
        input: plaqueSvg,
        left: Math.max(0, left - padding),
        top: Math.max(0, top - padding),
      },
      { input: logoResized.data, left, top },
    ])
    .jpeg({ quality: 88 })
    .toBuffer();

  return new NextResponse(new Uint8Array(composite), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `inline; filename="happy-life-${postId}.jpg"`,
      "Cache-Control": "no-store",
    },
  });
}

