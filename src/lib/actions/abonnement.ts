"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getAdminEquivalentSession } from "@/lib/access";
import {
  createAbonnementProprietaire,
  getUserById,
  listAbonnementsProprietairesAvecOwners,
} from "@/lib/data";
import { sendSms, messageRappelAbonnement } from "@/lib/sms";

export type AbonnementFormState = { error?: string; success?: boolean } | undefined;

const DUREES_AUTORISEES = [1, 3, 6, 12];

// Souscription/renouvellement d'abonnement propriétaire. Conformément à la
// demande explicite de l'utilisateur, il n'y a pas de passerelle de
// paiement réelle : c'est le propriétaire lui-même qui confirme avoir
// réglé le montant par le moyen électronique de son choix
// (auto-déclaration), et l'abonnement démarre immédiatement.
export async function souscrireAbonnementAction(
  _prev: AbonnementFormState,
  formData: FormData
): Promise<AbonnementFormState> {
  const session = await getSession();
  if (!session || session.role !== "PROPRIETAIRE") {
    return { error: "Vous devez être connecté en tant que propriétaire." };
  }

  const user = getUserById(session.sub);
  if (!user || user.statut !== "ACTIF") {
    return {
      error: "Votre compte doit être validé et actif pour souscrire à un abonnement.",
    };
  }

  const dureeMois = Number(formData.get("dureeMois"));
  if (!DUREES_AUTORISEES.includes(dureeMois)) {
    return { error: "Durée d'abonnement invalide." };
  }
  const moyenPaiement = String(formData.get("moyenPaiement") || "").trim();
  if (!moyenPaiement) {
    return { error: "Merci de préciser le moyen de paiement utilisé." };
  }
  const referencePaiement = String(formData.get("referencePaiement") || "").trim();
  const confirmation = formData.get("confirmation");
  if (!confirmation) {
    return {
      error: "Merci de confirmer que le paiement a bien été effectué avant de valider.",
    };
  }

  createAbonnementProprietaire({
    ownerId: session.sub,
    dureeMois,
    moyenPaiement,
    referencePaiement,
  });

  revalidatePath("/proprietaire");
  revalidatePath("/proprietaire/abonnement");
  revalidatePath("/admin/comptes");
  revalidatePath("/recherche");
  return { success: true };
}

// Déclenchement manuel du rappel SMS par l'administrateur — en l'absence
// d'un job planifié automatique et d'un fournisseur SMS déjà configuré
// (choix explicite de l'utilisateur : "faire sans pour l'instant"), c'est
// pour l'instant un bouton manuel dans l'espace admin. Le bandeau dans
// l'espace propriétaire, lui, s'affiche automatiquement.
export async function envoyerRappelAbonnementAction(ownerId: string) {
  const admin = await getAdminEquivalentSession();
  if (!admin) {
    return { envoye: false, raison: "Accès refusé." };
  }
  const statuts = listAbonnementsProprietairesAvecOwners();
  const entry = statuts.find((s) => s.owner.id === ownerId);
  if (!entry) return { envoye: false, raison: "Propriétaire introuvable." };

  const message = messageRappelAbonnement(entry.statut.joursRestants);
  const result = await sendSms(entry.owner.telephone || "", message);
  return result;
}
