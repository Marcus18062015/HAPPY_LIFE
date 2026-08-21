$ErrorActionPreference = "Stop"

$racine = $PSScriptRoot
if (-not (Test-Path (Join-Path $racine "package.json"))) {
    $racine = "C:\Users\Marc\Desktop\Fichiers\HAPPY_PISCINE\HAPPY_LIFE"
}

Write-Host "=================================================="
Write-Host "Mot de passe oublie (communaute + proprietaire) - VERSION 1"
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
        [System.IO.Directory]::CreateDirectory($dossier) | Out-Null
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
        Write-Host "   *** ECHEC DE LA VERIFICATION (contenu inattendu apres ecriture) ***" -ForegroundColor Red
        return $false
    }
}

$f0 = @'
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
  reset_code: string | null;
  reset_code_expire_at: string | null;
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
$f1 = @'
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
      reset_code TEXT,
      reset_code_expire_at TEXT,
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

  // "Mot de passe oublié" (propriétaire/admin) ajouté après la création
  // initiale de la table `users` : CREATE TABLE IF NOT EXISTS ne modifie pas
  // un schéma déjà existant, donc ces colonnes doivent être ajoutées ici pour
  // les bases déjà présentes sur disque (utile en local — sur Render, le
  // disque est réinitialisé et reseedé à chaque déploiement, voir
  // render.yaml, donc CREATE TABLE ci-dessus suffit déjà).
  for (const statement of [
    `ALTER TABLE users ADD COLUMN reset_code TEXT`,
    `ALTER TABLE users ADD COLUMN reset_code_expire_at TEXT`,
  ]) {
    try {
      db.exec(statement);
    } catch {
      // Colonne déjà présente — rien à faire.
    }
  }
}

initSchema();
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
'@
$f3 = @'
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
'@
$f4 = @'
import "server-only";
import { randomUUID, randomInt } from "node:crypto";
import { db } from "./db";
import { toFiche } from "./types";
import type {
  UserRecord,
  FicheRecord,
  DemandeRecord,
  Fiche,
  Role,
  StatutValidation,
  AvisRecord,
  FavoriRecord,
  PromotionRecord,
  EvenementRecord,
  StatutAvis,
  OwnerPublicProfile,
  AbonneRecord,
  PubliciteRecord,
  AbonnementProprietaireRecord,
  AbonnementStatut,
} from "./types";
import { calculerMontantAbonnement, ABONNEMENT_JOURS_PAR_MOIS } from "./constants";

// ---------- Users ----------

export function createUser(input: {
  role: Role;
  nom: string;
  email: string;
  telephone?: string;
  passwordHash: string;
  // Un compte propriétaire créé par auto-inscription démarre en attente de
  // validation par l'administrateur. Les comptes créés autrement (seed,
  // admin) peuvent forcer un statut différent (ex : 'ACTIF').
  statut?: "EN_ATTENTE" | "ACTIF" | "SUSPENDU";
}): UserRecord {
  const id = randomUUID();
  const statut = input.statut ?? (input.role === "PROPRIETAIRE" ? "EN_ATTENTE" : "ACTIF");
  db.prepare(
    `INSERT INTO users (id, role, nom, email, telephone, password_hash, statut)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.role,
    input.nom,
    input.email.toLowerCase().trim(),
    input.telephone ?? null,
    input.passwordHash,
    statut
  );
  return getUserById(id)!;
}

export function getUserByEmail(email: string): UserRecord | undefined {
  return db
    .prepare(`SELECT * FROM users WHERE email = ?`)
    .get(email.toLowerCase().trim()) as unknown as UserRecord | undefined;
}

export function getUserById(id: string): UserRecord | undefined {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as unknown as
    | UserRecord
    | undefined;
}

export function listOwners(): UserRecord[] {
  return db
    .prepare(`SELECT * FROM users WHERE role = 'PROPRIETAIRE' ORDER BY created_at DESC`)
    .all() as unknown as UserRecord[];
}

export function setUserStatut(id: string, statut: "EN_ATTENTE" | "ACTIF" | "SUSPENDU") {
  db.prepare(`UPDATE users SET statut = ? WHERE id = ?`).run(statut, id);
}

export function setUserPassword(id: string, passwordHash: string) {
  db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(passwordHash, id);
}

// ---------- Mot de passe oublié (propriétaire / admin) ----------
//
// Même principe que l'espace communauté : aucun fournisseur SMS/WhatsApp ni
// d'envoi d'email n'est encore branché sur Happy Life, donc le code de
// réinitialisation est affiché directement à l'écran plutôt qu'envoyé — voir
// src/lib/sms.ts. Durée de validité alignée sur celle de la communauté.
const RESET_CODE_VALIDITE_MINUTES = 15;

function genererCodeReinitialisation(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function regenererCodeReinitialisation(id: string): string | null {
  const user = getUserById(id);
  if (!user) return null;
  const code = genererCodeReinitialisation();
  const expire = new Date(Date.now() + RESET_CODE_VALIDITE_MINUTES * 60_000).toISOString();
  db.prepare(`UPDATE users SET reset_code = ?, reset_code_expire_at = ? WHERE id = ?`).run(
    code,
    expire,
    id
  );
  return code;
}

export type ReinitialisationResultat = "OK" | "CODE_INCORRECT" | "CODE_EXPIRE";

export function reinitialiserMotDePasseUtilisateur(
  id: string,
  code: string,
  nouveauPasswordHash: string
): ReinitialisationResultat {
  const user = getUserById(id);
  if (!user) return "CODE_INCORRECT";
  if (!user.reset_code || user.reset_code !== code.trim()) return "CODE_INCORRECT";
  if (!user.reset_code_expire_at || new Date(user.reset_code_expire_at).getTime() < Date.now()) {
    return "CODE_EXPIRE";
  }
  db.prepare(
    `UPDATE users SET password_hash = ?, reset_code = NULL, reset_code_expire_at = NULL WHERE id = ?`
  ).run(nouveauPasswordHash, id);
  return "OK";
}

export function countFichesForOwner(ownerId: string): number {
  const row = db
    .prepare(`SELECT COUNT(*) as n FROM fiches WHERE owner_id = ?`)
    .get(ownerId) as { n: number };
  return row.n;
}

// Suppression d'un compte propriétaire — volontairement restreinte au rôle
// PROPRIETAIRE (WHERE role = 'PROPRIETAIRE') pour qu'il soit impossible de
// supprimer le compte administrateur par ce biais. Les fiches de ce
// propriétaire sont supprimées en cascade (fiches.owner_id REFERENCES
// users(id) ON DELETE CASCADE).
export function deleteOwner(id: string) {
  db.prepare(`DELETE FROM users WHERE id = ? AND role = 'PROPRIETAIRE'`).run(id);
}

// ---------- Fiches ----------

export function createFiche(input: {
  ownerId: string;
  type: "PISCINE" | "APPARTEMENT";
  titre: string;
  description: string;
  zone: string;
  quartier?: string;
  tarifIndicatif?: string;
  equipements: string[];
  disponibilite?: string;
}): Fiche {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO fiches
      (id, owner_id, type, titre, description, zone, quartier, tarif_indicatif, equipements, photos, disponibilite, statut_validation, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, 'EN_ATTENTE', 1)`
  ).run(
    id,
    input.ownerId,
    input.type,
    input.titre,
    input.description,
    input.zone,
    input.quartier ?? null,
    input.tarifIndicatif ?? null,
    JSON.stringify(input.equipements ?? []),
    input.disponibilite ?? ""
  );
  return getFicheById(id)!;
}

