// Script de génération des données de démonstration Happy Life.
// Usage : node scripts/seed.mjs
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "happy-life.db");

// Repart d'une base vierge à chaque exécution du seed.
if (fs.existsSync(dbPath)) fs.rmSync(dbPath);
for (const suffix of ["-wal", "-shm"]) {
  const f = dbPath + suffix;
  if (fs.existsSync(f)) fs.rmSync(f);
}

const db = new DatabaseSync(dbPath);
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
`);

// Les visuels "photo-style" de démonstration sont déjà générés une fois pour
// toutes et livrés dans public/seed et public/evenements (voir
// scripts/generate-photo-cards.mjs, qui a servi à les produire). Le seed ne
// les régénère plus à chaque exécution : cela évitait de dépendre de
// Playwright/Chromium — non installés sur la machine de l'utilisateur final
// — au moment de l'installation (1-Installer.bat), ce qui faisait échouer
// `npm run seed` avec une erreur "Cannot find module ... playwright".
const publicDir = path.join(root, "public");
function existingImages(dir, prefix, count) {
  const files = [];
  for (let i = 1; i <= count; i++) {
    const rel = `/${dir}/${prefix}-${i}.jpg`;
    if (!fs.existsSync(path.join(publicDir, dir, `${prefix}-${i}.jpg`))) {
      throw new Error(
        `Visuel de démonstration manquant : public${rel} — relancez scripts/generate-photo-cards.mjs sur une machine avec Playwright installé pour le régénérer.`
      );
    }
    files.push(rel);
  }
  return files;
}
const images = {
  piscine: existingImages("seed", "piscine", 4),
  appartement: existingImages("seed", "appartement", 4),
  evenements: existingImages("evenements", "evt", 3),
  publicite: existingImages("seed", "publicite", 2),
};

function insertUser({ role, nom, email, telephone, password }) {
  const id = randomUUID();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(
    `INSERT INTO users (id, role, nom, email, telephone, password_hash, statut) VALUES (?, ?, ?, ?, ?, ?, 'ACTIF')`
  ).run(id, role, nom, email, telephone ?? null, hash);
  return id;
}

function insertFiche({
  ownerId,
  type,
  titre,
  description,
  zone,
  quartier,
  tarif,
  equipements,
  disponibilite,
  statut,
  active,
  photos,
}) {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO fiches (id, owner_id, type, titre, description, zone, quartier, tarif_indicatif, equipements, photos, disponibilite, statut_validation, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    ownerId,
    type,
    titre,
    description,
    zone,
    quartier ?? null,
    tarif ?? null,
    JSON.stringify(equipements),
    JSON.stringify(photos),
    disponibilite ?? "",
    statut,
    active ? 1 : 0
  );
  return id;
}

function insertDemande({ ficheId, evenementId, nom, telephone, email, message, statut }) {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO demandes (id, fiche_id, evenement_id, nom, telephone, email, message, statut) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    ficheId ?? null,
    evenementId ?? null,
    nom,
    telephone,
    email ?? null,
    message ?? "",
    statut ?? "NOUVELLE"
  );
  return id;
}

function insertAvis({ ficheId, auteurNom, note, commentaire, statut }) {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO avis (id, fiche_id, auteur_nom, note, commentaire, statut) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, ficheId, auteurNom, note, commentaire ?? "", statut ?? "VALIDEE");
  return id;
}

function insertPromotion({
  ficheId,
  titre,
  badge,
  reductionPct,
  prixOriginal,
  prixPromo,
  dateDebut,
  dateFin,
}) {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO promotions (id, fiche_id, titre, badge, reduction_pct, prix_original, prix_promo, date_debut, date_fin, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
  ).run(
    id,
    ficheId,
    titre,
    badge ?? "",
    reductionPct,
    prixOriginal ?? null,
    prixPromo ?? null,
    dateDebut ?? null,
    dateFin ?? null
  );
  return id;
}

function insertPublicite({ titre, annonceur, description, image, lien }) {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO publicites (id, titre, annonceur, description, image, lien, active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`
  ).run(id, titre, annonceur ?? "", description ?? "", image ?? null, lien ?? null);
  return id;
}

function insertEvenement({ titre, description, lieu, dateEvenement, image, prixInfo }) {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO evenements (id, titre, description, lieu, date_evenement, image, prix_info, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
  ).run(id, titre, description ?? "", lieu, dateEvenement, image ?? null, prixInfo ?? null);
  return id;
}

// ---- Comptes ----
insertUser({
  role: "ADMIN",
  nom: "Administrateur",
  email: "admin@happylife.ga",
  telephone: "074000000",
  password: "admin1234",
});

