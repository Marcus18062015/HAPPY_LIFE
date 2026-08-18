"use server";

import { revalidatePath } from "next/cache";
import { createAbonne, findAbonneByEmailOrTelephone } from "@/lib/data";

export type AbonneState =
  | { error?: string; success?: undefined }
  | { success: true; error?: undefined }
  | undefined;

// Inscription de l'espace visiteur : recevoir des alertes sur les nouveaux
// événements, promotions et fiches. On demande au minimum l'un des deux
// (email ou téléphone) mais on encourage les deux, comme choisi par
// l'utilisateur ("Email et téléphone").
export async function subscribeAbonneAction(
  _prev: AbonneState,
  formData: FormData
): Promise<AbonneState> {
  const email = String(formData.get("email") || "").trim();
  const telephone = String(formData.get("telephone") || "").trim();

  if (!email && !telephone) {
    return { error: "Merci de renseigner au moins un email ou un numéro de téléphone." };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Merci de renseigner une adresse email valide." };
  }

  const existing = findAbonneByEmailOrTelephone(email || undefined, telephone || undefined);
  if (existing) {
    return { success: true };
  }

  createAbonne({ email: email || undefined, telephone: telephone || undefined });
  revalidatePath("/admin/abonnes");
  return { success: true };
}