export function updateFiche(
  id: string,
  input: {
    type: "PISCINE" | "APPARTEMENT";
    titre: string;
    description: string;
    zone: string;
    quartier?: string;
    tarifIndicatif?: string;
    equipements: string[];
    disponibilite?: string;
  }
) {
  db.prepare(
    `UPDATE fiches SET type = ?, titre = ?, description = ?, zone = ?, quartier = ?,
      tarif_indicatif = ?, equipements = ?, disponibilite = ?,
      statut_validation = 'EN_ATTENTE', motif_refus = NULL, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    input.type,
    input.titre,
    input.description,
    input.zone,
    input.quartier ?? null,
    input.tarifIndicatif ?? null,
    JSON.stringify(input.equipements ?? []),
    input.disponibilite ?? "",
    id
  );
}

export function addPhotoToFiche(id: string, photoPath: string) {
  const fiche = getFicheRawById(id);
  if (!fiche) return;
  const photos: string[] = JSON.parse(fiche.photos || "[]");
  photos.push(photoPath);
  db.prepare(`UPDATE fiches SET photos = ?, updated_at = datetime('now') WHERE id = ?`).run(
    JSON.stringify(photos),
    id
  );
}

export function removePhotoFromFiche(id: string, photoPath: string) {
  const fiche = getFicheRawById(id);
  if (!fiche) return;
  const photos: string[] = JSON.parse(fiche.photos || "[]").filter(
    (p: string) => p !== photoPath
  );
  db.prepare(`UPDATE fiches SET photos = ?, updated_at = datetime('now') WHERE id = ?`).run(
    JSON.stringify(photos),
    id
  );
}

export function getFicheRawById(id: string): FicheRecord | undefined {
  return db.prepare(`SELECT * FROM fiches WHERE id = ?`).get(id) as unknown as
    | FicheRecord
    | undefined;
}

export function getFicheById(id: string): Fiche | undefined {
  const r = getFicheRawById(id);
  return r ? toFiche(r) : undefined;
}

export function setFicheValidation(
  id: string,
  statut: StatutValidation,
  motif?: string
) {
  db.prepare(
    `UPDATE fiches SET statut_validation = ?, motif_refus = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(statut, motif ?? null, id);
}

export function setFicheActive(id: string, active: boolean) {
  db.prepare(`UPDATE fiches SET active = ?, updated_at = datetime('now') WHERE id = ?`).run(
    active ? 1 : 0,
    id
  );
}

export function listFichesByOwner(ownerId: string): Fiche[] {
  const rows = db
    .prepare(`SELECT * FROM fiches WHERE owner_id = ? ORDER BY created_at DESC`)
    .all(ownerId) as unknown as FicheRecord[];
  return rows.map(toFiche);
}

export function listAllFiches(): Fiche[] {
  const rows = db
    .prepare(`SELECT * FROM fiches ORDER BY created_at DESC`)
    .all() as unknown as FicheRecord[];
  return rows.map(toFiche);
}

// Sans abonnement propriétaire valide, ses fiches n'apparaissent pas côté
// public (demande explicite de l'utilisateur) — voir
// listOwnerIdsAvecAbonnementValide(). Réutilisée dans toutes les requêtes
// publiques ci-dessous.
const ABONNEMENT_VALIDE_SQL = `owner_id IN (SELECT owner_id FROM abonnements_proprietaires WHERE date_fin >= datetime('now'))`;

export function listPublicFiches(filters: {
  zone?: string;
  type?: string;
  q?: string;
  // Filtre "équipements" façon Booking.com : une fiche doit posséder TOUS
  // les équipements cochés (logique ET, comme leurs filtres à cases à
  // cocher). Comparaison sur le JSON stocké (ex : `%"Wifi"%`).
  equipements?: string[];
}): Fiche[] {
  let sql = `SELECT * FROM fiches WHERE statut_validation = 'VALIDEE' AND active = 1 AND ${ABONNEMENT_VALIDE_SQL}`;
  const params: (string | number)[] = [];
  if (filters.zone) {
    sql += ` AND zone = ?`;
    params.push(filters.zone);
  }
  if (filters.type) {
    sql += ` AND type = ?`;
    params.push(filters.type);
  }
  if (filters.q) {
    sql += ` AND (titre LIKE ? OR description LIKE ? OR zone LIKE ? OR quartier LIKE ?)`;
    const like = `%${filters.q}%`;
    params.push(like, like, like, like);
  }
  for (const eq of filters.equipements ?? []) {
    sql += ` AND equipements LIKE ?`;
    params.push(`%"${eq}"%`);
  }
  sql += ` ORDER BY created_at DESC`;
  const rows = db.prepare(sql).all(...params) as unknown as FicheRecord[];
  return rows.map(toFiche);
}

// "Zones tendance" façon Booking.com ("Destinations en vogue") : les zones
// avec le plus de fiches publiées, chacune illustrée par la photo de sa
// fiche la plus récente. Calculé sur les vraies données (jamais une liste
// statique inventée).
export function zonesTendance(limit = 6): { zone: string; count: number; photo: string | null }[] {
  const rows = db
    .prepare(
      `SELECT zone, COUNT(*) as count
       FROM fiches WHERE statut_validation = 'VALIDEE' AND active = 1 AND ${ABONNEMENT_VALIDE_SQL}
       GROUP BY zone ORDER BY count DESC, zone ASC LIMIT ?`
    )
    .all(limit) as unknown as { zone: string; count: number }[];
  return rows.map((r) => {
    const ficheRow = db
      .prepare(
        `SELECT photos FROM fiches
         WHERE zone = ? AND statut_validation = 'VALIDEE' AND active = 1 AND ${ABONNEMENT_VALIDE_SQL} AND photos != '[]'
         ORDER BY created_at DESC LIMIT 1`
      )
      .get(r.zone) as { photos: string } | undefined;
    let photo: string | null = null;
    if (ficheRow) {
      const photos = JSON.parse(ficheRow.photos || "[]") as string[];
      photo = photos[0] ?? null;
    }
    return { zone: r.zone, count: r.count, photo };
  });
}

// ---------- Profils publics propriétaires (vitrine) ----------

// Ne renvoie qu'un propriétaire ACTIF (compte validé) et uniquement les
// champs sûrs à afficher publiquement — jamais le téléphone, l'email ou le
// hash de mot de passe (section 10 du cahier des charges).
export function getOwnerPublicProfile(ownerId: string): OwnerPublicProfile | undefined {
  const row = db
    .prepare(
      `SELECT id, nom, created_at FROM users WHERE id = ? AND role = 'PROPRIETAIRE' AND statut = 'ACTIF'`
    )
    .get(ownerId) as unknown as OwnerPublicProfile | undefined;
  return row;
}

export function listPublicFichesByOwner(ownerId: string): Fiche[] {
  const rows = db
    .prepare(
      `SELECT * FROM fiches WHERE owner_id = ? AND statut_validation = 'VALIDEE' AND active = 1 AND ${ABONNEMENT_VALIDE_SQL}
       ORDER BY created_at DESC`
    )
    .all(ownerId) as unknown as FicheRecord[];
  return rows.map(toFiche);
}

export function ownerPublicStats(ownerId: string): {
  nbFiches: number;
  nbAvis: number;
  noteMoyenne: number;
} {
  const nbFiches = (
    db
      .prepare(
        `SELECT COUNT(*) as n FROM fiches WHERE owner_id = ? AND statut_validation = 'VALIDEE' AND active = 1 AND ${ABONNEMENT_VALIDE_SQL}`
      )
      .get(ownerId) as { n: number }
  ).n;
  const avisRow = db
    .prepare(
      `SELECT COUNT(*) as total, COALESCE(AVG(a.note), 0) as moyenne
       FROM avis a JOIN fiches f ON f.id = a.fiche_id
       WHERE f.owner_id = ? AND a.statut = 'VALIDEE' AND f.statut_validation = 'VALIDEE' AND f.active = 1
         AND f.owner_id IN (SELECT owner_id FROM abonnements_proprietaires WHERE date_fin >= datetime('now'))`
    )
    .get(ownerId) as { total: number; moyenne: number };
  return {
    nbFiches,
    nbAvis: avisRow.total,
    noteMoyenne: Math.round(avisRow.moyenne * 10) / 10,
  };
}

// Fiches "similaires" (même zone ou même type), utilisées en carrousel en
// bas d'une fiche détail. Priorité aux fiches de la même zone.
export function listSimilarFiches(fiche: Fiche, limit = 8): Fiche[] {
  const rows = db
    .prepare(
      `SELECT * FROM fiches
       WHERE id != ? AND statut_validation = 'VALIDEE' AND active = 1 AND ${ABONNEMENT_VALIDE_SQL}
         AND (zone = ? OR type = ?)
       ORDER BY (zone = ?) DESC, created_at DESC
       LIMIT ?`
    )
    .all(fiche.id, fiche.zone, fiche.type, fiche.zone, limit) as unknown as FicheRecord[];
  return rows.map(toFiche);
}

export function siteWidePublicStats(): { nbFiches: number; nbAvis: number } {
  const nbFiches = (
    db
      .prepare(
        `SELECT COUNT(*) as n FROM fiches WHERE statut_validation = 'VALIDEE' AND active = 1 AND ${ABONNEMENT_VALIDE_SQL}`
      )
      .get() as { n: number }
  ).n;
  const nbAvis = (
    db.prepare(`SELECT COUNT(*) as n FROM avis WHERE statut = 'VALIDEE'`).get() as { n: number }
  ).n;
  return { nbFiches, nbAvis };
}

export function dashboardStats() {
  const nbFiches = (db.prepare(`SELECT COUNT(*) as n FROM fiches`).get() as { n: number }).n;
  const nbFichesValidees = (
    db.prepare(`SELECT COUNT(*) as n FROM fiches WHERE statut_validation='VALIDEE'`).get() as {
      n: number;
    }
  ).n;
  const nbFichesEnAttente = (
    db.prepare(`SELECT COUNT(*) as n FROM fiches WHERE statut_validation='EN_ATTENTE'`).get() as {
      n: number;
    }
  ).n;
  const nbFichesRefusees = (
    db.prepare(`SELECT COUNT(*) as n FROM fiches WHERE statut_validation='REFUSEE'`).get() as {
      n: number;
    }
  ).n;
  const nbDemandes = (db.prepare(`SELECT COUNT(*) as n FROM demandes`).get() as { n: number }).n;
  const nbDemandesNouvelles = (
    db.prepare(`SELECT COUNT(*) as n FROM demandes WHERE statut='NOUVELLE'`).get() as {
      n: number;
    }
  ).n;
  const nbProprietaires = (
    db.prepare(`SELECT COUNT(*) as n FROM users WHERE role='PROPRIETAIRE'`).get() as {
      n: number;
    }
  ).n;
  const nbAvisEnAttente = (
    db.prepare(`SELECT COUNT(*) as n FROM avis WHERE statut='EN_ATTENTE'`).get() as { n: number }
  ).n;
  const nbPromotionsActives = (
    db.prepare(`SELECT COUNT(*) as n FROM promotions WHERE active=1`).get() as { n: number }
  ).n;
  const nbEvenementsActifs = (
    db.prepare(`SELECT COUNT(*) as n FROM evenements WHERE active=1`).get() as { n: number }
  ).n;
  const nbAbonnes = (
    db.prepare(`SELECT COUNT(*) as n FROM abonnes`).get() as { n: number }
  ).n;
  return {
    nbFiches,
    nbFichesValidees,
    nbFichesEnAttente,
    nbFichesRefusees,
    nbDemandes,
    nbDemandesNouvelles,
    nbAvisEnAttente,
    nbPromotionsActives,
    nbEvenementsActifs,
    nbProprietaires,
    nbAbonnes,
  };
}

// ---------- Demandes ----------

export function createDemande(input: {
  ficheId?: string;
  evenementId?: string;
  visiteurId?: string;
  nom: string;
  telephone: string;
  email?: string;
  message: string;
}): DemandeRecord {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO demandes (id, fiche_id, evenement_id, visiteur_id, nom, telephone, email, message, statut)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NOUVELLE')`
  ).run(
    id,
    input.ficheId ?? null,
    input.evenementId ?? null,
    input.visiteurId ?? null,
    input.nom,
    input.telephone,
    input.email ?? null,
    input.message
  );
  return db.prepare(`SELECT * FROM demandes WHERE id = ?`).get(id) as unknown as DemandeRecord;
}

