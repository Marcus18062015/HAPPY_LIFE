"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { COMMUNAUTE_UPLOADS_DIR, PHOTO_URL_PREFIX } from "@/lib/communityUploads";
import {
  createCommunitySessionCookie,
  clearCommunitySessionCookie,
  getCommunitySession,
} from "@/lib/communityAuth";
import {
  createMember,
  getMemberByContact,
  getMemberById,
  regenererCode,
  verifierCodeMembre,
  reinitialiserMotDePasseMembre,
  createPost,
  getPostById,
  deletePost,
  addComment,
  getOuCreerConversation,
  getConversationById,
  estParticipant,
  envoyerMessage,
  marquerConversationLue,
} from "@/lib/community";
import type { FormState } from "./auth";

export type CommunityAuthState =
  | { error?: string; success?: boolean; membreId?: string; codeTest?: string }
  | undefined;

// ---------- Inscription / vérification / connexion ----------

export async function registerCommunityAction(
  _prev: CommunityAuthState,
  formData: FormData
): Promise<CommunityAuthState> {
  const nom = String(formData.get("nom") || "").trim();
  const typeContact = String(formData.get("typeContact") || "telephone");
  const contact = String(formData.get("contact") || "").trim();
  const password = String(formData.get("password") || "");

  if (!nom || !contact || !password || password.length < 6) {
    return {
      error:
        "Merci de renseigner un nom, un numéro (téléphone ou WhatsApp) ou un email, et un mot de passe d'au moins 6 caractères.",
    };
  }
  if (!["telephone", "whatsapp", "email"].includes(typeContact)) {
    return { error: "Type de contact invalide." };
  }

  const existant = getMemberByContact(contact);
  if (existant) {
    return { error: "Un compte existe déjà avec ce numéro ou cet email. Connectez-vous plutôt." };
  }

  const passwordHash = await hashPassword(password);
  const { membre, code } = createMember({
    nom,
    telephone: typeContact === "telephone" ? contact : undefined,
    whatsapp: typeContact === "whatsapp" ? contact : undefined,
    email: typeContact === "email" ? contact : undefined,
    passwordHash,
  });

  // Aucun fournisseur SMS/WhatsApp n'est encore configuré (voir
  // src/lib/sms.ts) : le code de vérification est retourné directement ici
  // pour que l'inscription reste testable dès maintenant. Dès qu'un
  // fournisseur est branché, remplacer ce retour par un véritable envoi et
  // ne plus renvoyer `codeTest` au client.
  return { success: true, membreId: membre.id, codeTest: code };
}

export async function resendCommunityCodeAction(membreId: string): Promise<CommunityAuthState> {
  const code = regenererCode(membreId);
  if (!code) return { error: "Compte introuvable." };
  return { success: true, membreId, codeTest: code };
}

export async function verifyCommunityCodeAction(
  _prev: CommunityAuthState,
  formData: FormData
): Promise<CommunityAuthState> {
  const membreId = String(formData.get("membreId") || "");
  const code = String(formData.get("code") || "").trim();
  if (!membreId || !code) {
    return { error: "Merci de saisir le code reçu." };
  }

  const resultat = verifierCodeMembre(membreId, code);
  if (resultat === "CODE_INCORRECT") return { error: "Code incorrect.", membreId };
  if (resultat === "CODE_EXPIRE") {
    return { error: "Ce code a expiré. Demandez-en un nouveau.", membreId };
  }

  const membre = getMemberById(membreId);
  if (!membre) return { error: "Compte introuvable." };

  await createCommunitySessionCookie({ sub: membre.id, nom: membre.nom });
  redirect("/communaute?bienvenue=1");
}

export async function loginCommunityAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const contact = String(formData.get("contact") || "").trim();
  const password = String(formData.get("password") || "");

  const membre = getMemberByContact(contact);
  if (!membre) return { error: "Identifiants incorrects." };

  const ok = await verifyPassword(password, membre.password_hash);
  if (!ok) return { error: "Identifiants incorrects." };

  if (!membre.verifie) {
    redirect(`/communaute/inscription/verification?membreId=${membre.id}`);
  }

  await createCommunitySessionCookie({ sub: membre.id, nom: membre.nom });
  redirect("/communaute");
}

// ---------- Mot de passe oublié ----------

export async function demanderReinitialisationCommunityAction(
  _prev: CommunityAuthState,
  formData: FormData
): Promise<CommunityAuthState> {
  const contact = String(formData.get("contact") || "").trim();
  if (!contact) return { error: "Merci de renseigner votre téléphone, WhatsApp ou email." };

  const membre = getMemberByContact(contact);
  if (!membre) {
    return { error: "Aucun compte communauté ne correspond à ce contact." };
  }

  const code = regenererCode(membre.id);
  if (!code) return { error: "Compte introuvable." };

  // Même logique que pour l'inscription : aucun fournisseur SMS/WhatsApp
  // n'est encore branché, le code est donc retourné directement ici pour
  // rester testable dès maintenant (voir src/lib/sms.ts).
  return { success: true, membreId: membre.id, codeTest: code };
}

