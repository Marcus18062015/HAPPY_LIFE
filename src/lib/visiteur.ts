import "server-only";
import { cookies } from "next/headers";

const VISITEUR_COOKIE = "hp_visiteur";

// Le cookie est déjà posé par src/proxy.ts avant que la requête n'atteigne
// une Server Component / Server Action ; on se contente de le lire ici.
// Si absent (edge case : action appelée avant tout passage par le proxy),
// on retombe sur une valeur vide plutôt que de planter — les favoris ne
// seront simplement pas persistés pour cette requête isolée.
export async function getVisiteurId(): Promise<string> {
  const store = await cookies();
  return store.get(VISITEUR_COOKIE)?.value ?? "";
}
