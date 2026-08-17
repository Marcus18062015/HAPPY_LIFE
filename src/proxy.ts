import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Identifie chaque visiteur anonymement (aucun compte requis pour un visiteur
// public) via un cookie longue durée, afin de faire fonctionner réellement
// les favoris et « mes réservations » sans système de connexion visiteur.
const VISITEUR_COOKIE = "hp_visiteur";

export function proxy(request: NextRequest) {
  const existing = request.cookies.get(VISITEUR_COOKIE)?.value;
  if (existing) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const id = crypto.randomUUID();
  response.cookies.set(VISITEUR_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 2,
  });
  return response;
}

export const config = {
  matcher: [
    // Exécuté sur toutes les pages, hors fichiers statiques/API interne Next.js.
    "/((?!_next/static|_next/image|favicon.ico|icon-|apple-touch-icon|manifest.webmanifest|uploads/).*)",
  ],
};
