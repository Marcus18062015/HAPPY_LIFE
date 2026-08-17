import "server-only";
import { randomUUID } from "node:crypto";
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
} from "./types";

// ---------- Users ----------

export function createUser(input: {
  role: Role;
  nom: string;
  email: string;
  telephone?: string;
  passwordHash: string;
  // Un compte propriétaire créé par auto-inscription démarre en attente de
  // validation (par l'administrateur ou par un autre propriétaire actif —
  // droits équivalents). Les comptes créés autrement (seed, admin) peuvent
  // forcer un statut différent (ex : 'ACTIF').
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

export function countFichesForOwner(ownerId: string): number {
  const row = db
    .prepare(`SELECT COUNT(*) as n FROM fiches WHERE owner_id = ?`)
    .get(ownerId) as { n: number };
  return row.n;
}

// Suppression d'un compte propriétaire — volontairement restreinte au rôle
// PROPRIETAIRE (WHERE role = 'PROPRIETAIRE') pour qu'un propriétaire ayant
// désormais des droits équivalents à l'admin ne puisse jamais supprimer le
// compte administrateur. Les fiches de ce propriétaire sont supprimées en
// cascade (fiches.owner_id REFERENCES users(id) ON DELETE CASCADE).
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

export function listPublicFiches(filters: {
  zone?: string;
  type?: string;
  q?: string;
  // Filtre "équipements" façon Booking.com : une fiche doit posséder TOUS
  // les équipements cochés (logique ET, comme leurs filtres à cases à
  // cocher). Comparaison sur le JSON stocké (ex : `%"Wifi"%`).
  equipements?: string[];
}): Fiche[] {
  let sql = `SELECT * FROM fiches WHERE statut_validation = 'VALIDEE' AND active = 1`;
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
       FROM fiches WHERE statut_validation = 'VALIDEE' AND active = 1
       GROUP BY zone ORDER BY count DESC, zone ASC LIMIT ?`
    )
    .all(limit) as unknown as { zone: string; count: number }[];
  return rows.map((r) => {
    const ficheRow = db
      .prepare(
        `SELECT photos FROM fiches
         WHERE zone = ? AND statut_validation = 'VALIDEE' AND active = 1 AND photos != '[]'
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
      `SELECT * FROM fiches WHERE owner_id = ? AND statut_validation = 'VALIDEE' AND active = 1
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
        `SELECT COUNT(*) as n FROM fiches WHERE owner_id = ? AND statut_validation = 'VALIDEE' AND active = 1`
      )
      .get(ownerId) as { n: number }
  ).n;
  const avisRow = db
    .prepare(
      `SELECT COUNT(*) as total, COALESCE(AVG(a.note), 0) as moyenne
       FROM avis a JOIN fiches f ON f.id = a.fiche_id
       WHERE f.owner_id = ? AND a.statut = 'VALIDEE' AND f.statut_validation = 'VALIDEE' AND f.active = 1`
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
       WHERE id != ? AND statut_validation = 'VALIDEE' AND active = 1
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
      .prepare(`SELECT COUNT(*) as n FROM fiches WHERE statut_validation = 'VALIDEE' AND active = 1`)
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
// l'administrateur / les propriétaires actifs (mêmes droits) sur
// /admin/abonnes, pour un envoi manuel (ou branchement futur d'un service
// d'envoi).

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
  image?: string;
  lien?: string;
}): PubliciteRecord {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO publicites (id, titre, annonceur, image, lien, active) VALUES (?, ?, ?, ?, ?, 1)`
  ).run(id, input.titre, input.annonceur, input.image ?? null, input.lien ?? null);
  return db.prepare(`SELECT * FROM publicites WHERE id = ?`).get(id) as unknown as PubliciteRecord;
}

export function listActivePublicites(): PubliciteRecord[] {
  return db
    .prepare(`SELECT * FROM publicites WHERE active = 1 ORDER BY created_at DESC`)
    .all() as unknown as PubliciteRecord[];
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
