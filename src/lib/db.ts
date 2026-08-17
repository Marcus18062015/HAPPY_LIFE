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
      image TEXT,
      lien TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_fiches_owner ON fiches(owner_id);
    CREATE INDEX IF NOT EXISTS idx_demandes_fiche ON demandes(fiche_id);
    CREATE INDEX IF NOT EXISTS idx_demandes_evenement ON demandes(evenement_id);
    CREATE INDEX IF NOT EXISTS idx_demandes_visiteur ON demandes(visiteur_id);
    CREATE INDEX IF NOT EXISTS idx_avis_fiche ON avis(fiche_id);
    CREATE INDEX IF NOT EXISTS idx_favoris_visiteur ON favoris(visiteur_id);
    CREATE INDEX IF NOT EXISTS idx_favoris_proprietaires_visiteur ON favoris_proprietaires(visiteur_id);
    CREATE INDEX IF NOT EXISTS idx_favoris_proprietaires_owner ON favoris_proprietaires(owner_id);
    CREATE INDEX IF NOT EXISTS idx_promotions_fiche ON promotions(fiche_id);
  `);
}

initSchema();
