// Avatar rond à initiales pour un propriétaire (pas de photo de profil
// dans Happy Life) — couleur dérivée du nom pour rester distinct d'un
// propriétaire à l'autre, dans les tons de la charte (bleu-turquoise).
const PALETTE = [
  "from-brand-teal to-brand-deep",
  "from-[#ff9a5a] to-[#e8703f]",
  "from-[#5da2ff] to-[#1f4fbf]",
  "from-[#5dffb0] to-[#0f9baa]",
  "from-[#ff5da2] to-[#a5175c]",
];

function initials(nom: string) {
  const parts = nom.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function paletteFor(nom: string) {
  let hash = 0;
  for (let i = 0; i < nom.length; i++) hash = (hash * 31 + nom.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export default function OwnerAvatar({
  nom,
  size = 84,
}: {
  nom: string;
  size?: number;
}) {
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={`flex items-center justify-center rounded-[22px] bg-gradient-to-br ${paletteFor(
        nom
      )} font-bold text-white ring-4 ring-white/90`}
    >
      {initials(nom)}
    </div>
  );
}
