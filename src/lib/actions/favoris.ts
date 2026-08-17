"use server";

import { revalidatePath } from "next/cache";
import { getVisiteurId } from "@/lib/visiteur";
import { toggleFavori, toggleFavoriProprietaire } from "@/lib/data";

export async function toggleFavoriAction(ficheId: string) {
  const visiteurId = await getVisiteurId();
  if (!visiteurId) return { isFavori: false };
  const isFavori = toggleFavori(visiteurId, ficheId);
  revalidatePath("/");
  revalidatePath("/recherche");
  revalidatePath(`/fiche/${ficheId}`);
  revalidatePath("/favoris");
  return { isFavori };
}

export async function toggleFavoriProprietaireAction(ownerId: string) {
  const visiteurId = await getVisiteurId();
  if (!visiteurId) return { isFavori: false };
  const isFavori = toggleFavoriProprietaire(visiteurId, ownerId);
  revalidatePath(`/proprietaires/${ownerId}`);
  revalidatePath("/favoris");
  return { isFavori };
}
