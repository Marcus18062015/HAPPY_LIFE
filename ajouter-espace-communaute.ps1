$ErrorActionPreference = "Stop"

$racine = $PSScriptRoot
if (-not (Test-Path (Join-Path $racine "package.json"))) {
    $racine = "C:\Users\Marc\Desktop\Fichiers\HAPPY_PISCINE\HAPPY_LIFE"
}

Write-Host "=================================================="
Write-Host "Dossier utilise comme racine du projet :"
Write-Host "  $racine"
Write-Host "=================================================="
Write-Host ""

if (-not (Test-Path (Join-Path $racine "package.json"))) {
    Write-Host "ERREUR : impossible de trouver package.json dans ce dossier." -ForegroundColor Red
    Write-Host "Ce script doit etre lance depuis (ou copie dans) le dossier HAPPY_LIFE."
    exit 1
}

$resultats = @{}

function Ecrire-Fichier {
    param(
        [string]$CheminRelatif,
        [string]$Contenu,
        [string]$SignatureAttendue
    )

    $chemin = Join-Path $racine $CheminRelatif
    $dossier = Split-Path -Path $chemin -Parent

    if (-not (Test-Path -LiteralPath $dossier)) {
        New-Item -ItemType Directory -LiteralPath $dossier -Force | Out-Null
    }

    if (Test-Path -LiteralPath $chemin) {
        try {
            $item = Get-Item -LiteralPath $chemin -Force
            if ($item.IsReadOnly) {
                Set-ItemProperty -LiteralPath $chemin -Name IsReadOnly -Value $false
            }
        } catch {
            Write-Host "   Avertissement attributs : $_" -ForegroundColor Yellow
        }
    }

    Write-Host "-> $CheminRelatif"
    try {
        Set-Content -LiteralPath $chemin -Value $Contenu -Encoding UTF8 -Force
    } catch {
        Write-Host "   *** ECHEC DE L'ECRITURE : $_" -ForegroundColor Red
        Write-Host "   (le fichier est peut-etre ouvert dans un autre programme - fermez-le et relancez le script)" -ForegroundColor Red
        return $false
    }

    Start-Sleep -Milliseconds 120
    $verif = Get-Content -LiteralPath $chemin -Raw -ErrorAction SilentlyContinue
    if ($verif -and $verif.Contains($SignatureAttendue)) {
        Write-Host "   OK" -ForegroundColor Green
        return $true
    } else {
        Write-Host "   *** ECHEC DE LA VERIFICATION." -ForegroundColor Red
        return $false
    }
}

$f0 = @'
import "server-only";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

// Happy Life utilise une base SQLite embarquée (module natif node:sqlite,
// disponible depuis Node 22) : aucune dépendance externe, aucun compte cloud
// à créer, le fichier de données est autonome et portable.

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "happy-life.db");

declare global {
  var __happyLifeDb: DatabaseSync | undefined;
}

function createConnection(): DatabaseSync {
  const database = new DatabaseSync(DB_PATH);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  return database;
}

