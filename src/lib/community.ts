import "server-only";
import { randomUUID, randomInt } from "node:crypto";
import { db } from "./db";
import type {
  CommunityMemberRecord,
  CommunityMemberPublicProfile,
  CommunityPostRecord,
  CommunityPost,
  CommunityCommentRecord,
  CommunityComment,
  CommunityConversationRecord,
  CommunityConversation,
  CommunityMessageRecord,
} from "./types";

// Durée de validité du code de vérification envoyé à l'inscription (ou lors
// d'un renvoi) avant qu'il ne faille en redemander un nouveau.
const CODE_VALIDITE_MINUTES = 15;

function genererCode(): string {
  // 6 chiffres, avec zéros non significatifs conservés (ex: "042817").
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function toPublicProfile(m: CommunityMemberRecord | null): CommunityMemberPublicProfile | null {
  if (!m) return null;
  return { id: m.id, nom: m.nom, avatar: m.avatar, created_at: m.created_at };
}

// ---------- Membres ----------

export function getMemberByContact(contact: string): CommunityMemberRecord | null {
  const valeur = contact.trim();
  if (!valeur) return null;
  return (
    (db
      .prepare(
        `SELECT * FROM community_members
         WHERE telephone = ? OR whatsapp = ? OR email = ?`
      )
      .get(valeur, valeur, valeur) as unknown as CommunityMemberRecord | undefined) ?? null
  );
}

export function getMemberById(id: string): CommunityMemberRecord | null {
  return (
    (db.prepare(`SELECT * FROM community_members WHERE id = ?`).get(id) as unknown as
      | CommunityMemberRecord
      | undefined) ?? null
  );
}

export function createMember(input: {
  nom: string;
  telephone?: string;
  whatsapp?: string;
  email?: string;
  passwordHash: string;
}): { membre: CommunityMemberRecord; code: string } {
  const id = randomUUID();
  const code = genererCode();
  const expire = new Date(Date.now() + CODE_VALIDITE_MINUTES * 60_000).toISOString();

  db.prepare(
    `INSERT INTO community_members
       (id, nom, telephone, whatsapp, email, password_hash, verifie, code_verification, code_expire_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`
  ).run(
    id,
    input.nom,
    input.telephone || null,
    input.whatsapp || null,
    input.email || null,
    input.passwordHash,
    code,
    expire
  );

  const membre = getMemberById(id)!;
  return { membre, code };
}

export function regenererCode(id: string): string | null {
  const membre = getMemberById(id);
  if (!membre) return null;
  const code = genererCode();
  const expire = new Date(Date.now() + CODE_VALIDITE_MINUTES * 60_000).toISOString();
  db.prepare(
    `UPDATE community_members SET code_verification = ?, code_expire_at = ? WHERE id = ?`
  ).run(code, expire, id);
  return code;
}

export type VerificationResultat = "OK" | "CODE_INCORRECT" | "CODE_EXPIRE" | "DEJA_VERIFIE";

export function verifierCodeMembre(id: string, code: string): VerificationResultat {
  const membre = getMemberById(id);
  if (!membre) return "CODE_INCORRECT";
  if (membre.verifie) return "DEJA_VERIFIE";
  if (!membre.code_verification || membre.code_verification !== code.trim()) {
    return "CODE_INCORRECT";
  }
  if (!membre.code_expire_at || new Date(membre.code_expire_at).getTime() < Date.now()) {
    return "CODE_EXPIRE";
  }
  db.prepare(
    `UPDATE community_members SET verifie = 1, code_verification = NULL, code_expire_at = NULL WHERE id = ?`
  ).run(id);
  return "OK";
}

export function setMemberAvatar(id: string, avatar: string) {
  db.prepare(`UPDATE community_members SET avatar = ? WHERE id = ?`).run(avatar, id);
}

// "Mot de passe oublié" : réutilise volontairement les mêmes colonnes
// (code_verification / code_expire_at) que la vérification d'inscription —
// `regenererCode` ci-dessus génère déjà un nouveau code sur ces colonnes,
// quel que soit l'état "verifie" du membre. Il suffit ici de vérifier ce
// code puis de remplacer le mot de passe au lieu de marquer le compte
// vérifié.
export function reinitialiserMotDePasseMembre(
  id: string,
  code: string,
  nouveauPasswordHash: string
): VerificationResultat {
  const membre = getMemberById(id);
  if (!membre) return "CODE_INCORRECT";
  if (!membre.code_verification || membre.code_verification !== code.trim()) {
    return "CODE_INCORRECT";
  }
  if (!membre.code_expire_at || new Date(membre.code_expire_at).getTime() < Date.now()) {
    return "CODE_EXPIRE";
  }
  db.prepare(
    `UPDATE community_members
     SET password_hash = ?, code_verification = NULL, code_expire_at = NULL
     WHERE id = ?`
  ).run(nouveauPasswordHash, id);
  return "OK";
}

// ---------- Mur communautaire ----------

function hydratePost(r: CommunityPostRecord): CommunityPost {
  const auteur = toPublicProfile(getMemberById(r.auteur_id));
  const { count } = db
    .prepare(`SELECT COUNT(*) as count FROM community_comments WHERE post_id = ?`)
    .get(r.id) as { count: number };
  return { ...r, auteur, nbCommentaires: count };
}

export function createPost(input: { auteurId: string; photo: string; legende?: string }): CommunityPost {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO community_posts (id, auteur_id, photo, legende) VALUES (?, ?, ?, ?)`
  ).run(id, input.auteurId, input.photo, input.legende?.trim() || "");
  return hydratePost(getPostById(id)!);
}

export function getPostById(id: string): CommunityPostRecord | null {
  return (
    (db.prepare(`SELECT * FROM community_posts WHERE id = ?`).get(id) as unknown as
      | CommunityPostRecord
      | undefined) ?? null
  );
}

export function listPosts(limit = 60): CommunityPost[] {
  const rows = db
    .prepare(`SELECT * FROM community_posts ORDER BY created_at DESC LIMIT ?`)
    .all(limit) as unknown as CommunityPostRecord[];
  return rows.map(hydratePost);
}

export function listPostsByAuteur(auteurId: string): CommunityPost[] {
  const rows = db
    .prepare(`SELECT * FROM community_posts WHERE auteur_id = ? ORDER BY created_at DESC`)
    .all(auteurId) as unknown as CommunityPostRecord[];
  return rows.map(hydratePost);
}

export function deletePost(id: string, auteurId: string): boolean {
  const res = db
    .prepare(`DELETE FROM community_posts WHERE id = ? AND auteur_id = ?`)
    .run(id, auteurId);
  return res.changes > 0;
}

// ---------- Commentaires ----------

function hydrateComment(r: CommunityCommentRecord): CommunityComment {
  return { ...r, auteur: toPublicProfile(getMemberById(r.auteur_id)) };
}

export function addComment(input: { postId: string; auteurId: string; texte: string }): CommunityComment {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO community_comments (id, post_id, auteur_id, texte) VALUES (?, ?, ?, ?)`
  ).run(id, input.postId, input.auteurId, input.texte.trim());
  const row = db
    .prepare(`SELECT * FROM community_comments WHERE id = ?`)
    .get(id) as unknown as CommunityCommentRecord;
  return hydrateComment(row);
}