export function listDemandesForOwner(ownerId: string) {
  const rows = db
    .prepare(
      `SELECT d.*, f.titre as fiche_titre, f.type as fiche_type
       FROM demandes d JOIN fiches f ON f.id = d.fiche_id
       WHERE f.owner_id = ?
       ORDER BY d.created_at DESC`
    )
    .all(ownerId) as unknown as (DemandeRecord & { fiche_titre: string; fiche_type: string })[];
  return rows;
}

export function listAllDemandes() {
  const rows = db
    .prepare(
      `SELECT d.*, f.titre as fiche_titre, f.type as fiche_type, u.nom as owner_nom,
              e.titre as evenement_titre
       FROM demandes d
       LEFT JOIN fiches f ON f.id = d.fiche_id
       LEFT JOIN users u ON u.id = f.owner_id
       LEFT JOIN evenements e ON e.id = d.evenement_id
       ORDER BY d.created_at DESC`
    )
    .all() as unknown as (DemandeRecord & {
    fiche_titre: string | null;
    fiche_type: string | null;
    owner_nom: string | null;
    evenement_titre: string | null;
  })[];
  return rows;
}

export function listDemandesByVisiteur(visiteurId: string) {
  if (!visiteurId) return [];
  const rows = db
    .prepare(
      `SELECT d.*, f.titre as fiche_titre, f.type as fiche_type, e.titre as evenement_titre
       FROM demandes d
       LEFT JOIN fiches f ON f.id = d.fiche_id
       LEFT JOIN evenements e ON e.id = d.evenement_id
       WHERE d.visiteur_id = ?
       ORDER BY d.created_at DESC`
    )
    .all(visiteurId) as unknown as (DemandeRecord & {
    fiche_titre: string | null;
    fiche_type: string | null;
    evenement_titre: string | null;
  })[];
  return rows;
}

