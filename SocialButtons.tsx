import { WhatsAppIcon, FacebookIcon, TikTokIcon } from "./icons";
import { WHATSAPP_URL, FACEBOOK_URL, TIKTOK_URL } from "@/lib/social";

const BASE = "inline-flex h-10 w-10 items-center justify-center rounded-full transition";

export default function SocialButtons({
  variant = "light",
  className = "",
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const style =
    variant === "dark"
      ? "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"
      : "bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter Happy Life sur WhatsApp"
        className={`${BASE} ${style}`}
      >
        <WhatsAppIcon className="h-5 w-5" />
      </a>
      <a
        href={FACEBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Happy Life sur Facebook"
        className={`${BASE} ${style}`}
      >
        <FacebookIcon className="h-5 w-5" />
      </a>
      <a
        href={TIKTOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Happy Life sur TikTok"
        className={`${BASE} ${style}`}
      >
        <TikTokIcon className="h-5 w-5" />
      </a>
    </div>
  );
}
