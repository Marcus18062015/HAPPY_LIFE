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

