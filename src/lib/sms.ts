// Envoi de SMS — abstraction volontairement minimale.
//
// L'utilisateur n'a pas encore de compte chez un fournisseur SMS (Twilio ou
// autre) au moment où cette fonctionnalité a été construite ; il a
// explicitement demandé de "faire sans pour l'instant" plutôt que d'attendre
// d'avoir les identifiants. Cette fonction est donc un stub : tant qu'aucune
// variable d'environnement de fournisseur n'est configurée sur Render, elle
// se contente de journaliser l'envoi (visible dans les logs Render) sans
// jamais faire échouer l'appelant.
//
// Pour brancher un vrai fournisseur plus tard (quelques minutes de travail) :
//   1. Ajouter les identifiants du fournisseur dans les variables
//      d'environnement Render (jamais dans le code ni dans le chat).
//   2. Remplacer le bloc "TODO" ci-dessous par l'appel HTTP réel du
//      fournisseur (ex: Twilio, Vonage, un agrégateur local gabonais...).
//
// Aucune autre partie de l'application n'a besoin de changer : tous les
// appelants utilisent déjà `sendSms(...)` et ignorent le détail du
// fournisseur.

export type SmsResult = { envoye: boolean; raison?: string };

function smsConfigured(): boolean {
  // Aucun fournisseur configuré pour l'instant — voir commentaire en tête de
  // fichier. Dès qu'un fournisseur est choisi, vérifier ici la présence de
  // ses variables d'environnement (ex: process.env.SMS_API_KEY).
  return false;
}

export async function sendSms(telephone: string, message: string): Promise<SmsResult> {
  if (!telephone) {
    return { envoye: false, raison: "Aucun numéro de téléphone renseigné." };
  }

  if (!smsConfigured()) {
    console.log(`[SMS non configuré] Destinataire: ${telephone} — Message: ${message}`);
    return {
      envoye: false,
      raison:
        "Aucun fournisseur SMS n'est encore configuré. Le rappel reste visible dans l'espace propriétaire.",
    };
  }

  // TODO: brancher ici l'appel réel au fournisseur SMS choisi.
  return { envoye: false, raison: "Fournisseur SMS non implémenté." };
}

// Rappel d'échéance d'abonnement — message type utilisé par l'action
// d'envoi manuel côté admin et, plus tard, par un job planifié automatique.
export function messageRappelAbonnement(joursRestants: number): string {
  if (joursRestants < 0) {
    return "Happy Life : votre abonnement propriétaire a expiré. Vos fiches ne sont plus visibles par les visiteurs. Renouvelez depuis votre espace propriétaire pour les republier.";
  }
  if (joursRestants === 0) {
    return "Happy Life : votre abonnement propriétaire expire aujourd'hui. Renouvelez dès maintenant depuis votre espace propriétaire pour éviter la coupure de vos fiches.";
  }
  return `Happy Life : votre abonnement propriétaire expire dans ${joursRestants} jour${joursRestants > 1 ? "s" : ""}. Pensez à le renouveler depuis votre espace propriétaire.`;
}
