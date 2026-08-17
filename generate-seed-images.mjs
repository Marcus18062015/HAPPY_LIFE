// Génère des visuels de démonstration (SVG dégradés) pour les fiches piscines
// et appartements du jeu de données de démo — aucune photo externe requise.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "seed");
fs.mkdirSync(outDir, { recursive: true });

const PALETTES = [
  ["#0b3d4c", "#0f9baa", "#35d0c7"],
  ["#083344", "#0e7490", "#67e8f9"],
  ["#0f172a", "#0891b2", "#5eead4"],
  ["#1e3a8a", "#0ea5b7", "#a5f3fc"],
  ["#134e4a", "#14b8a6", "#99f6e4"],
  ["#0c4a6e", "#0284c7", "#7dd3fc"],
];

function wave(seed) {
  const a = 18 + (seed % 4) * 4;
  return `M0,${140 + a} C 150,${100 + a} 300,${180 - a} 450,${140 + a} S 700,${100 + a} 800,${150 + a} L800,320 L0,320 Z`;
}

function poolSvg({ title, sub, palette, seed }) {
  const [c1, c2, c3] = palette;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="533" viewBox="0 0 800 533">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="800" y2="533" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="0.55" stop-color="${c2}"/>
      <stop offset="1" stop-color="${c3}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="533" fill="url(#g)"/>
  <path d="${wave(seed)}" fill="#ffffff" opacity="0.10"/>
  <path d="${wave(seed + 2)}" fill="#ffffff" opacity="0.08" transform="translate(0,40)"/>
  <g opacity="0.9">
    <circle cx="700" cy="90" r="46" fill="#ffffff" opacity="0.12"/>
    <circle cx="90" cy="70" r="26" fill="#ffffff" opacity="0.10"/>
  </g>
  <text x="48" y="440" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="#ffffff">${title}</text>
  <text x="48" y="472" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#e6fbfa" opacity="0.9">${sub}</text>
</svg>`;
}

function apartSvg({ title, sub, palette, seed }) {
  const [c1, c2, c3] = palette;
  const bars = [];
  let x = 60;
  let i = 0;
  while (x < 760) {
    const h = 90 + ((seed + i) % 5) * 34;
    bars.push(
      `<rect x="${x}" y="${330 - h}" width="${58 + (i % 3) * 10}" height="${h}" fill="#ffffff" opacity="${0.08 + (i % 4) * 0.03}"/>`
    );
    x += 58 + (i % 3) * 10 + 18;
    i++;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="533" viewBox="0 0 800 533">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="800" y2="533" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="0.55" stop-color="${c2}"/>
      <stop offset="1" stop-color="${c3}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="533" fill="url(#g)"/>
  <g>${bars.join("")}</g>
  <rect x="0" y="330" width="800" height="203" fill="#ffffff" opacity="0.06"/>
  <text x="48" y="440" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="#ffffff">${title}</text>
  <text x="48" y="472" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#e6fbfa" opacity="0.9">${sub}</text>
</svg>`;
}

export function generate() {
  const files = { piscine: [], appartement: [] };
  for (let i = 0; i < 8; i++) {
    const palette = PALETTES[i % PALETTES.length];
    const p = poolSvg({
      title: "Happy Life",
      sub: `Photo de démonstration ${i + 1}`,
      palette,
      seed: i,
    });
    const fname = `piscine-${i + 1}.svg`;
    fs.writeFileSync(path.join(outDir, fname), p, "utf8");
    files.piscine.push(`/seed/${fname}`);

    const a = apartSvg({
      title: "Happy Life",
      sub: `Photo de démonstration ${i + 1}`,
      palette: [...palette].reverse(),
      seed: i + 3,
    });
    const aname = `appartement-${i + 1}.svg`;
    fs.writeFileSync(path.join(outDir, aname), a, "utf8");
    files.appartement.push(`/seed/${aname}`);
  }
  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = generate();
  console.log("Images générées :", files);
}
