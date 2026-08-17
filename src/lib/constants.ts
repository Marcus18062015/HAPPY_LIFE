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