export function setDemandeStatut(id: string, statut: "NOUVELLE" | "TRAITEE") {
  db.prepare(`UPDATE demandes SET statut = ? WHERE id = ?`).run(statut, id);
}

export function getDemandeFicheOwner(demandeId: string): string | undefined {
  const row = db
    .prepare(
      `SELECT f.owner_id as owner_id FROM demandes d JOIN fiches f ON f.id = d.fiche_id WHERE d.id = ?`
    )
    .get(demandeId) as { owner_id: string } | undefined;
  return row?.owner_id;
}

// ---------- Avis (notes & commentaires) ----------

export function createAvis(input: {
  ficheId: string;
  auteurNom: string;
  note: number;
  commentaire: string;
}): AvisRecord {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO avis (id, fiche_id, auteur_nom, note, commentaire, statut)
     VALUES (?, ?, ?, ?, ?, 'EN_ATTENTE')`
  ).run(id, input.ficheId, input.auteurNom, input.note, input.commentaire);
  return db.prepare(`SELECT * FROM avis WHERE id = ?`).get(id) as unknown as AvisRecord;
}

export function listAvisForFiche(ficheId: string): AvisRecord[] {
  return db
    .prepare(`SELECT * FROM avis WHERE fiche_id = ? AND statut = 'VALIDEE' ORDER BY created_at DESC`)
    .all(ficheId) as unknown as AvisRecord[];
}

export function listAllAvis() {
  const rows = db
    .prepare(
      `SELECT a.*, f.titre as fiche_titre
       FROM avis a JOIN fiches f ON f.id = a.fiche_id
       ORDER BY a.created_at DESC`
    )
    .all() as unknown as (AvisRecord & { fiche_titre: string })[];
  return rows;
}

export function setAvisStatut(id: string, statut: StatutAvis) {
  db.prepare(`UPDATE avis SET statut = ? WHERE id = ?`).run(statut, id);
}

export function avisStatsForFiche(ficheId: string): { moyenne: number; total: number } {
  const row = db
    .prepare(
      `SELECT COUNT(*) as total, COALESCE(AVG(note), 0) as moyenne
       FROM avis WHERE fiche_id = ? AND statut = 'VALIDEE'`
    )
    .get(ficheId) as { total: number; moyenne: number };
  return { moyenne: Math.round(row.moyenne * 10) / 10, total: row.total };
}

// batch : évite le N+1 quand on affiche une liste de fiches (accueil, recherche)
export function avisStatsForFiches(
  ficheIds: string[]
): Record<string, { moyenne: number; total: number }> {
  if (ficheIds.length === 0) return {};
  const placeholders = ficheIds.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT fiche_id, COUNT(*) as total, COALESCE(AVG(note), 0) as moyenne
       FROM avis WHERE fiche_id IN (${placeholders}) AND statut = 'VALIDEE'
       GROUP BY fiche_id`
    )
    .all(...ficheIds) as unknown as { fiche_id: string; total: number; moyenne: number }[];
  const result: Record<string, { moyenne: number; total: number }> = {};
  for (const r of rows) {
    result[r.fiche_id] = { moyenne: Math.round(r.moyenne * 10) / 10, total: r.total };
  }
  return result;
}

// ---------- Favoris ----------

export function isFavori(visiteurId: string, ficheId: string): boolean {
  if (!visiteurId) return false;
  const row = db
    .prepare(`SELECT 1 as ok FROM favoris WHERE visiteur_id = ? AND fiche_id = ?`)
    .get(visiteurId, ficheId);
  return !!row;
}

export function listFavoriIdsForVisiteur(visiteurId: string): Set<string> {
  if (!visiteurId) return new Set();
  const rows = db
    .prepare(`SELECT fiche_id FROM favoris WHERE visiteur_id = ?`)
    .all(visiteurId) as unknown as { fiche_id: string }[];
  return new Set(rows.map((r) => r.fiche_id));
}

export function listFavorisForVisiteur(visiteurId: string): Fiche[] {
  if (!visiteurId) return [];
  const rows = db
    .prepare(
      `SELECT f.* FROM favoris fav
       JOIN fiches f ON f.id = fav.fiche_id
       WHERE fav.visiteur_id = ?
       ORDER BY fav.created_at DESC`
    )
    .all(visiteurId) as unknown as FicheRecord[];
  return rows.map(toFiche);
}

export function toggleFavori(visiteurId: string, ficheId: string): boolean {
  if (!visiteurId) return false;
  const already = isFavori(visiteurId, ficheId);
  if (already) {
    db.prepare(`DELETE FROM favoris WHERE visiteur_id = ? AND fiche_id = ?`).run(
      visiteurId,
      ficheId
    );
    return false;
  }
  db.prepare(`INSERT INTO favoris (id, visiteur_id, fiche_id) VALUES (?, ?, ?)`).run(
    randomUUID(),
    visiteurId,
    ficheId
  );
  return true;
}

// ---------- Favoris propriétaires (vitrine) ----------

export function isFavoriProprietaire(visiteurId: string, ownerId: string): boolean {
  if (!visiteurId) return false;
  const row = db
    .prepare(`SELECT 1 as ok FROM favoris_proprietaires WHERE visiteur_id = ? AND owner_id = ?`)
    .get(visiteurId, ownerId);
  return !!row;
}

