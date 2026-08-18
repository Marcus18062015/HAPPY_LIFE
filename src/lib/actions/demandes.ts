"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getVisiteurId } from "@/lib/visiteur";
import {
  createDemande,
  getFicheById,
  getEvenementById,
  getDemandeFicheOwner,
  setDemandeStatut,
} from "@/lib/data";
export type DemandeState = { error?: string; success?: undefined } | { success: true; error?: undefined } | undefined;

export async function createDemandeAction(
  ficheId: string,
  _prev: DemandeState,
  formData: FormData
): Promise<DemandeState> {
  const fiche = getFicheById(ficheId);
  if (!fiche || !fiche.active || fiche.statut_validation !== "VALIDEE") {
    return { error: "Cette fiche n'est plus disponible." };
  }

  const nom = String(formData.get("nom") || "").trim();
  const telephone = String(formData.get("telephone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!nom || !telephone) {
    return { error: "Merci de renseigner au minimum votre nom et votre téléphone." };
  }

  const visiteurId = await getVisiteurId();
  createDemande({ ficheId, visiteurId, nom, telephone, email, message });
  revalidatePath(`/fiche/${ficheId}`);
  revalidatePath("/mes-reservations");
  return { success: true };
}

export async function createDemandeEvenementAction(
  evenementId: string,
  _prev: DemandeState,
  formData: FormData
): Promise<DemandeState> {
  const evenement = getEvenementById(evenementId);
  if (!evenement || !evenement.active) {
    return { error: "Cet événement n'est plus disponible." };
  }

  const nom = String(formData.get("nom") || "").trim();
  const telephone = String(formData.get("telephone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!nom || !telephone) {
    return { error: "Merci de renseigner au minimum votre nom et votre téléphone." };
  }

  const visiteurId = await getVisiteurId();
  createDemande({ evenementId, visiteurId, nom, telephone, email, message });
  revalidatePath("/");
  revalidatePath("/mes-reservations");
  return { success: true };
}

// Contact générique depuis la vitrine d'un propriétaire (pas de fiche
// précise choisie au départ) : le visiteur sélectionne une des fiches
// publiques de ce propriétaire dans le formulaire. On revérifie ici,
// côté serveur, que la fiche choisie appartient bien à ce propriétaire et
// qu'elle est publique avant de créer la demande (le <select> ne fait pas
// foi à lui seul).
export async function createDemandeContactProprietaireAction(
  ownerId: string,
  _prev: DemandeState,
  formData: FormData
): Promise<DemandeState> {
  const ficheId = String(formData.get("fiche_id") || "").trim();
  const fiche = getFicheById(ficheId);
  if (
    !fiche ||
    fiche.owner_id !== ownerId ||
    !fiche.active ||
    fiche.statut_validation !== "VALIDEE"
  ) {
    return { error: "Merci de choisir une fiche valide de ce propriétaire." };
  }

  const nom = String(formData.get("nom") || "").trim();
  const telephone = String(formData.get("telephone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!nom || !telephone) {
    return { error: "Merci de renseigner au minimum votre nom et votre téléphone." };
  }

  const visiteurId = await getVisiteurId();
  createDemande({ ficheId: fiche.id, visiteurId, nom, telephone, email, message });
  revalidatePath("/mes-reservations");
  return { success: true };
}

export async function ownerSetDemandeStatutAction(
  demandeId: string,
  statut: "NOUVELLE" | "TRAITEE"
) {
  const session = await getSession();
  if (!session || session.role !== "PROPRIETAIRE") return;
  const ownerId = getDemandeFicheOwner(demandeId);
  if (ownerId !== session.sub) return;
  setDemandeStatut(demandeId, statut);
  revalidatePath("/proprietaire/demandes");
}
