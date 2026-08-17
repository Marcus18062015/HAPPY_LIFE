import Image from "next/image";

// Logo officiel fourni par l'utilisateur (marque « H » vagues/toit), détouré
// et recadré sur fond transparent — utilisé comme repère visuel principal de
// l'application (en-tête, menu, écran d'accueil, icônes PWA).
export default function LogoMark({
  size = 34,
  radius,
  className = "",
}: {
  size?: number;
  // Conservé pour compatibilité des appels existants — le logo fourni n'a
  // pas de fond à arrondir (fond transparent), le paramètre est ignoré.
  radius?: number;
  className?: string;
}) {
  void radius;
  return (
    <Image
      src="/brand/logo-mark.png"
      alt="Happy Life"
      width={size}
      height={size}
      priority
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