export function listFavoriProprietaireIdsForVisiteur(visiteurId: string): Set<string> {
  if (!visiteurId) return new Set();
  const rows = db
    .prepare(`SELECT owner_id FROM favoris_proprietaires WHERE visiteur_id = ?`)
    .all(visiteurId) as unknown as { owner_id: string }[];
  return new Set(rows.map((r) => r.owner_id));
}

export function listFavorisProprietairesForVisiteur(
  visiteurId: string
): (OwnerPublicProfile & { nbFiches: number })[] {
  if (!visiteurId) return [];
  const rows = db
    .prepare(
      `SELECT u.id, u.nom, u.created_at
       FROM favoris_proprietaires fp
       JOIN users u ON u.id = fp.owner_id
       WHERE fp.visiteur_id = ? AND u.statut = 'ACTIF'
       ORDER BY fp.created_at DESC`
    )
    .all(visiteurId) as unknown as OwnerPublicProfile[];
  return rows.map((r) => ({ ...r, nbFiches: ownerPublicStats(r.id).nbFiches }));
}

export function toggleFavoriProprietaire(visiteurId: string, ownerId: string): boolean {
  if (!visiteurId) return false;
  const already = isFavoriProprietaire(visiteurId, ownerId);
  if (already) {
    db.prepare(`DELETE FROM favoris_proprietaires WHERE visiteur_id = ? AND owner_id = ?`).run(
      visiteurId,
      ownerId
    );
    return false;
  }
  db.prepare(`INSERT INTO favoris_proprietaires (id, visiteur_id, owner_id) VALUES (?, ?, ?)`).run(
    randomUUID(),
    visiteurId,
    ownerId
  );
  return true;
}

// ---------- Promotions ----------

export function createPromotion(input: {
  ficheId: string;
  titre: string;
  badge: string;
  reductionPct: number;
  prixOriginal?: string;
  prixPromo?: string;
  dateDebut?: string;
  dateFin?: string;
}): PromotionRecord {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO promotions (id, fiche_id, titre, badge, reduction_pct, prix_original, prix_promo, date_debut, date_fin, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
  ).run(
    id,
    input.ficheId,
    input.titre,
    input.badge,
    input.reductionPct,
    input.prixOriginal ?? null,
    input.prixPromo ?? null,
    input.dateDebut ?? null,
    input.dateFin ?? null
  );
  return db.prepare(`SELECT * FROM promotions WHERE id = ?`).get(id) as unknown as PromotionRecord;
}

export function listActivePromotions() {
  const rows = db
    .prepare(
      `SELECT p.*, f.titre as fiche_titre, f.type as fiche_type, f.zone as fiche_zone
       FROM promotions p
       JOIN fiches f ON f.id = p.fiche_id
       WHERE p.active = 1 AND f.statut_validation = 'VALIDEE' AND f.active = 1
         AND f.owner_id IN (SELECT owner_id FROM abonnements_proprietaires WHERE date_fin >= datetime('now'))
       ORDER BY p.created_at DESC`
    )
    .all() as unknown as (PromotionRecord & {
    fiche_titre: string;
    fiche_type: string;
    fiche_zone: string;
  })[];
  return rows;
}

export function listAllPromotions() {
  const rows = db
    .prepare(
      `SELECT p.*, f.titre as fiche_titre
       FROM promotions p JOIN fiches f ON f.id = p.fiche_id
       ORDER BY p.created_at DESC`
    )
    .all() as unknown as (PromotionRecord & { fiche_titre: string })[];
  return rows;
}

export function deletePromotion(id: string) {
  db.prepare(`DELETE FROM promotions WHERE id = ?`).run(id);
}

export function togglePromotionActive(id: string, active: boolean) {
  db.prepare(`UPDATE promotions SET active = ? WHERE id = ?`).run(active ? 1 : 0, id);
}

// ---------- Abonnés (alertes visiteurs) ----------
// Espace visiteur : le visiteur laisse son email et/ou son téléphone pour
// être prévenu des nouveaux événements, promotions et fiches. Aucun envoi
// automatique d'email/SMS n'existe dans ce MVP (pas de service tiers
// configuré) — les coordonnées sont collectées ici et consultables par
// l'administrateur sur /admin/abonnes, pour un envoi manuel (ou branchement
// futur d'un service d'envoi).

export function createAbonne(input: { email?: string; telephone?: string }): AbonneRecord {
  const email = input.email?.trim() || null;
  const telephone = input.telephone?.trim() || null;
  const id = randomUUID();
  db.prepare(
    `INSERT INTO abonnes (id, email, telephone) VALUES (?, ?, ?)`
  ).run(id, email, telephone);
  return db.prepare(`SELECT * FROM abonnes WHERE id = ?`).get(id) as unknown as AbonneRecord;
}

export function findAbonneByEmailOrTelephone(email?: string, telephone?: string) {
  if (!email && !telephone) return undefined;
  return db
    .prepare(
      `SELECT * FROM abonnes WHERE (email IS NOT NULL AND email = ?) OR (telephone IS NOT NULL AND telephone = ?) LIMIT 1`
    )
    .get(email ?? "", telephone ?? "") as unknown as AbonneRecord | undefined;
}

export function listAbonnes(): AbonneRecord[] {
  return db
    .prepare(`SELECT * FROM abonnes ORDER BY created_at DESC`)
    .all() as unknown as AbonneRecord[];
}

export function deleteAbonne(id: string) {
  db.prepare(`DELETE FROM abonnes WHERE id = ?`).run(id);
}

// ---------- Publicités (encart publicitaire) ----------

