"use server";

import { revalidatePath } from "next/cache";
import { getFicheById, createAvis } from "@/lib/data";

export type AvisState = { error?: string; success?: undefined } | { success: true; error?: undefined } | undefined;

export async function createAvisAction(
  ficheId: string,
  _prev: AvisState,
  formData: FormData
): Promise<AvisState> {
  const fiche = getFicheById(ficheId);
  if (!fiche) {
    return { error: "Cette fiche n'existe plus." };
  }

  const auteurNom = String(formData.get("auteur_nom") || "").trim();
  const note = Number(formData.get("note") || 0);
  const commentaire = String(formData.get("commentaire") || "").trim();

  if (!auteurNom) {
    return { error: "Merci d'indiquer votre nom." };
  }
  if (!Number.isInteger(note) || note < 1 || note > 5) {
    return { error: "Merci de choisir une note entre 1 et 5 étoiles." };
  }

  // Modéré par l'administrateur avant publication, comme les fiches — cohérent
  // avec l'esprit du cahier des charges (contenu contrôlé avant mise en ligne).
  createAvis({ ficheId, auteurNom, note, commentaire });
  revalidatePath(`/fiche/${ficheId}`);
  return { success: true };
}
