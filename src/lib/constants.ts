export const ZONES = [
  "Glass",
  "Louis",
  "Akanda",
  "Owendo",
  "Nzeng-Ayong",
  "Charbonnages",
  "Batterie IV",
  "Centre-ville",
  "PK8",
  "PK12",
] as const;

export const EQUIPEMENTS_PISCINE = [
  "Piscine chauffée",
  "Espace détente / transats",
  "Bar sur place",
  "Parking",
  "Vestiaires",
  "Sécurité sur place",
  "Restauration",
  "Espace enfants",
] as const;

export const EQUIPEMENTS_APPARTEMENT = [
  "Wifi",
  "Climatisation",
  "Cuisine équipée",
  "Parking",
  "Groupe électrogène",
  "Sécurité 24h/24",
  "Piscine partagée",
  "Terrasse / balcon",
] as const;

export const TOUS_EQUIPEMENTS = Array.from(
  new Set([...EQUIPEMENTS_PISCINE, ...EQUIPEMENTS_APPARTEMENT])
);

export const TYPE_LABELS: Record<string, string> = {
  PISCINE: "Piscine",
  APPARTEMENT: "Appartement meublé",
};

// Score qualitatif en mot à côté de la note chiffrée (inspiré des libellés
// "Superbe" / "Exceptionnel" de Booking.com) — calculé à partir de la
// moyenne réelle des avis validés, jamais une valeur inventée.
export function noteLabel(moyenne: number): string {
  if (moyenne >= 4.6) return "Exceptionnel";
  if (moyenne >= 4.2) return "Superbe";
  if (moyenne >= 3.7) return "Très bien";
  if (moyenne >= 3.0) return "Bien";
  return "Correct";
}

// ---------- Abonnement propriétaire ----------
// Demande explicite de l'utilisateur : 10 000 FCFA / mois, avec une remise
// selon la durée choisie. 1 "mois" = 30 jours (pas un mois calendaire), pour
// rester cohérent avec le reste de l'application (offres, promotions...).
export const ABONNEMENT_PRIX_MENSUEL = 10000; // FCFA
export const ABONNEMENT_JOURS_PAR_MOIS = 30;
// Seuil à partir duquel le bandeau de rappel s'affiche dans l'espace
// propriétaire.
export const ABONNEMENT_RAPPEL_JOURS = 7;

export const ABONNEMENT_OFFRES: { mois: number; remisePct: number; label: string }[] = [
  { mois: 1, remisePct: 0, label: "1 mois" },
  { mois: 3, remisePct: 5, label: "3 mois" },
  { mois: 6, remisePct: 8, label: "6 mois" },
  { mois: 12, remisePct: 10, label: "12 mois" },
];

export function calculerMontantAbonnement(mois: number): number {
  const offre = ABONNEMENT_OFFRES.find((o) => o.mois === mois);
  const remisePct = offre?.remisePct ?? 0;
  const brut = ABONNEMENT_PRIX_MENSUEL * mois;
  return Math.round((brut * (100 - remisePct)) / 100);
}

export const MOYENS_PAIEMENT_ABONNEMENT = [
  "Mobile Money",
  "Virement bancaire",
  "Espèces",
  "Autre",
];