export function listComments(postId: string): CommunityComment[] {
  const rows = db
    .prepare(`SELECT * FROM community_comments WHERE post_id = ? ORDER BY created_at ASC`)
    .all(postId) as unknown as CommunityCommentRecord[];
  return rows.map(hydrateComment);
}

// ---------- Messagerie privée ----------

// Ordre canonique (id le plus petit en premier) pour qu'une seule ligne
// existe par paire de membres, quel que soit l'ordre d'appel.
function ordonner(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export function getOuCreerConversation(membreAId: string, membreBId: string): CommunityConversationRecord {
  const [membre1, membre2] = ordonner(membreAId, membreBId);
  const existante = db
    .prepare(`SELECT * FROM community_conversations WHERE membre_1_id = ? AND membre_2_id = ?`)
    .get(membre1, membre2) as unknown as CommunityConversationRecord | undefined;
  if (existante) return existante;

  const id = randomUUID();
  db.prepare(
    `INSERT INTO community_conversations (id, membre_1_id, membre_2_id) VALUES (?, ?, ?)`
  ).run(id, membre1, membre2);
  return db
    .prepare(`SELECT * FROM community_conversations WHERE id = ?`)
    .get(id) as unknown as CommunityConversationRecord;
}

export function getConversationById(id: string): CommunityConversationRecord | null {
  return (
    (db.prepare(`SELECT * FROM community_conversations WHERE id = ?`).get(id) as unknown as
      | CommunityConversationRecord
      | undefined) ?? null
  );
}

// Vérifie que `membreId` fait bien partie de la conversation — à appeler
// avant toute lecture/écriture pour ne jamais exposer les messages d'un
// autre binôme.
export function estParticipant(conversation: CommunityConversationRecord, membreId: string): boolean {
  return conversation.membre_1_id === membreId || conversation.membre_2_id === membreId;
}

export function listConversationsForMember(membreId: string): CommunityConversation[] {
  const rows = db
    .prepare(
      `SELECT * FROM community_conversations WHERE membre_1_id = ? OR membre_2_id = ?
       ORDER BY created_at DESC`
    )
    .all(membreId, membreId) as unknown as CommunityConversationRecord[];

  return rows.map((conv) => {
    const autreId = conv.membre_1_id === membreId ? conv.membre_2_id : conv.membre_1_id;
    const dernierMessage =
      (db
        .prepare(
          `SELECT * FROM community_messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1`
        )
        .get(conv.id) as unknown as CommunityMessageRecord | undefined) ?? null;
    const { count } = db
      .prepare(
        `SELECT COUNT(*) as count FROM community_messages
         WHERE conversation_id = ? AND expediteur_id != ? AND lu = 0`
      )
      .get(conv.id, membreId) as { count: number };
    return {
      ...conv,
      autreMembre: toPublicProfile(getMemberById(autreId)),
      dernierMessage,
      nonLus: count,
    };
  });
}

export function envoyerMessage(input: {
  conversationId: string;
  expediteurId: string;
  texte: string;
}): CommunityMessageRecord {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO community_messages (id, conversation_id, expediteur_id, texte) VALUES (?, ?, ?, ?)`
  ).run(id, input.conversationId, input.expediteurId, input.texte.trim());
  return db
    .prepare(`SELECT * FROM community_messages WHERE id = ?`)
    .get(id) as unknown as CommunityMessageRecord;
}

export function listMessages(conversationId: string): CommunityMessageRecord[] {
  return db
    .prepare(`SELECT * FROM community_messages WHERE conversation_id = ? ORDER BY created_at ASC`)
    .all(conversationId) as unknown as CommunityMessageRecord[];
}

export function marquerConversationLue(conversationId: string, lecteurId: string) {
  db.prepare(
    `UPDATE community_messages SET lu = 1
     WHERE conversation_id = ? AND expediteur_id != ? AND lu = 0`
  ).run(conversationId, lecteurId);
}

export { toPublicProfile };