export const db: DatabaseSync = global.__happyLifeDb ?? createConnection();
if (process.env.NODE_ENV !== "production") global.__happyLifeDb = db;

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL CHECK (role IN ('ADMIN','PROPRIETAIRE')),
      nom TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telephone TEXT,
      password_hash TEXT NOT NULL,
      statut TEXT NOT NULL DEFAULT 'ACTIF' CHECK (statut IN ('EN_ATTENTE','ACTIF','SUSPENDU')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fiches (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('PISCINE','APPARTEMENT')),
      titre TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      zone TEXT NOT NULL,
      quartier TEXT,
      tarif_indicatif TEXT,
      equipements TEXT NOT NULL DEFAULT '[]',
      photos TEXT NOT NULL DEFAULT '[]',
      disponibilite TEXT NOT NULL DEFAULT '',
      statut_validation TEXT NOT NULL DEFAULT 'EN_ATTENTE' CHECK (statut_validation IN ('EN_ATTENTE','VALIDEE','REFUSEE')),
      motif_refus TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS evenements (
      id TEXT PRIMARY KEY,
      titre TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      lieu TEXT NOT NULL,
      date_evenement TEXT NOT NULL,
      image TEXT,
      prix_info TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS demandes (
      id TEXT PRIMARY KEY,
      fiche_id TEXT REFERENCES fiches(id) ON DELETE CASCADE,
      evenement_id TEXT REFERENCES evenements(id) ON DELETE CASCADE,
      visiteur_id TEXT,
      nom TEXT NOT NULL,
      telephone TEXT NOT NULL,
      email TEXT,
      message TEXT NOT NULL DEFAULT '',
      statut TEXT NOT NULL DEFAULT 'NOUVELLE' CHECK (statut IN ('NOUVELLE','TRAITEE')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      CHECK (fiche_id IS NOT NULL OR evenement_id IS NOT NULL)
    );

    CREATE TABLE IF NOT EXISTS avis (
      id TEXT PRIMARY KEY,
      fiche_id TEXT NOT NULL REFERENCES fiches(id) ON DELETE CASCADE,
      auteur_nom TEXT NOT NULL,
      note INTEGER NOT NULL CHECK (note BETWEEN 1 AND 5),
      commentaire TEXT NOT NULL DEFAULT '',
      statut TEXT NOT NULL DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE','VALIDEE','REFUSEE')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS favoris (
      id TEXT PRIMARY KEY,
      visiteur_id TEXT NOT NULL,
      fiche_id TEXT NOT NULL REFERENCES fiches(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (visiteur_id, fiche_id)
    );

    CREATE TABLE IF NOT EXISTS favoris_proprietaires (
      id TEXT PRIMARY KEY,
      visiteur_id TEXT NOT NULL,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (visiteur_id, owner_id)
    );

    CREATE TABLE IF NOT EXISTS promotions (
      id TEXT PRIMARY KEY,
      fiche_id TEXT NOT NULL REFERENCES fiches(id) ON DELETE CASCADE,
      titre TEXT NOT NULL,
      badge TEXT NOT NULL DEFAULT '',
      reduction_pct INTEGER NOT NULL,
      prix_original TEXT,
      prix_promo TEXT,
      date_debut TEXT,
      date_fin TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS abonnes (
      id TEXT PRIMARY KEY,
      email TEXT,
      telephone TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      CHECK (email IS NOT NULL OR telephone IS NOT NULL)
    );

    CREATE TABLE IF NOT EXISTS publicites (
      id TEXT PRIMARY KEY,
      titre TEXT NOT NULL,
      annonceur TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      image TEXT,
      lien TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Abonnement payant des propriétaires (demande explicite de
    -- l'utilisateur : 10 000 FCFA / mois, -5% sur 3 mois, -8% sur 6 mois,
    -- -10% sur 12 mois). Auto-déclaré par le propriétaire lui-même — pas de
    -- vraie passerelle de paiement branchée, voir src/lib/actions/abonnement.ts.
    -- Une ligne par période souscrite : l'abonnement "actif" est celui dont
    -- date_fin est la plus lointaine et >= maintenant.
    CREATE TABLE IF NOT EXISTS abonnements_proprietaires (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      duree_mois INTEGER NOT NULL,
      montant INTEGER NOT NULL,
      moyen_paiement TEXT NOT NULL,
      reference_paiement TEXT NOT NULL DEFAULT '',
      date_debut TEXT NOT NULL,
      date_fin TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (owner_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_fiches_owner ON fiches(owner_id);
    CREATE INDEX IF NOT EXISTS idx_abonnements_owner ON abonnements_proprietaires(owner_id);
    CREATE INDEX IF NOT EXISTS idx_demandes_fiche ON demandes(fiche_id);
    CREATE INDEX IF NOT EXISTS idx_demandes_evenement ON demandes(evenement_id);
    CREATE INDEX IF NOT EXISTS idx_demandes_visiteur ON demandes(visiteur_id);
    CREATE INDEX IF NOT EXISTS idx_avis_fiche ON avis(fiche_id);
    CREATE INDEX IF NOT EXISTS idx_favoris_visiteur ON favoris(visiteur_id);
    CREATE INDEX IF NOT EXISTS idx_favoris_proprietaires_visiteur ON favoris_proprietaires(visiteur_id);
    CREATE INDEX IF NOT EXISTS idx_favoris_proprietaires_owner ON favoris_proprietaires(owner_id);
    CREATE INDEX IF NOT EXISTS idx_promotions_fiche ON promotions(fiche_id);

    -- Espace communautaire : les clients s'inscrivent séparément des comptes
    -- propriétaire/admin (téléphone, WhatsApp ou email + mot de passe),
    -- confirment leur compte avec un code à usage unique, puis peuvent
    -- publier des photos sur un mur commun (commentaires publics) et
    -- s'écrire en privé. Tant qu'aucun fournisseur SMS/WhatsApp n'est
    -- configuré (voir src/lib/sms.ts), le code de vérification est affiché
    -- directement à l'écran au lieu d'être réellement envoyé — voir
    -- src/lib/actions/community.ts.
    CREATE TABLE IF NOT EXISTS community_members (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      telephone TEXT,
      whatsapp TEXT,
      email TEXT,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      verifie INTEGER NOT NULL DEFAULT 0,
      code_verification TEXT,
      code_expire_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      CHECK (telephone IS NOT NULL OR whatsapp IS NOT NULL OR email IS NOT NULL)
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_community_members_telephone
      ON community_members(telephone) WHERE telephone IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_community_members_whatsapp
      ON community_members(whatsapp) WHERE whatsapp IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_community_members_email
      ON community_members(email) WHERE email IS NOT NULL;

    -- Mur communautaire : une publication = une photo (le filigrane Happy
    -- Life n'est jamais appliqué à ce fichier d'origine, seulement à la
    -- copie générée à la volée quand un membre la partage vers l'extérieur,
    -- voir src/app/api/communaute/partage/[postId]/route.ts).
    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      auteur_id TEXT NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
      photo TEXT NOT NULL,
      legende TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS community_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
      auteur_id TEXT NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
      texte TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Messagerie privée 1-à-1. membre_1_id est toujours l'id le plus petit
    -- des deux (ordre canonique appliqué dans src/lib/community.ts) pour
    -- garantir qu'une seule conversation existe par paire de membres.
    CREATE TABLE IF NOT EXISTS community_conversations (
      id TEXT PRIMARY KEY,
      membre_1_id TEXT NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
      membre_2_id TEXT NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (membre_1_id, membre_2_id)
    );

    CREATE TABLE IF NOT EXISTS community_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES community_conversations(id) ON DELETE CASCADE,
      expediteur_id TEXT NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
      texte TEXT NOT NULL,
      lu INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_community_posts_auteur ON community_posts(auteur_id);
    CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at);
    CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_community_conversations_membre1 ON community_conversations(membre_1_id);
    CREATE INDEX IF NOT EXISTS idx_community_conversations_membre2 ON community_conversations(membre_2_id);
    CREATE INDEX IF NOT EXISTS idx_community_messages_conversation ON community_messages(conversation_id);
  `);
}

initSchema();

'@

$f1 = @'
export type Role = "ADMIN" | "PROPRIETAIRE";
export type StatutCompte = "EN_ATTENTE" | "ACTIF" | "SUSPENDU";
export type TypeFiche = "PISCINE" | "APPARTEMENT";
export type StatutValidation = "EN_ATTENTE" | "VALIDEE" | "REFUSEE";
export type StatutDemande = "NOUVELLE" | "TRAITEE";
export type StatutAvis = "EN_ATTENTE" | "VALIDEE" | "REFUSEE";

export interface UserRecord {
  id: string;
  role: Role;
  nom: string;
  email: string;
  telephone: string | null;
  password_hash: string;
  statut: StatutCompte;
  created_at: string;
}

export interface FicheRecord {
  id: string;
  owner_id: string;
  type: TypeFiche;
  titre: string;
  description: string;
  zone: string;
  quartier: string | null;
  tarif_indicatif: string | null;
  equipements: string; // JSON string[]
  photos: string; // JSON string[]
  disponibilite: string;
  statut_validation: StatutValidation;
  motif_refus: string | null;
  active: number; // 0 | 1
  created_at: string;
  updated_at: string;
}

export interface DemandeRecord {
  id: string;
  fiche_id: string | null;
  evenement_id: string | null;
  visiteur_id: string | null;
  nom: string;
  telephone: string;
  email: string | null;
  message: string;
  statut: StatutDemande;
  created_at: string;
}

export interface AvisRecord {
  id: string;
  fiche_id: string;
  auteur_nom: string;
  note: number;
  commentaire: string;
  statut: StatutAvis;
  created_at: string;
}

export interface FavoriRecord {
  id: string;
  visiteur_id: string;
  fiche_id: string;
  created_at: string;
}

export interface FavoriProprietaireRecord {
  id: string;
  visiteur_id: string;
  owner_id: string;
  created_at: string;
}

// Sous-ensemble sûr d'un UserRecord pour l'affichage public (vitrine
// propriétaire) — ne contient jamais le téléphone, l'email ni le hash de
// mot de passe (voir section 10 du cahier des charges : ces informations
// ne transitent jamais vers le public).
export interface OwnerPublicProfile {
  id: string;
  nom: string;
  created_at: string;
}

export interface PromotionRecord {
  id: string;
  fiche_id: string;
  titre: string;
  badge: string;
  reduction_pct: number;
  prix_original: string | null;
  prix_promo: string | null;
  date_debut: string | null;
  date_fin: string | null;
  active: number; // 0 | 1
  created_at: string;
}

export interface AbonneRecord {
  id: string;
  email: string | null;
  telephone: string | null;
  created_at: string;
}

export interface PubliciteRecord {
  id: string;
  titre: string;
  annonceur: string;
  description: string;
  image: string | null;
  lien: string | null;
  active: number; // 0 | 1
  created_at: string;
}

export interface EvenementRecord {
  id: string;
  titre: string;
  description: string;
  lieu: string;
  date_evenement: string;
  image: string | null;
  prix_info: string | null;
  active: number; // 0 | 1
  created_at: string;
}

export interface AbonnementProprietaireRecord {
  id: string;
  owner_id: string;
  duree_mois: number;
  montant: number;
  moyen_paiement: string;
  reference_paiement: string;
  date_debut: string;
  date_fin: string;
  created_at: string;
}

// État calculé de l'abonnement d'un propriétaire (dernière période
// souscrite, ou absence d'abonnement). Utilisé pour le bandeau de rappel et
// l'affichage admin.
export interface AbonnementStatut {
  abonnement: AbonnementProprietaireRecord | null;
  valide: boolean;
  joursRestants: number; // négatif si expiré
}

export interface Fiche extends Omit<FicheRecord, "equipements" | "photos" | "active"> {
  equipements: string[];
  photos: string[];
  active: boolean;
}

export function toFiche(r: FicheRecord): Fiche {
  return {
    ...r,
    equipements: JSON.parse(r.equipements || "[]"),
    photos: JSON.parse(r.photos || "[]"),
    active: !!r.active,
  };
}

// ---------- Espace communautaire ----------

export interface CommunityMemberRecord {
  id: string;
  nom: string;
  telephone: string | null;
  whatsapp: string | null;
  email: string | null;
  password_hash: string;
  avatar: string | null;
  verifie: number; // 0 | 1
  code_verification: string | null;
  code_expire_at: string | null;
  created_at: string;
}

// Profil public d'un membre — jamais le téléphone/WhatsApp/email/mot de
// passe, mêmes règles de confidentialité que OwnerPublicProfile.
export interface CommunityMemberPublicProfile {
  id: string;
  nom: string;
  avatar: string | null;
  created_at: string;
}

export interface CommunityPostRecord {
  id: string;
  auteur_id: string;
  photo: string;
  legende: string;
  created_at: string;
}

export interface CommunityPost extends CommunityPostRecord {
  auteur: CommunityMemberPublicProfile | null;
  nbCommentaires: number;
}

export interface CommunityCommentRecord {
  id: string;
  post_id: string;
  auteur_id: string;
  texte: string;
  created_at: string;
}

export interface CommunityComment extends CommunityCommentRecord {
  auteur: CommunityMemberPublicProfile | null;
}

export interface CommunityConversationRecord {
  id: string;
  membre_1_id: string;
  membre_2_id: string;
  created_at: string;
}

export interface CommunityConversation extends CommunityConversationRecord {
  autreMembre: CommunityMemberPublicProfile | null;
  dernierMessage: CommunityMessageRecord | null;
  nonLus: number;
}

export interface CommunityMessageRecord {
  id: string;
  conversation_id: string;
  expediteur_id: string;
  texte: string;
  lu: number; // 0 | 1
  created_at: string;
}

'@

$f2 = @'
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

'@

$f3 = @'
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Session de l'espace communautaire — volontairement séparée du cookie
// admin/propriétaire (src/lib/auth.ts) : un client de la communauté n'a
// jamais accès aux espaces admin/propriétaire, et inversement.
const COOKIE_NAME = "happy_life_communaute_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me-happy-life"
);

export interface CommunitySessionPayload {
  sub: string; // id du membre
  nom: string;
  [key: string]: unknown;
}

export async function createCommunitySessionCookie(payload: CommunitySessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCommunitySessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCommunitySession(): Promise<CommunitySessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as CommunitySessionPayload;
  } catch {
    return null;
  }
}

'@

$f4 = @'
import "server-only";
import path from "node:path";

// Dossier de stockage des photos du mur communautaire — volontairement HORS
// de `public/` : sur cette version de Next.js, `next start` ne sert que les
// fichiers présents dans `public/` au moment du `next build`, un fichier
// ajouté après coup (upload utilisateur) renvoie 404 tant qu'un nouveau
// build n'a pas eu lieu. Les fichiers stockés ici sont donc servis par un
// gestionnaire de route qui lit le disque à chaque requête, voir
// src/app/api/communaute/photo/[...segments]/route.ts.
export const COMMUNAUTE_UPLOADS_DIR = path.join(process.cwd(), "data", "uploads", "communaute");

export const PHOTO_URL_PREFIX = "/api/communaute/photo/";

'@

$f5 = @'
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

'@

$f6 = @'
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { COMMUNAUTE_UPLOADS_DIR } from "@/lib/communityUploads";

// Sert les photos du mur communautaire depuis un dossier hors de `public/`
// (voir src/lib/communityUploads.ts pour l'explication) : un gestionnaire de
// route comme celui-ci exécute du code à chaque requête et lit donc toujours
// l'état réel du disque, contrairement au dossier `public/`.

const MIME_PAR_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ segments: string[] }> }
) {
  const { segments } = await params;

  // Refuse toute tentative de remonter hors du dossier (ex: "..") avant de
  // toucher le système de fichiers.
  if (segments.some((s) => s.includes("..") || s.includes("/") || s.includes("\\"))) {
    return NextResponse.json({ error: "Chemin invalide." }, { status: 400 });
  }

  const filePath = path.join(COMMUNAUTE_UPLOADS_DIR, ...segments);
  let buffer: Buffer;
  try {
    buffer = await fs.readFile(filePath);
  } catch {
    return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
  }

  const ext = (segments[segments.length - 1]?.split(".").pop() || "").toLowerCase();
  const contentType = MIME_PAR_EXTENSION[ext] || "application/octet-stream";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      // Le nom de fichier est un UUID généré à l'upload : son contenu ne
      // change jamais une fois écrit, la mise en cache longue durée est donc
      // sûre (une suppression de publication rendra simplement l'URL 404).
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

'@

$f7 = @'
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getPostById } from "@/lib/community";
import { COMMUNAUTE_UPLOADS_DIR, PHOTO_URL_PREFIX } from "@/lib/communityUploads";

// Génère à la volée une copie de la photo d'une publication communautaire
// avec le logo Happy Life en filigrane — appelée uniquement au moment où un
// membre partage la photo en dehors de l'application (bouton "Partager").
// La photo d'origine stockée sur le mur (public/uploads/communaute/...)
// n'est elle-même JAMAIS modifiée : le filigrane n'existe que sur cette
// copie générée ici, à chaque appel.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const post = getPostById(postId);
  if (!post) {
    return NextResponse.json({ error: "Publication introuvable." }, { status: 404 });
  }

  if (!post.photo.startsWith(PHOTO_URL_PREFIX)) {
    return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
  }
  const relatif = post.photo.slice(PHOTO_URL_PREFIX.length);
  const photoPath = path.join(COMMUNAUTE_UPLOADS_DIR, relatif);
  let baseBuffer: Buffer;
  try {
    baseBuffer = await fs.readFile(photoPath);
  } catch {
    return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
  }

  const base = sharp(baseBuffer).rotate(); // .rotate() sans argument : applique l'orientation EXIF puis la retire
  const { width = 1080, height = 1080 } = await base.metadata();

  // Le logo occupe environ 16% de la largeur de la photo, avec un minimum
  // et un maximum lisibles quelle que soit la taille d'origine.
  const logoWidth = Math.max(72, Math.min(240, Math.round(width * 0.16)));
  const logoPath = path.join(process.cwd(), "public", "brand", "logo-mark.png");
  const logoResized = await sharp(logoPath)
    .resize({ width: logoWidth })
    .toBuffer({ resolveWithObject: true });
  const logoHeight = logoResized.info.height;

  const margin = Math.round(width * 0.035);
  const left = Math.max(0, width - logoWidth - margin);
  const top = Math.max(0, height - logoHeight - margin);

  // Plaque semi-transparente derrière le logo pour qu'il reste lisible sur
  // n'importe quelle photo (claire ou foncée).
  const padding = Math.round(logoWidth * 0.18);
  const plaqueSvg = Buffer.from(
    `<svg width="${logoWidth + padding * 2}" height="${logoHeight + padding * 2}" xmlns="http://www.w3.org/2000/svg">
       <rect x="0" y="0" width="${logoWidth + padding * 2}" height="${logoHeight + padding * 2}"
             rx="${Math.round(padding * 1.1)}" fill="rgba(4,20,28,0.45)" />
     </svg>`
  );

  const composite = await base
    .composite([
      {
        input: plaqueSvg,
        left: Math.max(0, left - padding),
        top: Math.max(0, top - padding),
      },
      { input: logoResized.data, left, top },
    ])
    .jpeg({ quality: 88 })
    .toBuffer();

  return new NextResponse(new Uint8Array(composite), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `inline; filename="happy-life-${postId}.jpg"`,
      "Cache-Control": "no-store",
    },
  });
}

'@

$f8 = @'
type IconProps = { className?: string };

const base = "none";

export function MenuIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function HomeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function SearchIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  );
}

export function PlusCircleIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function UserIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" />
    </svg>
  );
}

export function PinIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  );
}

export function WaveIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 8s2-2 4-2 3 2 5 2 3-2 5-2 4 2 4 2" />
      <path d="M3 14s2-2 4-2 3 2 5 2 3-2 5-2 4 2 4 2" />
      <path d="M3 20s2-2 4-2 3 2 5 2 3-2 5-2 4 2 4 2" />
    </svg>
  );
}

export function HeartIcon({
  className = "h-5 w-5",
  filled = false,
}: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 20.5s-7.5-4.9-10-9.6C.4 7.6 2 4 5.6 3.4c2-.3 3.9.7 5 2.3 1.1-1.6 3-2.6 5-2.3C19.2 4 20.8 7.6 19.2 10.9c-2.5 4.7-10 9.6-10 9.6Z" />
    </svg>
  );
}

export function StarIcon({
  className = "h-4 w-4",
  filled = true,
}: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 17l-5.6 3.1 1.4-6.3-4.8-4.3 6.4-.6L12 3Z" />
    </svg>
  );
}

export function BellIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function CalendarIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function TicketIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.7 1.7 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.7 1.7 0 0 0 0-3V9Z" />
      <path d="M10 7v10" strokeDasharray="2.2 2.2" />
    </svg>
  );
}

export function VerifiedBadgeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="verified-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd76b" />
          <stop offset="1" stopColor="#f5a623" />
        </linearGradient>
      </defs>
      <path
        d="m12 1.5 2.4 1.4 2.7-.5 1.4 2.4 2.4 1.4-.5 2.7 1.4 2.4-1.9 2.1.5 2.7-2.7.5-1.4 2.4-2.7-.5L12 22.5l-2.4-1.4-2.7.5-1.4-2.4-2.7-.5.5-2.7-1.9-2.1 1.4-2.4-.5-2.7 2.4-1.4 1.4-2.4 2.7.5L12 1.5Z"
        fill="url(#verified-gold)"
      />
      <path
        d="m8.3 12.3 2.4 2.4 5-5.2"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowLeftIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function ShareIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.7 15.8 6.3M8.2 13.3l7.6 4.4" />
    </svg>
  );
}

export function TagIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.6 3.5H6a2.5 2.5 0 0 0-2.5 2.5v6.6c0 .5.2 1 .5 1.4l8.4 8.4c.8.8 2 .8 2.8 0l6.6-6.6c.8-.8.8-2 0-2.8L13.4 4a2 2 0 0 0-.8-.5Z" />
      <circle cx="8.5" cy="8.5" r="1.5" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.85.5 3.58 1.36 5.07L2 22l5.08-1.33A9.96 9.96 0 0 0 12.02 22C17.54 22 22 17.52 22 12S17.54 2 12.02 2Zm0 18.15a8.13 8.13 0 0 1-4.15-1.14l-.3-.18-3.02.79.8-2.94-.2-.3a8.13 8.13 0 1 1 6.87 3.77Zm4.47-6.1c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.44-1.35-1.68-.14-.24-.02-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.05s.88 2.38 1 2.54c.12.16 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.11-.22-.17-.46-.29Z" />
    </svg>
  );
}

export function FacebookIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M13.5 22v-8.4h2.83l.42-3.28h-3.25V8.24c0-.95.26-1.6 1.63-1.6h1.74V3.72A23.6 23.6 0 0 0 14.36 3.6c-2.5 0-4.22 1.53-4.22 4.33v2.4H7.3v3.27h2.84V22h3.36Z" />
    </svg>
  );
}

export function TikTokIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M16.5 2h-3.1v13.4a2.6 2.6 0 1 1-1.85-2.5v-3.2a5.8 5.8 0 1 0 4.95 5.75V9.1a7.4 7.4 0 0 0 4.3 1.38V7.36A4.35 4.35 0 0 1 16.5 3.02V2Z" />
    </svg>
  );
}

export function MegaphoneIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 10v4a1 1 0 0 0 1 1h2l3.5 5V4L6 9H4a1 1 0 0 0-1 1Z" />
      <path d="M14 7a5 5 0 0 1 0 10M18 4a9 9 0 0 1 0 16" />
    </svg>
  );
}

// Espace communautaire (mur + messagerie) — deux silhouettes.
export function UsersIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 4.5a3.2 3.2 0 0 1 0 6.4M20.5 20a5 5 0 0 0-4.5-6" />
    </svg>
  );
}

export function ChatIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 5h16v11H8l-4 4V5Z" />
    </svg>
  );
}

export function ImageIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m21 15-5-5-9 9" />
    </svg>
  );
}

'@

$f9 = @'
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, CalendarIcon, HeartIcon, UserIcon, UsersIcon } from "./icons";

const TABS = [
  { href: "/", label: "Accueil", icon: HomeIcon, match: (p: string) => p === "/" },
  {
    href: "/mes-reservations",
    label: "Réservations",
    icon: CalendarIcon,
    match: (p: string) => p.startsWith("/mes-reservations"),
  },
  {
    href: "/communaute",
    label: "Communauté",
    icon: UsersIcon,
    match: (p: string) => p.startsWith("/communaute"),
  },
  {
    href: "/favoris",
    label: "Favoris",
    icon: HeartIcon,
    match: (p: string) => p.startsWith("/favoris"),
  },
  {
    href: "/profil",
    label: "Profil",
    icon: UserIcon,
    match: (p: string) => p.startsWith("/profil"),
  },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="app-tabbar-shadow fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-100 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 md:hidden"
      aria-label="Navigation principale"
    >
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium ${
              active ? "text-brand-teal" : "text-slate-400"
            }`}
          >
            <Icon className="h-5 w-5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

'@

$f10 = @'
"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "./icons";
import { WHATSAPP_URL } from "@/lib/social";

// Bouton flottant WhatsApp, visible sur tout le site public — contact
// rapide vers le numéro Happy Life (+241 77 00 00 00). Masqué dans une
// conversation communauté : il chevauche et bloque sinon les clics sur le
// bouton d'envoi du champ de message, fixé lui aussi en bas de l'écran.
export default function WhatsAppFloatButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/communaute/messages/")) return null;

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter Happy Life sur WhatsApp"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_25px_rgba(37,211,102,0.5)] transition hover:scale-105 md:bottom-6 md:right-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}

'@

$f11 = @'
"use client";

import { useState } from "react";
import { ShareIcon } from "./icons";

// Partage une publication du mur communautaire : télécharge d'abord la
// version avec filigrane Happy Life générée à la volée (voir
// src/app/api/communaute/partage/[postId]/route.ts) — la photo d'origine
// affichée sur le mur, elle, n'a jamais de filigrane. Utilise l'API de
// partage native quand elle est disponible (avec le fichier image
// directement), sinon propose un téléchargement classique.
export default function ShareCommunityPostButton({
  postId,
  legende,
}: {
  postId: string;
  legende?: string;
}) {
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState(false);

  async function handleShare() {
    setEnCours(true);
    setErreur(false);
    try {
      const res = await fetch(`/api/communaute/partage/${postId}`);
      if (!res.ok) throw new Error("échec");
      const blob = await res.blob();
      const file = new File([blob], `happy-life-${postId}.jpg`, { type: "image/jpeg" });

      if (
        typeof navigator !== "undefined" &&
        navigator.share &&
        navigator.canShare?.({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: "Happy Life",
            text: legende || "Vu sur Happy Life",
          });
          return;
        } catch {
          // Partage annulé par l'utilisateur — pas d'erreur à afficher.
          return;
        }
      }

      // Pas d'API de partage native (desktop, navigateur non compatible) :
      // on déclenche un téléchargement classique de l'image filigranée.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `happy-life-${postId}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErreur(true);
      setTimeout(() => setErreur(false), 2500);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={enCours}
      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
    >
      <ShareIcon className="h-3.5 w-3.5" />
      {enCours ? "…" : erreur ? "Réessayer" : "Partager"}
    </button>
  );
}

'@

$f12 = @'
"use client";

import { useState } from "react";
import Image from "next/image";
import { ChatIcon } from "./icons";
import ShareCommunityPostButton from "./ShareCommunityPostButton";
import CommunityCommentForm from "./forms/CommunityCommentForm";
import { deletePostAction, startConversationAction } from "@/lib/actions/community";
import type { CommunityPost, CommunityComment } from "@/lib/types";

function initiale(nom: string) {
  return nom.trim().charAt(0).toUpperCase() || "?";
}

function tempsEcoule(dateIso: string) {
  const diffMs = Date.now() - new Date(dateIso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.floor(heures / 24);
  return `il y a ${jours} j`;
}

export default function CommunityPostCard({
  post,
  comments,
  currentMemberId,
}: {
  post: CommunityPost;
  comments: CommunityComment[];
  currentMemberId: string | null;
}) {
  const [ouvert, setOuvert] = useState(false);
  const estAuteur = currentMemberId === post.auteur_id;

  return (
    <article className="overflow-hidden rounded-2xl bg-white card-shadow ring-1 ring-slate-100">
      <div className="flex items-center justify-between px-4 pt-3.5">
        <div className="flex items-center gap-2.5">
          {post.auteur?.avatar ? (
            <Image
              src={post.auteur.avatar}
              alt={post.auteur.nom}
              width={34}
              height={34}
              className="h-[34px] w-[34px] rounded-full object-cover"
            />
          ) : (
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full brand-gradient text-sm font-bold text-white">
              {initiale(post.auteur?.nom || "?")}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {post.auteur?.nom || "Membre Happy Life"}
            </p>
            <p className="text-[11px] text-slate-400">{tempsEcoule(post.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentMemberId && !estAuteur && (
            <form action={startConversationAction.bind(null, post.auteur_id)}>
              <button
                type="submit"
                aria-label="Envoyer un message"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <ChatIcon className="h-4 w-4" />
              </button>
            </form>
          )}
          {estAuteur && (
            <form action={deletePostAction.bind(null, post.id)}>
              <button
                type="submit"
                className="text-xs font-medium text-slate-400 hover:text-rose-500"
              >
                Supprimer
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="relative mt-3 aspect-square w-full bg-slate-100">
        <Image src={post.photo} alt={post.legende || "Publication"} fill sizes="480px" className="object-cover" />
      </div>

      <div className="px-4 py-3">
        {post.legende && <p className="text-sm text-slate-700">{post.legende}</p>}

        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setOuvert((v) => !v)}
            className="text-xs font-medium text-slate-400 hover:text-brand-teal"
          >
            {post.nbCommentaires > 0
              ? `${post.nbCommentaires} commentaire${post.nbCommentaires > 1 ? "s" : ""}`
              : "Commenter"}
          </button>
          <ShareCommunityPostButton postId={post.id} legende={post.legende} />
        </div>

        {ouvert && (
          <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2 text-sm">
                <span className="font-semibold text-slate-800">{c.auteur?.nom || "Membre"}</span>
                <span className="text-slate-600">{c.texte}</span>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-xs text-slate-400">Aucun commentaire pour l&apos;instant.</p>
            )}
            {currentMemberId ? (
              <CommunityCommentForm postId={post.id} />
            ) : (
              <p className="text-xs text-slate-400">
                Connectez-vous pour commenter cette publication.
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

'@

$f13 = @'
"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registerCommunityAction } from "@/lib/actions/community";
import SubmitButton from "../SubmitButton";

const TYPES_CONTACT = [
  { value: "telephone", label: "Téléphone" },
  { value: "whatsapp", label: "Numéro WhatsApp" },
  { value: "email", label: "Email" },
];

export default function CommunityRegisterForm() {
  const [state, formAction] = useActionState(registerCommunityAction, undefined);
  const [typeContact, setTypeContact] = useState("telephone");

  if (state?.success && state.membreId) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-brand-teal/10 px-4 py-3.5 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          <p className="font-semibold">Compte créé ✓</p>
          <p className="mt-1">
            Aucun fournisseur SMS/WhatsApp n&apos;est encore branché sur Happy Life : en
            attendant, voici votre code de vérification directement à l&apos;écran.
          </p>
          <p className="mt-3 text-center text-2xl font-bold tracking-[0.3em] text-brand-deep">
            {state.codeTest}
          </p>
        </div>
        <Link
          href={`/communaute/inscription/verification?membreId=${state.membreId}`}
          className="block w-full rounded-xl brand-gradient px-4 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90"
        >
          Continuer vers la vérification →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Votre nom</label>
        <input
          name="nom"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Vous nous rejoignez avec</label>
        <div className="mt-1 flex gap-2">
          {TYPES_CONTACT.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTypeContact(t.value)}
              className={`flex-1 rounded-xl px-2 py-2 text-xs font-semibold ring-1 transition ${
                typeContact === t.value
                  ? "bg-brand-teal text-white ring-brand-teal"
                  : "bg-white text-slate-600 ring-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="typeContact" value={typeContact} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          {typeContact === "email" ? "Adresse email" : "Numéro (+241...)"}
        </label>
        <input
          name="contact"
          required
          type={typeContact === "email" ? "email" : "tel"}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
        <input
          name="password"
          type="password"
          minLength={6}
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>

      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <SubmitButton className="w-full rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
        Rejoindre la communauté
      </SubmitButton>
    </form>
  );
}

'@

$f14 = @'
"use client";

import { useActionState, useState, useTransition } from "react";
import {
  verifyCommunityCodeAction,
  resendCommunityCodeAction,
} from "@/lib/actions/community";
import SubmitButton from "../SubmitButton";

export default function CommunityVerifyForm({ membreId }: { membreId: string }) {
  const [state, formAction] = useActionState(verifyCommunityCodeAction, undefined);
  const [nouveauCode, setNouveauCode] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleRenvoyer() {
    startTransition(async () => {
      const res = await resendCommunityCodeAction(membreId);
      if (res?.codeTest) setNouveauCode(res.codeTest);
    });
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="membreId" value={membreId} />

      {nouveauCode && (
        <div className="rounded-xl bg-brand-teal/10 px-4 py-3 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          <p>Nouveau code de test :</p>
          <p className="mt-1 text-center text-2xl font-bold tracking-[0.3em]">{nouveauCode}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">Code à 6 chiffres</label>
        <input
          name="code"
          required
          maxLength={6}
          inputMode="numeric"
          autoComplete="one-time-code"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-center text-lg font-semibold tracking-[0.3em] outline-none focus:border-brand-teal"
        />
      </div>

      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <SubmitButton className="w-full rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
        Confirmer mon compte
      </SubmitButton>

      <button
        type="button"
        onClick={handleRenvoyer}
        disabled={pending}
        className="w-full text-center text-xs font-medium text-slate-400 hover:text-brand-teal disabled:opacity-60"
      >
        {pending ? "…" : "Je n'ai pas reçu de code — en générer un nouveau"}
      </button>
    </form>
  );
}

'@

$f15 = @'
"use client";

import { useActionState } from "react";
import { loginCommunityAction } from "@/lib/actions/community";
import SubmitButton from "../SubmitButton";

export default function CommunityLoginForm() {
  const [state, formAction] = useActionState(loginCommunityAction, undefined);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Téléphone, WhatsApp ou email
        </label>
        <input
          name="contact"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
        <input
          name="password"
          type="password"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <SubmitButton className="w-full rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
        Se connecter
      </SubmitButton>
    </form>
  );
}

'@

$f16 = @'
"use client";

import { useActionState, useRef, useState } from "react";
import { createPostAction } from "@/lib/actions/community";
import SubmitButton from "../SubmitButton";
import { ImageIcon } from "../icons";

export default function CommunityPostForm() {
  const [state, formAction] = useActionState(createPostAction, undefined);
  const [apercu, setApercu] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setApercu(file ? URL.createObjectURL(file) : null);
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl bg-white p-4 card-shadow ring-1 ring-slate-100"
    >
      <p className="text-sm font-semibold text-slate-900">Partager une photo</p>

      <label
        htmlFor="communaute-photo"
        className="mt-3 flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 hover:border-brand-teal hover:text-brand-teal"
      >
        {apercu ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={apercu} alt="Aperçu" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1.5 text-xs font-medium">
            <ImageIcon className="h-6 w-6" />
            Choisir une photo
          </span>
        )}
      </label>
      <input
        ref={inputRef}
        id="communaute-photo"
        name="photo"
        type="file"
        accept="image/*"
        required
        onChange={handleFichier}
        className="hidden"
      />

      <textarea
        name="legende"
        rows={2}
        maxLength={280}
        placeholder="Une légende (optionnel)…"
        className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
      />

      {state?.error && <p className="mt-2 text-sm text-rose-600">{state.error}</p>}

      <SubmitButton className="mt-3 w-full rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
        Publier
      </SubmitButton>
    </form>
  );
}

'@

$f17 = @'
"use client";

import { useActionState } from "react";
import { addCommentAction } from "@/lib/actions/community";
import type { FormState } from "@/lib/actions/auth";
import SubmitButton from "../SubmitButton";

export default function CommunityCommentForm({ postId }: { postId: string }) {
  const action = addCommentAction.bind(null, postId);
  const [state, formAction] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="mt-2 flex items-center gap-2">
      <input
        name="texte"
        required
        placeholder="Ajouter un commentaire…"
        className="flex-1 rounded-full border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-brand-teal"
      />
      <SubmitButton className="rounded-full bg-brand-teal px-4 py-2 text-xs font-semibold text-white hover:opacity-90">
        Envoyer
      </SubmitButton>
      {state?.error && <p className="text-xs text-rose-600">{state.error}</p>}
    </form>
  );
}

'@

$f18 = @'
"use client";

import { useActionState } from "react";
import { sendMessageAction } from "@/lib/actions/community";
import type { FormState } from "@/lib/actions/auth";
import SubmitButton from "../SubmitButton";

export default function CommunityMessageForm({ conversationId }: { conversationId: string }) {
  const action = sendMessageAction.bind(null, conversationId);
  const [state, formAction] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="border-t border-slate-100 bg-white p-3">
      <div className="flex items-center gap-2">
        <input
          name="texte"
          required
          placeholder="Écrire un message…"
          autoComplete="off"
          className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
        <SubmitButton className="rounded-full brand-gradient px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
          Envoyer
        </SubmitButton>
      </div>
      {state?.error && <p className="mt-1.5 text-xs text-rose-600">{state.error}</p>}
    </form>
  );
}

'@

$f19 = @'
import Link from "next/link";
import { getCommunitySession } from "@/lib/communityAuth";
import { listPosts, listComments } from "@/lib/community";
import CommunityPostForm from "@/components/forms/CommunityPostForm";
import CommunityPostCard from "@/components/CommunityPostCard";
import { ChatIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Communauté — Happy Life" };

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenue?: string; publie?: string }>;
}) {
  const params = await searchParams;
  const session = await getCommunitySession();
  const posts = listPosts();
  const commentsByPost = Object.fromEntries(posts.map((p) => [p.id, listComments(p.id)]));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Communauté</h1>
          <p className="mt-1 text-sm text-slate-500">
            Photos et discussions entre membres Happy Life.
          </p>
        </div>
        {session && (
          <Link
            href="/communaute/messages"
            aria-label="Mes messages"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 card-shadow ring-1 ring-slate-100 hover:text-brand-teal"
          >
            <ChatIcon className="h-5 w-5" />
          </Link>
        )}
      </div>

      {params.bienvenue === "1" && (
        <p className="mt-4 rounded-xl bg-brand-teal/10 px-4 py-3 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          Bienvenue dans la communauté Happy Life ✓
        </p>
      )}
      {params.publie === "1" && (
        <p className="mt-4 rounded-xl bg-brand-teal/10 px-4 py-3 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          Publication envoyée ✓
        </p>
      )}

      <div className="mt-6">
        {session ? (
          <CommunityPostForm />
        ) : (
          <div className="rounded-2xl bg-white p-5 text-center card-shadow ring-1 ring-slate-100">
            <p className="text-sm text-slate-600">
              Rejoignez la communauté pour publier des photos et discuter avec les autres
              membres.
            </p>
            <div className="mt-3 flex justify-center gap-2.5">
              <Link
                href="/communaute/inscription"
                className="rounded-full brand-gradient px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Rejoindre
              </Link>
              <Link
                href="/communaute/connexion"
                className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
              >
                Se connecter
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-5">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
            Aucune publication pour le moment — soyez le premier à partager une photo !
          </div>
        ) : (
          posts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              comments={commentsByPost[post.id] || []}
              currentMemberId={session?.sub ?? null}
            />
          ))
        )}
      </div>
    </div>
  );
}

'@

$f20 = @'
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import CommunityRegisterForm from "@/components/forms/CommunityRegisterForm";

export const metadata = { title: "Rejoindre la communauté — Happy Life" };

export default function CommunityRegisterPage() {
  return (
    <AuthCard
      title="Rejoindre la communauté Happy Life"
      subtitle="Partagez vos photos et échangez avec les autres membres."
      footer={
        <>
          Déjà membre ?{" "}
          <Link href="/communaute/connexion" className="font-medium text-brand-teal">
            Se connecter
          </Link>
        </>
      }
    >
      <CommunityRegisterForm />
    </AuthCard>
  );
}

'@

$f21 = @'
import { redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import CommunityVerifyForm from "@/components/forms/CommunityVerifyForm";

export const metadata = { title: "Vérification du compte — Happy Life" };

export default async function CommunityVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ membreId?: string }>;
}) {
  const { membreId } = await searchParams;
  if (!membreId) redirect("/communaute/inscription");

  return (
    <AuthCard
      title="Vérifiez votre compte"
      subtitle="Saisissez le code à 6 chiffres pour activer votre compte communauté."
    >
      <CommunityVerifyForm membreId={membreId} />
    </AuthCard>
  );
}

'@

$f22 = @'
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import CommunityLoginForm from "@/components/forms/CommunityLoginForm";

export const metadata = { title: "Connexion communauté — Happy Life" };

export default function CommunityLoginPage() {
  return (
    <AuthCard
      title="Espace communauté"
      subtitle="Connectez-vous pour publier et discuter avec les autres membres."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/communaute/inscription" className="font-medium text-brand-teal">
            Rejoindre la communauté
          </Link>
        </>
      }
    >
      <CommunityLoginForm />
    </AuthCard>
  );
}

'@

$f23 = @'
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCommunitySession } from "@/lib/communityAuth";
import { listConversationsForMember } from "@/lib/community";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages — Happy Life" };

function initiale(nom: string) {
  return nom.trim().charAt(0).toUpperCase() || "?";
}

export default async function CommunityMessagesPage() {
  const session = await getCommunitySession();
  if (!session) redirect("/communaute/connexion");

  const conversations = listConversationsForMember(session.sub);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <Link
          href="/communaute"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 card-shadow ring-1 ring-slate-100"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Messages</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          Aucune conversation pour l&apos;instant. Écrivez à un membre depuis le mur communauté.
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/communaute/messages/${c.id}`}
              className="flex items-center gap-3 rounded-2xl bg-white p-3.5 card-shadow ring-1 ring-slate-100 transition hover:-translate-y-0.5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full brand-gradient text-base font-bold text-white">
                {initiale(c.autreMembre?.nom || "?")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {c.autreMembre?.nom || "Membre Happy Life"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {c.dernierMessage?.texte || "Démarrer la conversation"}
                </p>
              </div>
              {c.nonLus > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-teal px-1.5 text-[11px] font-bold text-white">
                  {c.nonLus}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

'@

$f24 = @'
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCommunitySession } from "@/lib/communityAuth";
import {
  getConversationById,
  estParticipant,
  listMessages,
  marquerConversationLue,
  toPublicProfile,
  getMemberById,
} from "@/lib/community";
import CommunityMessageForm from "@/components/forms/CommunityMessageForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Conversation — Happy Life" };

function initiale(nom: string) {
  return nom.trim().charAt(0).toUpperCase() || "?";
}

export default async function CommunityConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const session = await getCommunitySession();
  if (!session) redirect("/communaute/connexion");

  const { conversationId } = await params;
  const conversation = getConversationById(conversationId);
  if (!conversation || !estParticipant(conversation, session.sub)) {
    notFound();
  }

  const autreId =
    conversation.membre_1_id === session.sub ? conversation.membre_2_id : conversation.membre_1_id;
  const autreMembre = toPublicProfile(getMemberById(autreId));

  marquerConversationLue(conversationId, session.sub);
  const messages = listMessages(conversationId);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-6 sm:px-6">
      <div className="flex items-center gap-3 pb-4">
        <Link
          href="/communaute/messages"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 card-shadow ring-1 ring-slate-100"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full brand-gradient text-sm font-bold text-white">
          {initiale(autreMembre?.nom || "?")}
        </div>
        <h1 className="text-base font-semibold text-slate-900">
          {autreMembre?.nom || "Membre Happy Life"}
        </h1>
      </div>

      <div className="min-h-[50vh] space-y-2.5 rounded-2xl bg-white p-4 card-shadow ring-1 ring-slate-100">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-400">
            Dites bonjour à {autreMembre?.nom || "ce membre"} 👋
          </p>
        ) : (
          messages.map((m) => {
            const estMoi = m.expediteur_id === session.sub;
            return (
              <div key={m.id} className={`flex ${estMoi ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    estMoi
                      ? "brand-gradient rounded-br-sm text-white"
                      : "rounded-bl-sm bg-slate-100 text-slate-700"
                  }`}
                >
                  {m.texte}
                </p>
              </div>
            );
          })
        )}
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 md:bottom-0">
        <div className="mx-auto max-w-2xl">
          <CommunityMessageForm conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
}

'@

$resultats["src\lib\db.ts"] = Ecrire-Fichier -CheminRelatif "src\lib\db.ts" -Contenu $f0 -SignatureAttendue "community_members"
$resultats["src\lib\types.ts"] = Ecrire-Fichier -CheminRelatif "src\lib\types.ts" -Contenu $f1 -SignatureAttendue "CommunityMemberRecord"
$resultats["src\lib\community.ts"] = Ecrire-Fichier -CheminRelatif "src\lib\community.ts" -Contenu $f2 -SignatureAttendue "getOuCreerConversation"
$resultats["src\lib\communityAuth.ts"] = Ecrire-Fichier -CheminRelatif "src\lib\communityAuth.ts" -Contenu $f3 -SignatureAttendue "happy_life_communaute_session"
$resultats["src\lib\communityUploads.ts"] = Ecrire-Fichier -CheminRelatif "src\lib\communityUploads.ts" -Contenu $f4 -SignatureAttendue "COMMUNAUTE_UPLOADS_DIR"
$resultats["src\lib\actions\community.ts"] = Ecrire-Fichier -CheminRelatif "src\lib\actions\community.ts" -Contenu $f5 -SignatureAttendue "registerCommunityAction"
$resultats["src\app\api\communaute\photo\[...segments]\route.ts"] = Ecrire-Fichier -CheminRelatif "src\app\api\communaute\photo\[...segments]\route.ts" -Contenu $f6 -SignatureAttendue "MIME_PAR_EXTENSION"
$resultats["src\app\api\communaute\partage\[postId]\route.ts"] = Ecrire-Fichier -CheminRelatif "src\app\api\communaute\partage\[postId]\route.ts" -Contenu $f7 -SignatureAttendue "plaqueSvg"
$resultats["src\components\icons.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\icons.tsx" -Contenu $f8 -SignatureAttendue "UsersIcon"
$resultats["src\components\MobileTabBar.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\MobileTabBar.tsx" -Contenu $f9 -SignatureAttendue "communaute"
$resultats["src\components\WhatsAppFloatButton.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\WhatsAppFloatButton.tsx" -Contenu $f10 -SignatureAttendue "communaute/messages/"
$resultats["src\components\ShareCommunityPostButton.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\ShareCommunityPostButton.tsx" -Contenu $f11 -SignatureAttendue "navigator.share"
$resultats["src\components\CommunityPostCard.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\CommunityPostCard.tsx" -Contenu $f12 -SignatureAttendue "ShareCommunityPostButton"
$resultats["src\components\forms\CommunityRegisterForm.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\forms\CommunityRegisterForm.tsx" -Contenu $f13 -SignatureAttendue "registerCommunityAction"
$resultats["src\components\forms\CommunityVerifyForm.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\forms\CommunityVerifyForm.tsx" -Contenu $f14 -SignatureAttendue "verifyCommunityCodeAction"
$resultats["src\components\forms\CommunityLoginForm.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\forms\CommunityLoginForm.tsx" -Contenu $f15 -SignatureAttendue "loginCommunityAction"
$resultats["src\components\forms\CommunityPostForm.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\forms\CommunityPostForm.tsx" -Contenu $f16 -SignatureAttendue "createPostAction"
$resultats["src\components\forms\CommunityCommentForm.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\forms\CommunityCommentForm.tsx" -Contenu $f17 -SignatureAttendue "addCommentAction"
$resultats["src\components\forms\CommunityMessageForm.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\forms\CommunityMessageForm.tsx" -Contenu $f18 -SignatureAttendue "sendMessageAction"
$resultats["src\app\(public)\communaute\page.tsx"] = Ecrire-Fichier -CheminRelatif "src\app\(public)\communaute\page.tsx" -Contenu $f19 -SignatureAttendue "CommunityPostForm"
$resultats["src\app\(public)\communaute\inscription\page.tsx"] = Ecrire-Fichier -CheminRelatif "src\app\(public)\communaute\inscription\page.tsx" -Contenu $f20 -SignatureAttendue "CommunityRegisterForm"
$resultats["src\app\(public)\communaute\inscription\verification\page.tsx"] = Ecrire-Fichier -CheminRelatif "src\app\(public)\communaute\inscription\verification\page.tsx" -Contenu $f21 -SignatureAttendue "CommunityVerifyForm"
$resultats["src\app\(public)\communaute\connexion\page.tsx"] = Ecrire-Fichier -CheminRelatif "src\app\(public)\communaute\connexion\page.tsx" -Contenu $f22 -SignatureAttendue "CommunityLoginForm"
$resultats["src\app\(public)\communaute\messages\page.tsx"] = Ecrire-Fichier -CheminRelatif "src\app\(public)\communaute\messages\page.tsx" -Contenu $f23 -SignatureAttendue "listConversationsForMember"
$resultats["src\app\(public)\communaute\messages\[conversationId]\page.tsx"] = Ecrire-Fichier -CheminRelatif "src\app\(public)\communaute\messages\[conversationId]\page.tsx" -Contenu $f24 -SignatureAttendue "CommunityMessageForm"

Write-Host ""
Write-Host "=================================================="
$total = $resultats.Count
$ok = ($resultats.Values | Where-Object { $_ -eq $true }).Count
if ($ok -eq $total) {
    Write-Host "TERMINE - $ok / $total fichiers corrects sur le disque." -ForegroundColor Green
} else {
    Write-Host "TERMINE AVEC DES ERREURS - $ok / $total fichiers corrects." -ForegroundColor Red
    Write-Host "Fichiers en echec :" -ForegroundColor Red
    foreach ($k in $resultats.Keys) {
        if (-not $resultats[$k]) { Write-Host "  - $k" -ForegroundColor Red }
    }
}
Write-Host ""
Write-Host "IMPORTANT : ce script n'a pas touche votre fichier .gitignore."
Write-Host "Ajoutez-y vous-meme, sur une nouvelle ligne, ce texte exact :"
Write-Host "  data/uploads/" -ForegroundColor Cyan
Write-Host "(juste apres la ligne 'data/*.db') pour eviter d'envoyer vos photos de test sur GitHub. Ce n'est pas obligatoire pour que l'application fonctionne."
Write-Host "=================================================="