const owner1 = insertUser({
  role: "PROPRIETAIRE",
  nom: "Sarah Ondo",
  email: "sarah.ondo@happylife.ga",
  telephone: "074111111",
  password: "proprio1234",
});

const owner2 = insertUser({
  role: "PROPRIETAIRE",
  nom: "Jean-Paul Mba",
  email: "jp.mba@happylife.ga",
  telephone: "074222222",
  password: "proprio1234",
});

const owner3 = insertUser({
  role: "PROPRIETAIRE",
  nom: "Résidences Owendo SARL",
  email: "contact@residences-owendo.ga",
  telephone: "074333333",
  password: "proprio1234",
});

// ---- Fiches piscines ----
const pool = (i) => images.piscine[i % images.piscine.length];
const apt = (i) => images.appartement[i % images.appartement.length];

const ficheLagonBleu = insertFiche({
  ownerId: owner1,
  type: "PISCINE",
  titre: "Piscine familiale Le Lagon Bleu",
  description:
    "Grande piscine extérieure au calme, idéale pour les familles et les groupes d'amis en week-end. Espace détente ombragé, transats disponibles et restauration légère sur place.",
  zone: "Glass",
  quartier: "Glass Cocotiers",
  tarif: "10 000 FCFA / personne / journée",
  equipements: ["Espace détente / transats", "Bar sur place", "Parking", "Vestiaires", "Espace enfants"],
  disponibilite: "Ouvert tous les jours de 9h à 19h.",
  statut: "VALIDEE",
  active: true,
  photos: [pool(0), pool(1), pool(2)],
});

const ficheVillaEmeraude = insertFiche({
  ownerId: owner1,
  type: "PISCINE",
  titre: "Piscine chauffée Villa Emeraude",
  description:
    "Piscine chauffée nichée dans un jardin privé, parfaite pour une sortie entre amis ou en couple. Ambiance calme et sécurisée.",
  zone: "Akanda",
  quartier: "Cap Estérias",
  tarif: "15 000 FCFA / personne / demi-journée",
  equipements: ["Piscine chauffée", "Sécurité sur place", "Parking", "Espace détente / transats"],
  disponibilite: "Vendredi à dimanche, 10h à 18h.",
  statut: "VALIDEE",
  active: true,
  photos: [pool(3), pool(4)],
});

insertFiche({
  ownerId: owner2,
  type: "PISCINE",
  titre: "Espace Détente Charbonnages",
  description:
    "Piscine de quartier conviviale avec restauration sur place, très prisée pour les anniversaires et sorties en groupe.",
  zone: "Charbonnages",
  quartier: null,
  tarif: "8 000 FCFA / personne / journée",
  equipements: ["Restauration", "Bar sur place", "Espace enfants", "Vestiaires"],
  disponibilite: "Tous les jours sauf le lundi (fermeture hebdomadaire).",
  statut: "VALIDEE",
  active: true,
  photos: [pool(5)],
});

insertFiche({
  ownerId: owner2,
  type: "PISCINE",
  titre: "Piscine Panorama PK8",
  description:
    "Nouvelle piscine avec vue dégagée, encore en cours de finalisation des équipements avant ouverture officielle.",
  zone: "PK8",
  quartier: null,
  tarif: "12 000 FCFA / personne",
  equipements: ["Parking", "Sécurité sur place"],
  disponibilite: "",
  statut: "EN_ATTENTE",
  active: true,
  photos: [pool(6)],
});

const fichePrestigeCentreVille = insertFiche({
  ownerId: owner2,
  type: "PISCINE",
  titre: "Piscine Prestige Centre-ville",
  description:
    "Grande piscine d'hôtel au cœur de Libreville, entourée d'un jardin tropical et d'une terrasse avec transats et parasols. Cadre haut de gamme idéal pour une journée détente, un cocktail ou un événement privé en soirée.",
  zone: "Centre-ville",
  quartier: null,
  tarif: "15 000 FCFA / personne / journée",
  equipements: ["Espace détente / transats", "Bar sur place", "Restauration", "Parking", "Sécurité sur place"],
  disponibilite: "Tous les jours de 8h à 20h. Privatisation possible en soirée pour événements (sur demande).",
  statut: "VALIDEE",
  active: true,
  photos: ["/seed/piscine-photo-1.jpg", "/seed/piscine-photo-2.jpg", "/seed/piscine-photo-3.jpg"],
});

// ---- Fiches appartements ----

const ficheStudioOwendo = insertFiche({
  ownerId: owner3,
  type: "APPARTEMENT",
  titre: "Studio meublé confort — Owendo",
  description:
    "Studio entièrement meublé et équipé, idéal pour un séjour court ou une mission professionnelle. Quartier calme et sécurisé, proche des axes principaux.",
  zone: "Owendo",
  quartier: "Owendo Centre",
  tarif: "25 000 FCFA / nuit",
  equipements: ["Wifi", "Climatisation", "Cuisine équipée", "Groupe électrogène", "Sécurité 24h/24"],
  disponibilite: "Disponible toute l'année, sur demande préalable.",
  statut: "VALIDEE",
  active: true,
  photos: [apt(0), apt(1)],
});

