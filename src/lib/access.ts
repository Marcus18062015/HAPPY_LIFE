import "server-only";
import { getSession } from "./auth";
import type { SessionPayload } from "./auth";

// L'espace /admin est réservé exclusivement au rôle ADMIN. Un propriétaire,
// même actif, n'a accès qu'à son propre espace (/proprietaire) : gestion de
// ses propres fiches, des demandes reçues sur ses fiches, et de son
// abonnement. Il ne peut ni modérer le contenu d'un autre propriétaire, ni
// gérer les comptes, ni accéder à l'administration générale du site.
export async function getAdminSession(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}
