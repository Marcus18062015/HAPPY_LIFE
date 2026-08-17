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