insertFiche({
  ownerId: owner3,
  type: "APPARTEMENT",
  titre: "Appartement 2 chambres — Résidence Nzeng-Ayong",
  description:
    "Appartement spacieux de deux chambres, cuisine équipée et parking privé, parfait pour une famille ou un séjour prolongé.",
  zone: "Nzeng-Ayong",
  quartier: null,
  tarif: "35 000 FCFA / nuit",
  equipements: ["Wifi", "Climatisation", "Cuisine équipée", "Parking", "Sécurité 24h/24", "Piscine partagée"],
  disponibilite: "Réservation au moins 48h à l'avance.",
  statut: "VALIDEE",
  active: true,
  photos: [apt(2), apt(3), apt(4)],
});

const ficheLoftBatterie = insertFiche({
  ownerId: owner2,
  type: "APPARTEMENT",
  titre: "Loft moderne Batterie IV",
  description:
    "Loft au design moderne en plein cœur de Batterie IV, à deux pas des commerces et restaurants. Idéal jeunes actifs et expatriés.",
  zone: "Batterie IV",
  quartier: null,
  tarif: "40 000 FCFA / nuit",
  equipements: ["Wifi", "Climatisation", "Terrasse / balcon", "Sécurité 24h/24"],
  disponibilite: "",
  statut: "VALIDEE",
  active: true,
  photos: [apt(5)],
});

insertFiche({
  ownerId: owner1,
  type: "APPARTEMENT",
  titre: "Appartement meublé Centre-ville",
  description:
    "Fiche en cours de révision suite à une mise à jour des photos par le propriétaire.",
  zone: "Centre-ville",
  quartier: null,
  tarif: "30 000 FCFA / nuit",
  equipements: ["Wifi", "Climatisation"],
  disponibilite: "",
  statut: "REFUSEE",
  active: true,
  photos: [apt(6)],
});
// motif de refus pour la démo
db.exec(
  `UPDATE fiches SET motif_refus = 'Photos insuffisantes : merci d''ajouter au moins 3 photos et de préciser le quartier.' WHERE titre = 'Appartement meublé Centre-ville'`
);

// ---- Demandes de démonstration ----
const fichesValidees = db
  .prepare(`SELECT id FROM fiches WHERE statut_validation = 'VALIDEE'`)
  .all();

if (fichesValidees.length > 0) {
  insertDemande({
    ficheId: fichesValidees[0].id,
    nom: "Client Test",
    telephone: "066123456",
    email: "client.test@example.com",
    message: "Bonjour, sommes-nous 8 personnes, est-ce possible ce samedi ?",
    statut: "NOUVELLE",
  });
  insertDemande({
    ficheId: fichesValidees[Math.min(1, fichesValidees.length - 1)].id,
    nom: "Marc Ndong",
    telephone: "077654321",
    email: "",
    message: "Disponible pour ce week-end du 22 au 24 ?",
    statut: "TRAITEE",
  });
  insertDemande({
    ficheId: fichesValidees[0].id,
    nom: "Alice Nguema",
    telephone: "062998877",
    email: "alice.n@example.com",
    message: "Bonjour, quel est le tarif pour un groupe de 15 personnes ?",
    statut: "NOUVELLE",
  });
}

// ---- Avis de démonstration ----
insertAvis({
  ficheId: ficheLagonBleu,
  auteurNom: "Ida Mouloungui",
  note: 5,
  commentaire: "Superbe piscine, très bien entretenue et personnel accueillant. On y retourne !",
  statut: "VALIDEE",
});
insertAvis({
  ficheId: ficheLagonBleu,
  auteurNom: "Steeve Obame",
  note: 4,
  commentaire: "Bon moment en famille, juste un peu de monde le dimanche.",
  statut: "VALIDEE",
});
insertAvis({
  ficheId: ficheVillaEmeraude,
  auteurNom: "Christelle A.",
  note: 5,
  commentaire: "Cadre magnifique et très calme, parfait pour se détendre entre amis.",
  statut: "VALIDEE",
});
insertAvis({
  ficheId: ficheStudioOwendo,
  auteurNom: "Franck M.",
  note: 4,
  commentaire: "Studio propre et bien situé, séjour professionnel sans souci.",
  statut: "VALIDEE",
});
insertAvis({
  ficheId: ficheStudioOwendo,
  auteurNom: "Nadia P.",
  note: 5,
  commentaire: "Très bon accueil, tout était conforme à la fiche.",
  statut: "VALIDEE",
});
insertAvis({
  ficheId: fichePrestigeCentreVille,
  auteurNom: "Rachel Obiang",
  note: 5,
  commentaire: "Très belle piscine, cadre élégant et personnel aux petits soins. Parfait pour un événement en soirée.",
  statut: "VALIDEE",
});
insertAvis({
  ficheId: ficheLoftBatterie,
  auteurNom: "Client anonyme",
  note: 3,
  commentaire: "Bien situé mais un peu bruyant le soir.",
  statut: "EN_ATTENTE",
});