export function createPublicite(input: {
  titre: string;
  annonceur: string;
  description?: string;
  image?: string;
  lien?: string;
}): PubliciteRecord {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO publicites (id, titre, annonceur, description, image, lien, active) VALUES (?, ?, ?, ?, ?, ?, 1)`
  ).run(
    id,
    input.titre,
    input.annonceur,
    input.description ?? "",
    input.image ?? null,
    input.lien ?? null
  );
  return db.prepare(`SELECT * FROM publicites WHERE id = ?`).get(id) as unknown as PubliciteRecord;
}

export function listActivePublicites(): PubliciteRecord[] {
  // .map(r => ({ ...r })) : les lignes renvoyées par node:sqlite ne sont pas
  // toujours de purs objets (prototype non standard). PubliciteBanner est un
  // Client Component (défilement + fenêtre modale) : React refuse de faire
  // traverser la frontière serveur → client à autre chose qu'un objet
  // "plain" — d'où cette copie explicite avant de renvoyer les données.
  const rows = db
    .prepare(`SELECT * FROM publicites WHERE active = 1 ORDER BY created_at DESC`)
    .all() as unknown as PubliciteRecord[];
  return rows.map((r) => ({ ...r }));
}

export function listAllPublicites(): PubliciteRecord[] {
  return db
    .prepare(`SELECT * FROM publicites ORDER BY created_at DESC`)
    .all() as unknown as PubliciteRecord[];
}

export function deletePublicite(id: string) {
  db.prepare(`DELETE FROM publicites WHERE id = ?`).run(id);
}

export function togglePubliciteActive(id: string, active: boolean) {
  db.prepare(`UPDATE publicites SET active = ? WHERE id = ?`).run(active ? 1 : 0, id);
}

// ---------- Événements ----------

export function createEvenement(input: {
  titre: string;
  description: string;
  lieu: string;
  dateEvenement: string;
  image?: string;
  prixInfo?: string;
}): EvenementRecord {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO evenements (id, titre, description, lieu, date_evenement, image, prix_info, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
  ).run(
    id,
    input.titre,
    input.description,
    input.lieu,
    input.dateEvenement,
    input.image ?? null,
    input.prixInfo ?? null
  );
  return db.prepare(`SELECT * FROM evenements WHERE id = ?`).get(id) as unknown as EvenementRecord;
}

export function listActiveEvenements(): EvenementRecord[] {
  return db
    .prepare(`SELECT * FROM evenements WHERE active = 1 ORDER BY date_evenement ASC`)
    .all() as unknown as EvenementRecord[];
}

export function listAllEvenements(): EvenementRecord[] {
  return db
    .prepare(`SELECT * FROM evenements ORDER BY date_evenement ASC`)
    .all() as unknown as EvenementRecord[];
}

export function getEvenementById(id: string): EvenementRecord | undefined {
  return db.prepare(`SELECT * FROM evenements WHERE id = ?`).get(id) as unknown as
    | EvenementRecord
    | undefined;
}

export function deleteEvenement(id: string) {
  db.prepare(`DELETE FROM evenements WHERE id = ?`).run(id);
}

export function toggleEvenementActive(id: string, active: boolean) {
  db.prepare(`UPDATE evenements SET active = ? WHERE id = ?`).run(active ? 1 : 0, id);
}

// ---------- Abonnement propriétaire ----------
// Auto-déclaré par le propriétaire lui-même (demande explicite de
// l'utilisateur) : pas de vraie passerelle de paiement, le montant est
// recalculé côté serveur à partir de la durée choisie (jamais fait
// confiance à une valeur envoyée par le formulaire).

export function createAbonnementProprietaire(input: {
  ownerId: string;
  dureeMois: number;
  moyenPaiement: string;
  referencePaiement?: string;
}): AbonnementProprietaireRecord {
  const montant = calculerMontantAbonnement(input.dureeMois);
  // Un renouvellement anticipé prolonge à partir de la date de fin en cours
  // (si elle est encore valide), plutôt que de faire perdre les jours
  // restants au propriétaire.
  const statutActuel = getAbonnementStatutProprietaire(input.ownerId);
  const debut =
    statutActuel.valide && statutActuel.abonnement
      ? new Date(statutActuel.abonnement.date_fin)
      : new Date();
  const fin = new Date(debut.getTime() + input.dureeMois * ABONNEMENT_JOURS_PAR_MOIS * 24 * 60 * 60 * 1000);

  const id = randomUUID();
  db.prepare(
    `INSERT INTO abonnements_proprietaires
       (id, owner_id, duree_mois, montant, moyen_paiement, reference_paiement, date_debut, date_fin)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.ownerId,
    input.dureeMois,
    montant,
    input.moyenPaiement,
    input.referencePaiement ?? "",
    debut.toISOString(),
    fin.toISOString()
  );
  return db
    .prepare(`SELECT * FROM abonnements_proprietaires WHERE id = ?`)
    .get(id) as unknown as AbonnementProprietaireRecord;
}

export function listAbonnementsProprietaire(ownerId: string): AbonnementProprietaireRecord[] {
  return db
    .prepare(
      `SELECT * FROM abonnements_proprietaires WHERE owner_id = ? ORDER BY date_fin DESC`
    )
    .all(ownerId) as unknown as AbonnementProprietaireRecord[];
}

// L'abonnement "courant" d'un propriétaire est celui dont date_fin est la
// plus lointaine (et non le plus récemment créé) : un renouvellement anticipé
// crée une nouvelle ligne dont la date de fin dépasse la précédente.
export function getAbonnementStatutProprietaire(ownerId: string): AbonnementStatut {
  const row = db
    .prepare(
      `SELECT * FROM abonnements_proprietaires WHERE owner_id = ? ORDER BY date_fin DESC LIMIT 1`
    )
    .get(ownerId) as unknown as AbonnementProprietaireRecord | undefined;
  if (!row) {
    return { abonnement: null, valide: false, joursRestants: 0 };
  }
  const msRestants = new Date(row.date_fin).getTime() - Date.now();
  const joursRestants = Math.ceil(msRestants / (24 * 60 * 60 * 1000));
  return { abonnement: { ...row }, valide: msRestants > 0, joursRestants };
}

// Utilisé pour filtrer les fiches publiques : sans abonnement valide, les
// fiches d'un propriétaire sont masquées du public (demande explicite de
// l'utilisateur), même si elles restent VALIDEE/active en base.
export function listOwnerIdsAvecAbonnementValide(): Set<string> {
  const rows = db
    .prepare(
      `SELECT DISTINCT owner_id FROM abonnements_proprietaires WHERE date_fin >= datetime('now')`
    )
    .all() as unknown as { owner_id: string }[];
  return new Set(rows.map((r) => r.owner_id));
}

// Utilisé sur la page fiche détail publique : une fiche VALIDEE/active reste
// consultable par son id direct, mais pas si son propriétaire n'a plus
// d'abonnement valide (cohérent avec le masquage dans les listings).
export function proprietaireAAbonnementValide(ownerId: string): boolean {
  const row = db
    .prepare(
      `SELECT 1 FROM abonnements_proprietaires WHERE owner_id = ? AND date_fin >= datetime('now') LIMIT 1`
    )
    .get(ownerId);
  return !!row;
}

// Vue d'ensemble pour l'admin : statut d'abonnement de chaque propriétaire.
export function listAbonnementsProprietairesAvecOwners(): {
  owner: UserRecord;
  statut: AbonnementStatut;
}[] {
  const owners = db
    .prepare(`SELECT * FROM users WHERE role = 'PROPRIETAIRE' ORDER BY nom ASC`)
    .all() as unknown as UserRecord[];
  return owners.map((owner) => ({
    owner: { ...owner },
    statut: getAbonnementStatutProprietaire(owner.id),
  }));
}
'@
$f5 = @'
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
'@
$f6 = @'
"use client";

import { useActionState } from "react";
import Link from "next/link";
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
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
          <Link href="/communaute/mot-de-passe-oublie" className="text-xs font-medium text-brand-teal">
            Mot de passe oublié ?
          </Link>
        </div>
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
$f7 = @'
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginProprietaireAction } from "@/lib/actions/auth";
import SubmitButton from "../SubmitButton";

