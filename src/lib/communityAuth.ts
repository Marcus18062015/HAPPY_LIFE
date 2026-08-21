import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Session de l'espace communautaire — volontairement séparée du cookie
// admin/propriétaire (src/lib/auth.ts) : un client de la communauté n'a
// jamais accès aux espaces admin/propriétaire, et inversement.
const COOKIE_NAME = "happy_life_communaute_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me-happy-life"
);

export interface CommunitySessionPayload {
  sub: string; // id du membre
  nom: string;
  [key: string]: unknown;
}

export async function createCommunitySessionCookie(payload: CommunitySessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCommunitySessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCommunitySession(): Promise<CommunitySessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as CommunitySessionPayload;
  } catch {
    return null;
  }
}