// ---- Promotions de démonstration ----
insertPromotion({
  ficheId: ficheVillaEmeraude,
  titre: "Escapade Weekend",
  badge: "Offre Flash Weekend",
  reductionPct: 30,
  prixOriginal: "15 000 FCFA",
  prixPromo: "10 500 FCFA",
});
insertPromotion({
  ficheId: ficheLoftBatterie,
  titre: "Séjour Découverte",
  badge: "Offre limitée",
  reductionPct: 20,
  prixOriginal: "40 000 FCFA",
  prixPromo: "32 000 FCFA",
});

// ---- Encart publicitaire de démonstration ----
// Deux exemples fournis par l'utilisateur (photos + résumés), pour montrer
// le défilement de l'encart dès qu'il y a plusieurs annonces actives —
// déposées par l'administrateur ou par un propriétaire actif (mêmes droits,
// voir /admin/publicites).
insertPublicite({
  titre: "Piscine à débordement avec vue panoramique sur l'océan",
  annonceur: "Villa de prestige",
  description:
    "Une grande piscine miroir s'étend le long de la terrasse et reflète le ciel teinté de rose, de violet et de bleu au crépuscule. Plusieurs bains de soleil et des plantes tropicales créent une ambiance d'oasis privée, dans une architecture moderne aux baies vitrées toute hauteur, structures en bois et éclairage d'ambiance encastré. La terrasse donne directement sur l'océan et un littoral montagneux en arrière-plan.",
  image: images.publicite[0],
  lien: "/recherche",
});
insertPublicite({
  titre: "Résidence La Salinière — piscine, bassin enfants et bar en paillote",
  annonceur: "500 m après l'hôtel Orchidée",
  description:
    "Une grande piscine extérieure bordée de bains de soleil et de parasols, avec un bassin dédié aux enfants accolé au bassin principal. Un espace bar-restaurant à l'ombre, sous une terrasse couverte en paillote, complète un cadre verdoyant entouré d'arbres et de végétation tropicale. Le complexe La Salinière se trouve à 500 mètres après l'entrée de l'hôtel Orchidée.",
  image: images.publicite[1],
  lien: "/recherche",
});
insertPublicite({
  titre: "Votre publicité ici",
  annonceur: "Happy Life",
  description:
    "Cet emplacement est réservé à votre annonce : mettez en avant votre piscine, votre résidence ou votre offre spéciale auprès de tous les visiteurs de Happy Life.",
  image: images.piscine[0],
  lien: "/proprietaire/inscription",
});

// ---- Événements de démonstration ----
const evtConcert = insertEvenement({
  titre: "Concert Jazz en Plein Air",
  description: "Une soirée jazz au bord de l'eau avec des artistes locaux et invités.",
  lieu: "Libreville, Glass",
  dateEvenement: "2026-09-05",
  image: images.evenements[0],
  prixInfo: "À partir de 10 000 FCFA",
});
insertEvenement({
  titre: "Festival d'Art Local",
  description: "Exposition et marché d'artisanat gabonais, animations toute la journée.",
  lieu: "Libreville, Centre-ville",
  dateEvenement: "2026-09-12",
  image: images.evenements[1],
  prixInfo: "Entrée libre",
});
insertEvenement({
  titre: "Marché Nocturne Bord de Mer",
  description: "Marché gastronomique et artisanal en soirée, ambiance conviviale.",
  lieu: "Libreville, Batterie IV",
  dateEvenement: "2026-08-28",
  image: images.evenements[2],
  prixInfo: "Entrée libre",
});

insertDemande({
  evenementId: evtConcert,
  nom: "Paul Ngoma",
  telephone: "074555666",
  email: "",
  message: "2 places souhaitées, merci.",
  statut: "NOUVELLE",
});

console.log("Base de données de démonstration créée avec succès.");
console.log("");
console.log("Comptes de démonstration :");
console.log("  Admin       : admin@happylife.ga / admin1234");
console.log("  Propriétaire: sarah.ondo@happylife.ga / proprio1234");
console.log("  Propriétaire: jp.mba@happylife.ga / proprio1234");
console.log("  Propriétaire: contact@residences-owendo.ga / proprio1234");