export async function reinitialiserMotDePasseCommunityAction(
  _prev: CommunityAuthState,
  formData: FormData
): Promise<CommunityAuthState> {
  const membreId = String(formData.get("membreId") || "");
  const code = String(formData.get("code") || "").trim();
  const nouveauMotDePasse = String(formData.get("nouveauMotDePasse") || "");
  const confirmation = String(formData.get("confirmation") || "");

  if (!membreId || !code) {
    return { error: "Merci de saisir le code reçu.", membreId };
  }
  if (nouveauMotDePasse.length < 6) {
    return {
      error: "Le nouveau mot de passe doit contenir au moins 6 caractères.",
      membreId,
    };
  }
  if (nouveauMotDePasse !== confirmation) {
    return { error: "La confirmation ne correspond pas au nouveau mot de passe.", membreId };
  }

  const passwordHash = await hashPassword(nouveauMotDePasse);
  const resultat = reinitialiserMotDePasseMembre(membreId, code, passwordHash);
  if (resultat === "CODE_INCORRECT") return { error: "Code incorrect.", membreId };
  if (resultat === "CODE_EXPIRE") {
    return { error: "Ce code a expiré. Demandez-en un nouveau.", membreId };
  }

  redirect("/communaute/connexion?reinitialise=1");
}

export async function logoutCommunityAction() {
  await clearCommunitySessionCookie();
  revalidatePath("/communaute");
  redirect("/communaute");
}

// ---------- Mur communautaire ----------

export async function createPostAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getCommunitySession();
  if (!session) {
    return { error: "Vous devez être connecté à l'espace communauté." };
  }

  const legende = String(formData.get("legende") || "").trim();
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Merci de choisir une photo à publier." };
  }

  const dir = path.join(COMMUNAUTE_UPLOADS_DIR, session.sub);
  await fs.mkdir(dir, { recursive: true });
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);

  createPost({
    auteurId: session.sub,
    photo: `${PHOTO_URL_PREFIX}${session.sub}/${filename}`,
    legende,
  });

  revalidatePath("/communaute");
  redirect("/communaute?publie=1");
}

export async function deletePostAction(postId: string) {
  const session = await getCommunitySession();
  if (!session) return;
  const post = getPostById(postId);
  const supprime = deletePost(postId, session.sub);
  if (supprime && post) {
    const relatif = post.photo.startsWith(PHOTO_URL_PREFIX)
      ? post.photo.slice(PHOTO_URL_PREFIX.length)
      : null;
    if (relatif) {
      try {
        await fs.unlink(path.join(COMMUNAUTE_UPLOADS_DIR, relatif));
      } catch {
        // fichier déjà absent, on ignore
      }
    }
  }
  revalidatePath("/communaute");
}

export async function addCommentAction(
  postId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getCommunitySession();
  if (!session) {
    return { error: "Vous devez être connecté à l'espace communauté pour commenter." };
  }
  const texte = String(formData.get("texte") || "").trim();
  if (!texte) return { error: "Le commentaire ne peut pas être vide." };

  addComment({ postId, auteurId: session.sub, texte });
  revalidatePath("/communaute");
  revalidatePath(`/communaute/${postId}`);
}

// ---------- Messagerie privée ----------

export async function startConversationAction(autreMembreId: string) {
  const session = await getCommunitySession();
  if (!session) redirect("/communaute/connexion");
  if (autreMembreId === session.sub) redirect("/communaute");

  const conversation = getOuCreerConversation(session.sub, autreMembreId);
  redirect(`/communaute/messages/${conversation.id}`);
}

export async function sendMessageAction(
  conversationId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getCommunitySession();
  if (!session) return { error: "Session expirée, merci de vous reconnecter." };

  const conversation = getConversationById(conversationId);
  if (!conversation || !estParticipant(conversation, session.sub)) {
    return { error: "Conversation introuvable." };
  }

  const texte = String(formData.get("texte") || "").trim();
  if (!texte) return undefined;

  envoyerMessage({ conversationId, expediteurId: session.sub, texte });
  revalidatePath(`/communaute/messages/${conversationId}`);
  revalidatePath("/communaute/messages");
}

export async function marquerLuAction(conversationId: string) {
  const session = await getCommunitySession();
  if (!session) return;
  const conversation = getConversationById(conversationId);
  if (!conversation || !estParticipant(conversation, session.sub)) return;
  marquerConversationLue(conversationId, session.sub);
  revalidatePath("/communaute/messages");
}
