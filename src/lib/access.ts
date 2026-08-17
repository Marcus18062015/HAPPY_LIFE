import "server-only";
import { getSession } from "./auth";
import type { SessionPayload } from "./auth";
import { getUserById } from "./data";

// À la demande explicite de l'utilisateur, un propriétaire actif a
// désormais les mêmes droits que l'administrateur : gestion des avis,
// promotions, événements, validation de toutes les fiches (pas seulement
// les siennes), suivi de toutes les demandes, et validation/suppression
// des comptes propriétaires.
//
// Seul un compte ADMIN, ou un compte PROPRIETAIRE dont le statut est ACTIF
// — revérifié en base à chaque appel, jamais déduit du JWT — obtient cet
// accès. Cela empêche un compte tout juste créé (EN_ATTENTE) ou suspendu
// (SUSPENDU) de s'auto-valider ou d'agir en administrateur simplement en
// visitant /admin/*.
export async function getAdminEquivalentSession(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) return null;
  if (session.role === "ADMIN") return session;
  if (session.role === "PROPRIETAIRE") {
    const user = getUserById(session.sub);
    if (user && user.statut === "ACTIF") return session;
  }
  return null;
}