export default function OwnerLoginForm() {
  const [state, formAction] = useActionState(loginProprietaireAction, undefined);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
          <Link href="/proprietaire/mot-de-passe-oublie" className="text-xs font-medium text-brand-teal">
            Mot de passe oublié ?
          </Link>
        </div>
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
$f8 = @'
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import CommunityLoginForm from "@/components/forms/CommunityLoginForm";

export const metadata = { title: "Connexion communauté — Happy Life" };

export default async function CommunityLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reinitialise?: string }>;
}) {
  const params = await searchParams;

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
      {params.reinitialise === "1" && (
        <p className="mb-4 rounded-xl bg-brand-teal/10 px-3 py-2.5 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.
        </p>
      )}
      <CommunityLoginForm />
    </AuthCard>
  );
}
'@
$f9 = @'
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import OwnerLoginForm from "@/components/forms/OwnerLoginForm";

export const metadata = { title: "Connexion propriétaire — Happy Life" };

type SearchParams = { suspendu?: string; attente?: string; inscrit?: string; reinitialise?: string };

export default async function OwnerLoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <AuthCard
      title="Espace propriétaire"
      subtitle="Connectez-vous pour gérer vos fiches et vos demandes."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/proprietaire/inscription" className="font-medium text-brand-teal">
            Créer un compte propriétaire
          </Link>
        </>
      }
    >
      {params.suspendu === "1" && (
        <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-rose-200">
          Ce compte a été suspendu par l&apos;administrateur.
        </p>
      )}
      {params.attente === "1" && (
        <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-700 ring-1 ring-amber-200">
          Ce compte est en attente de validation par l&apos;administrateur.
        </p>
      )}
      {params.inscrit === "1" && (
        <p className="mb-4 rounded-xl bg-brand-teal/10 px-3 py-2.5 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          Compte créé avec succès. Il doit maintenant être validé par
          l&apos;administrateur avant que vous puissiez vous connecter.
        </p>
      )}
      {params.reinitialise === "1" && (
        <p className="mb-4 rounded-xl bg-brand-teal/10 px-3 py-2.5 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.
        </p>
      )}
      <OwnerLoginForm />
    </AuthCard>
  );
}
'@
$f10 = @'
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { demanderReinitialisationCommunityAction } from "@/lib/actions/community";
import SubmitButton from "../SubmitButton";

export default function CommunityForgotPasswordForm() {
  const [state, formAction] = useActionState(demanderReinitialisationCommunityAction, undefined);

  if (state?.success && state.membreId) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-brand-teal/10 px-4 py-3.5 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          <p className="font-semibold">Code envoyé ✓</p>
          <p className="mt-1">
            Aucun fournisseur SMS/WhatsApp n&apos;est encore branché sur Happy Life : en
            attendant, voici votre code directement à l&apos;écran.
          </p>
          <p className="mt-3 text-center text-2xl font-bold tracking-[0.3em] text-brand-deep">
            {state.codeTest}
          </p>
        </div>
        <Link
          href={`/communaute/mot-de-passe-oublie/reinitialiser?membreId=${state.membreId}`}
          className="block w-full rounded-xl brand-gradient px-4 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90"
        >
          Continuer vers la réinitialisation →
        </Link>
      </div>
    );
  }

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

      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <SubmitButton className="w-full rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
        Recevoir un code
      </SubmitButton>
    </form>
  );
}
'@
$f11 = @'
"use client";

import { useActionState, useState, useTransition } from "react";
import {
  reinitialiserMotDePasseCommunityAction,
  resendCommunityCodeAction,
} from "@/lib/actions/community";
import SubmitButton from "../SubmitButton";

