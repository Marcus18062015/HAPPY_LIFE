"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/access";
import {
  setFicheValidation,
  setFicheActive,
  setUserStatut,
  setDemandeStatut,
  setAvisStatut,
  createPromotion,
  deletePromotion,
  togglePromotionActive,
  createEvenement,
  deleteEvenement,
  toggleEvenementActive,
  deleteOwner,
  createPublicite,
  deletePublicite,
  togglePubliciteActive,
  deleteAbonne,
} from "@/lib/data";

// Réservé exclusivement au rôle ADMIN — voir src/lib/access.ts.
async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Accès refusé : réservé à l'administrateur.");
  }
  return session;
}

export async function validerFicheAction(ficheId: string) {
  await requireAdmin();
  setFicheValidation(ficheId, "VALIDEE");
  revalidatePath("/admin/fiches");
  revalidatePath("/admin");
  revalidatePath("/recherche");
}

export async function refuserFicheAction(ficheId: string, formData: FormData) {
  await requireAdmin();
  const motif = String(formData.get("motif") || "").trim();
  setFicheValidation(ficheId, "REFUSEE", motif || "Non conforme aux critères de publication.");
  revalidatePath("/admin/fiches");
  revalidatePath("/admin");
}

export async function remettreEnAttenteAction(ficheId: string) {
  await requireAdmin();
  setFicheValidation(ficheId, "EN_ATTENTE");
  revalidatePath("/admin/fiches");
  revalidatePath("/admin");
}

export async function adminToggleFicheActiveAction(ficheId: string, active: boolean) {
  await requireAdmin();
  setFicheActive(ficheId, active);
  revalidatePath("/admin/fiches");
  revalidatePath("/recherche");
}

export async function adminSetOwnerStatutAction(
  ownerId: string,
  statut: "EN_ATTENTE" | "ACTIF" | "SUSPENDU"
) {
  await requireAdmin();
  setUserStatut(ownerId, statut);
  revalidatePath("/admin/comptes");
}

// Supprime définitivement un compte propriétaire non conforme (et ses
// fiches, en cascade). Réservé à l'admin comme le reste de ce fichier ;
// deleteOwner() ne cible que role='PROPRIETAIRE', donc impossible de
// supprimer le compte administrateur par ce biais.
export async function adminDeleteOwnerAction(ownerId: string) {
  await requireAdmin();
  deleteOwner(ownerId);
  revalidatePath("/admin/comptes");
}

export async function adminSetDemandeStatutAction(
  demandeId: string,
  statut: "NOUVELLE" | "TRAITEE"
) {
  await requireAdmin();
  setDemandeStatut(demandeId, statut);
  revalidatePath("/admin/demandes");
}

// ---------- Avis ----------

export async function adminSetAvisStatutAction(
  avisId: string,
  statut: "VALIDEE" | "REFUSEE" | "EN_ATTENTE"
) {
  await requireAdmin();
  setAvisStatut(avisId, statut);
  revalidatePath("/admin/avis");
  revalidatePath("/fiche");
}

// ---------- Promotions ----------

export async function adminCreatePromotionAction(formData: FormData) {
  await requireAdmin();
  const ficheId = String(formData.get("fiche_id") || "").trim();
  const titre = String(formData.get("titre") || "").trim();
  const badge = String(formData.get("badge") || "").trim();
  const reductionPct = Number(formData.get("reduction_pct") || 0);
  const prixOriginal = String(formData.get("prix_original") || "").trim();
  const prixPromo = String(formData.get("prix_promo") || "").trim();
  const dateDebut = String(formData.get("date_debut") || "").trim();
  const dateFin = String(formData.get("date_fin") || "").trim();

  if (!ficheId || !titre || !reductionPct) {
    return;
  }

  createPromotion({
    ficheId,
    titre,
    badge,
    reductionPct,
    prixOriginal,
    prixPromo,
    dateDebut,
    dateFin,
  });
  revalidatePath("/admin/promotions");
  revalidatePath("/");
}

export async function adminDeletePromotionAction(id: string) {
  await requireAdmin();
  deletePromotion(id);
  revalidatePath("/admin/promotions");
  revalidatePath("/");
}

export async function adminTogglePromotionActiveAction(id: string, active: boolean) {
  await requireAdmin();
  togglePromotionActive(id, active);
  revalidatePath("/admin/promotions");
  revalidatePath("/");
}

// ---------- Événements ----------

export async function adminCreateEvenementAction(formData: FormData) {
  await requireAdmin();
  const titre = String(formData.get("titre") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const lieu = String(formData.get("lieu") || "").trim();
  const dateEvenement = String(formData.get("date_evenement") || "").trim();
  const prixInfo = String(formData.get("prix_info") || "").trim();
  const image = String(formData.get("image") || "").trim();

  if (!titre || !lieu || !dateEvenement) {
    return;
  }

  createEvenement({ titre, description, lieu, dateEvenement, prixInfo, image });
  revalidatePath("/admin/evenements");
  revalidatePath("/");
}

export async function adminDeleteEvenementAction(id: string) {
  await requireAdmin();
  deleteEvenement(id);
  revalidatePath("/admin/evenements");
  revalidatePath("/");
}

export async function adminToggleEvenementActiveAction(id: string, active: boolean) {
  await requireAdmin();
  toggleEvenementActive(id, active);
  revalidatePath("/admin/evenements");
  revalidatePath("/");
}

// ---------- Publicités (encart publicitaire) ----------

export async function adminCreatePubliciteAction(formData: FormData) {
  await requireAdmin();
  const titre = String(formData.get("titre") || "").trim();
  const annonceur = String(formData.get("annonceur") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const image = String(formData.get("image") || "").trim();
  const lien = String(formData.get("lien") || "").trim();

  if (!titre) {
    return;
  }

  createPublicite({ titre, annonceur, description, image, lien });
  revalidatePath("/admin/publicites");
  revalidatePath("/");
}

export async function adminDeletePubliciteAction(id: string) {
  await requireAdmin();
  deletePublicite(id);
  revalidatePath("/admin/publicites");
  revalidatePath("/");
}

export async function adminTogglePubliciteActiveAction(id: string, active: boolean) {
  await requireAdmin();
  togglePubliciteActive(id, active);
  revalidatePath("/admin/publicites");
  revalidatePath("/");
}

// ---------- Abonnés (alertes visiteurs) ----------

export async function adminDeleteAbonneAction(id: string) {
  await requireAdmin();
  deleteAbonne(id);
  revalidatePath("/admin/abonnes");
}
