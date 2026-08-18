// Réseaux sociaux & WhatsApp — Happy Life
//
// Numéro WhatsApp confirmé par l'utilisateur : +241 77 00 00 00.
// Format wa.me : indicatif pays + numéro, sans "+" ni espaces.
export const WHATSAPP_NUMBER = "24177000000";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Bonjour Happy Life, je vous contacte depuis le site."
)}`;

// ⚠️ À COMPLÉTER : l'utilisateur a choisi d'activer Facebook et TikTok en
// plus de WhatsApp, mais n'a pas encore communiqué les adresses réelles de
// ses pages. Les liens ci-dessous sont des liens d'accueil génériques
// (facebook.com / tiktok.com), pas encore les pages Happy Life — à
// remplacer par les vraies URLs dès qu'elles seront disponibles.
export const FACEBOOK_URL = "https://facebook.com/HappyLifeGabon";
export const TIKTOK_URL = "https://tiktok.com/@happylifegabon";

// Passe à true une fois les vraies URLs Facebook / TikTok renseignées
// ci-dessus, pour lever l'avertissement affiché à l'administrateur.
export const SOCIAL_LINKS_CONFIRMED = false;