export default function CommunityResetPasswordForm({ membreId }: { membreId: string }) {
  const [state, formAction] = useActionState(reinitialiserMotDePasseCommunityAction, undefined);
  const [nouveauCode, setNouveauCode] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleRenvoyer() {
    startTransition(async () => {
      // Régénère un code sur les mêmes colonnes que la vérification
      // d'inscription (voir community.ts) — même action que "renvoyer le
      // code" à l'inscription, réutilisée telle quelle ici.
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

      <div>
        <label className="block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
        <input
          name="nouveauMotDePasse"
          type="password"
          minLength={6}
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Confirmer le nouveau mot de passe
        </label>
        <input
          name="confirmation"
          type="password"
          minLength={6}
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>

      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <SubmitButton className="w-full rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
        Réinitialiser le mot de passe
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
$f12 = @'
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import CommunityForgotPasswordForm from "@/components/forms/CommunityForgotPasswordForm";

export const metadata = { title: "Mot de passe oublié — Communauté Happy Life" };

export default function CommunityForgotPasswordPage() {
  return (
    <AuthCard
      title="Mot de passe oublié"
      subtitle="Indiquez le téléphone, WhatsApp ou email de votre compte communauté."
      footer={
        <>
          <Link href="/communaute/connexion" className="font-medium text-brand-teal">
            ← Retour à la connexion
          </Link>
        </>
      }
    >
      <CommunityForgotPasswordForm />
    </AuthCard>
  );
}
'@
$f13 = @'
import { redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import CommunityResetPasswordForm from "@/components/forms/CommunityResetPasswordForm";

export const metadata = { title: "Réinitialiser le mot de passe — Communauté Happy Life" };

export default async function CommunityResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ membreId?: string }>;
}) {
  const { membreId } = await searchParams;
  if (!membreId) redirect("/communaute/mot-de-passe-oublie");

  return (
    <AuthCard
      title="Réinitialiser le mot de passe"
      subtitle="Saisissez le code reçu et choisissez un nouveau mot de passe."
    >
      <CommunityResetPasswordForm membreId={membreId} />
    </AuthCard>
  );
}
'@
$f14 = @'
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { demanderReinitialisationMotDePasseAction } from "@/lib/actions/auth";
import SubmitButton from "../SubmitButton";

export default function OwnerForgotPasswordForm() {
  const [state, formAction] = useActionState(demanderReinitialisationMotDePasseAction, undefined);

  if (state?.success && state.userId) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-brand-teal/10 px-4 py-3.5 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          <p className="font-semibold">Code envoyé ✓</p>
          <p className="mt-1">
            Aucun fournisseur d&apos;email/SMS n&apos;est encore branché sur Happy Life : en
            attendant, voici votre code directement à l&apos;écran.
          </p>
          <p className="mt-3 text-center text-2xl font-bold tracking-[0.3em] text-brand-deep">
            {state.codeTest}
          </p>
        </div>
        <Link
          href={`/proprietaire/mot-de-passe-oublie/reinitialiser?userId=${state.userId}`}
          className="block w-full rounded-xl brand-gradient px-4 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90"
        >
          Continuer vers la réinitialisation →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>

      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <SubmitButton className="w-full rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
        Recevoir un code
      </SubmitButton>
    </form>
  );
}
'@
$f15 = @'
"use client";

import { useActionState, useState, useTransition } from "react";
import {
  reinitialiserMotDePasseAction,
  renvoyerCodeReinitialisationAction,
} from "@/lib/actions/auth";
import SubmitButton from "../SubmitButton";

export default function OwnerResetPasswordForm({ userId }: { userId: string }) {
  const [state, formAction] = useActionState(reinitialiserMotDePasseAction, undefined);
  const [nouveauCode, setNouveauCode] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleRenvoyer() {
    startTransition(async () => {
      const res = await renvoyerCodeReinitialisationAction(userId);
      if (res?.codeTest) setNouveauCode(res.codeTest);
    });
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />

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

      <div>
        <label className="block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
        <input
          name="nouveauMotDePasse"
          type="password"
          minLength={6}
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Confirmer le nouveau mot de passe
        </label>
        <input
          name="confirmation"
          type="password"
          minLength={6}
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
        />
      </div>

      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <SubmitButton className="w-full rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
        Réinitialiser le mot de passe
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
$f16 = @'
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import OwnerForgotPasswordForm from "@/components/forms/OwnerForgotPasswordForm";

export const metadata = { title: "Mot de passe oublié — Espace propriétaire" };

export default function OwnerForgotPasswordPage() {
  return (
    <AuthCard
      title="Mot de passe oublié"
      subtitle="Indiquez l'email de votre compte propriétaire."
      footer={
        <>
          <Link href="/proprietaire/connexion" className="font-medium text-brand-teal">
            ← Retour à la connexion
          </Link>
        </>
      }
    >
      <OwnerForgotPasswordForm />
    </AuthCard>
  );
}
'@
$f17 = @'
import { redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import OwnerResetPasswordForm from "@/components/forms/OwnerResetPasswordForm";

export const metadata = { title: "Réinitialiser le mot de passe — Espace propriétaire" };

export default async function OwnerResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const { userId } = await searchParams;
  if (!userId) redirect("/proprietaire/mot-de-passe-oublie");

  return (
    <AuthCard
      title="Réinitialiser le mot de passe"
      subtitle="Saisissez le code reçu et choisissez un nouveau mot de passe."
    >
      <OwnerResetPasswordForm userId={userId} />
    </AuthCard>
  );
}
'@

$resultats["src\lib\types.ts"] = Ecrire-Fichier -CheminRelatif "src\lib\types.ts" -Contenu $f0 -SignatureAttendue "reset_code_expire_at"
$resultats["src\lib\db.ts"] = Ecrire-Fichier -CheminRelatif "src\lib\db.ts" -Contenu $f1 -SignatureAttendue "reset_code_expire_at"
$resultats["src\lib\community.ts"] = Ecrire-Fichier -CheminRelatif "src\lib\community.ts" -Contenu $f2 -SignatureAttendue "reinitialiserMotDePasseMembre"
$resultats["src\lib\actions\community.ts"] = Ecrire-Fichier -CheminRelatif "src\lib\actions\community.ts" -Contenu $f3 -SignatureAttendue "demanderReinitialisationCommunityAction"
$resultats["src\lib\data.ts"] = Ecrire-Fichier -CheminRelatif "src\lib\data.ts" -Contenu $f4 -SignatureAttendue "reinitialiserMotDePasseUtilisateur"
$resultats["src\lib\actions\auth.ts"] = Ecrire-Fichier -CheminRelatif "src\lib\actions\auth.ts" -Contenu $f5 -SignatureAttendue "reinitialiserMotDePasseAction"
$resultats["src\components\forms\CommunityLoginForm.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\forms\CommunityLoginForm.tsx" -Contenu $f6 -SignatureAttendue "mot-de-passe-oublie"
$resultats["src\components\forms\OwnerLoginForm.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\forms\OwnerLoginForm.tsx" -Contenu $f7 -SignatureAttendue "mot-de-passe-oublie"
$resultats["src\app\(public)\communaute\connexion\page.tsx"] = Ecrire-Fichier -CheminRelatif "src\app\(public)\communaute\connexion\page.tsx" -Contenu $f8 -SignatureAttendue "reinitialise"
$resultats["src\app\proprietaire\connexion\page.tsx"] = Ecrire-Fichier -CheminRelatif "src\app\proprietaire\connexion\page.tsx" -Contenu $f9 -SignatureAttendue "reinitialise"
$resultats["src\components\forms\CommunityForgotPasswordForm.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\forms\CommunityForgotPasswordForm.tsx" -Contenu $f10 -SignatureAttendue "demanderReinitialisationCommunityAction"
$resultats["src\components\forms\CommunityResetPasswordForm.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\forms\CommunityResetPasswordForm.tsx" -Contenu $f11 -SignatureAttendue "reinitialiserMotDePasseCommunityAction"
$resultats["src\app\(public)\communaute\mot-de-passe-oublie\page.tsx"] = Ecrire-Fichier -CheminRelatif "src\app\(public)\communaute\mot-de-passe-oublie\page.tsx" -Contenu $f12 -SignatureAttendue "CommunityForgotPasswordForm"
$resultats["src\app\(public)\communaute\mot-de-passe-oublie\reinitialiser\page.tsx"] = Ecrire-Fichier -CheminRelatif "src\app\(public)\communaute\mot-de-passe-oublie\reinitialiser\page.tsx" -Contenu $f13 -SignatureAttendue "CommunityResetPasswordForm"
$resultats["src\components\forms\OwnerForgotPasswordForm.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\forms\OwnerForgotPasswordForm.tsx" -Contenu $f14 -SignatureAttendue "demanderReinitialisationMotDePasseAction"
$resultats["src\components\forms\OwnerResetPasswordForm.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\forms\OwnerResetPasswordForm.tsx" -Contenu $f15 -SignatureAttendue "reinitialiserMotDePasseAction"
$resultats["src\app\proprietaire\mot-de-passe-oublie\page.tsx"] = Ecrire-Fichier -CheminRelatif "src\app\proprietaire\mot-de-passe-oublie\page.tsx" -Contenu $f16 -SignatureAttendue "OwnerForgotPasswordForm"
$resultats["src\app\proprietaire\mot-de-passe-oublie\reinitialiser\page.tsx"] = Ecrire-Fichier -CheminRelatif "src\app\proprietaire\mot-de-passe-oublie\reinitialiser\page.tsx" -Contenu $f17 -SignatureAttendue "OwnerResetPasswordForm"

Write-Host ""
Write-Host "=================================================="
$total = $resultats.Count
$ok = ($resultats.Values | Where-Object { $_ -eq $true }).Count
Write-Host "TERMINE - $ok / $total fichiers corrects sur le disque."
Write-Host "=================================================="
