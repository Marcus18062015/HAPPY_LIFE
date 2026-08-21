"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createSessionCookie,
  clearSessionCookie,
  hashPassword,
  verifyPassword,
  getSession,
} from "@/lib/auth";
import {
  createUser,
  getUserByEmail,
  getUserById,
  setUserPassword,
  regenererCodeReinitialisation,
  reinitialiserMotDePasseUtilisateur,
} from "@/lib/data";

export type FormState = { error?: string } | undefined;

export type PasswordFormState = { error?: string; success?: boolean } | undefined;

export type ResetPasswordState =
  | { error?: string; success?: boolean; userId?: string; codeTest?: string }
  | undefined;

export async function loginProprietaireAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const user = getUserByEmail(email);
  if (!user || user.role !== "PROPRIETAIRE") {
    return { error: "Identifiants incorrects." };
  }
  if (user.statut === "SUSPENDU") {
    return { error: "Ce compte propriétaire a été suspendu par l'administrateur." };
  }
  if (user.statut === "EN_ATTENTE") {
    return {
      error: "Ce compte est en attente de validation par l'administrateur.",
    };
  }
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return { error: "Identifiants incorrects." };

  await createSessionCookie({ sub: user.id, role: user.role, nom: user.nom });
  redirect("/proprietaire");
}

export async function registerProprietaireAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const nom = String(formData.get("nom") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const telephone = String(formData.get("telephone") || "").trim();
  const password = String(formData.get("password") || "");

  if (!nom || !email || !password || password.length < 6) {
    return {
      error:
        "Merci de renseigner un nom, un email et un mot de passe d'au moins 6 caractères.",
    };
  }
  const existing = getUserByEmail(email);
  if (existing) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const passwordHash = await hashPassword(password);
  createUser({
    role: "PROPRIETAIRE",
    nom,
    email,
    telephone,
    passwordHash,
    // En attente de validation par l'administrateur avant de pouvoir se
    // connecter.
    statut: "EN_ATTENTE",
  });

  redirect("/proprietaire/connexion?inscrit=1");
}

export async function loginAdminAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const user = getUserByEmail(email);
  if (!user || user.role !== "ADMIN") {
    return { error: "Identifiants incorrects." };
  }
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return { error: "Identifiants incorrects." };

  await createSessionCookie({ sub: user.id, role: user.role, nom: user.nom });
  redirect("/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  revalidatePath("/");
  redirect("/");
}

export async function changePasswordAction(
  _prev: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const session = await getSession();
  if (!session) {
    return { error: "Session expirée, merci de vous reconnecter." };
  }

  const motDePasseActuel = String(formData.get("motDePasseActuel") || "");
  const nouveauMotDePasse = String(formData.get("nouveauMotDePasse") || "");
  const confirmation = String(formData.get("confirmation") || "");

  if (nouveauMotDePasse.length < 6) {
    return { error: "Le nouveau mot de passe doit contenir au moins 6 caractères." };
  }
  if (nouveauMotDePasse !== confirmation) {
    return { error: "La confirmation ne correspond pas au nouveau mot de passe." };
  }

  const user = getUserById(session.sub);
  if (!user) {
    return { error: "Compte introuvable." };
  }

  const ok = await verifyPassword(motDePasseActuel, user.password_hash);
  if (!ok) {
    return { error: "Le mot de passe actuel est incorrect." };
  }

  const passwordHash = await hashPassword(nouveauMotDePasse);
  setUserPassword(user.id, passwordHash);

  return { success: true };
}

// ---------- Mot de passe oublié (propriétaire) ----------

export async function demanderReinitialisationMotDePasseAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const email = String(formData.get("email") || "").trim();
  if (!email) return { error: "Merci de renseigner votre email." };

  const user = getUserByEmail(email);
  if (!user) {
    return { error: "Aucun compte ne correspond à cet email." };
  }

  const code = regenererCodeReinitialisation(user.id);
  if (!code) return { error: "Compte introuvable." };

  // Aucun fournisseur d'email/SMS n'est encore branché sur Happy Life (voir
  // src/lib/sms.ts) : le code est retourné directement ici pour rester
  // testable dès maintenant.
  return { success: true, userId: user.id, codeTest: code };
}

export async function renvoyerCodeReinitialisationAction(
  userId: string
): Promise<ResetPasswordState> {
  const code = regenererCodeReinitialisation(userId);
  if (!code) return { error: "Compte introuvable." };
  return { success: true, userId, codeTest: code };
}

export async function reinitialiserMotDePasseAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const userId = String(formData.get("userId") || "");
  const code = String(formData.get("code") || "").trim();
  const nouveauMotDePasse = String(formData.get("nouveauMotDePasse") || "");
  const confirmation = String(formData.get("confirmation") || "");

  if (!userId || !code) {
    return { error: "Merci de saisir le code reçu.", userId };
  }
  if (nouveauMotDePasse.length < 6) {
    return { error: "Le nouveau mot de passe doit contenir au moins 6 caractères.", userId };
  }
  if (nouveauMotDePasse !== confirmation) {
    return { error: "La confirmation ne correspond pas au nouveau mot de passe.", userId };
  }

  const passwordHash = await hashPassword(nouveauMotDePasse);
  const resultat = reinitialiserMotDePasseUtilisateur(userId, code, passwordHash);
  if (resultat === "CODE_INCORRECT") return { error: "Code incorrect.", userId };
  if (resultat === "CODE_EXPIRE") {
    return { error: "Ce code a expiré. Demandez-en un nouveau.", userId };
  }

  redirect("/proprietaire/connexion?reinitialise=1");
}

export async function requireSession(role?: "ADMIN" | "PROPRIETAIRE") {
  const session = await getSession();
  if (!session) return null;
  if (role && session.role !== role) return null;
  return session;
}
