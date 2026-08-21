"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "./icons";
import { WHATSAPP_URL } from "@/lib/social";

// Bouton flottant WhatsApp, visible sur tout le site public — contact
// rapide vers le numéro Happy Life (+241 77 00 00 00). Masqué dans une
// conversation communauté : il chevauche et bloque sinon les clics sur le
// bouton d'envoi du champ de message, fixé lui aussi en bas de l'écran.
export default function WhatsAppFloatButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/communaute/messages/")) return null;

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter Happy Life sur WhatsApp"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_25px_rgba(37,211,102,0.5)] transition hover:scale-105 md:bottom-6 md:right-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}

