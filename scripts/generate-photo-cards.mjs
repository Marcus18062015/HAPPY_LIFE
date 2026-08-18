// Génère des visuels "photo-style" (dégradés + formes vectorielles rendus via
// Chromium) pour les cartes piscines/appartements/événements du jeu de
// données de démonstration — aucune photo externe requise (aucun accès
// réseau nécessaire).
import { chromium } from "playwright"; // Outil de dev ponctuel : nécessite `npm install playwright` en local (non requis pour l'usage normal de l'application, voir scripts/seed.mjs).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedDir = path.join(__dirname, "..", "public", "seed");
const evtDir = path.join(__dirname, "..", "public", "evenements");
fs.mkdirSync(seedDir, { recursive: true });
fs.mkdirSync(evtDir, { recursive: true });

const W = 800;
const H = 533;

const POOL_PALETTES = [
  { sky: ["#ffe8b8", "#ffb87a", "#e8703f"], water: ["#2fa4a8", "#0b3d4c"] },
  { sky: ["#cdeffe", "#8fd3f4", "#3d8bbd"], water: ["#1f9aa0", "#0a2f3d"] },
  { sky: ["#ffd9c2", "#ff9a76", "#c45a7a"], water: ["#177f8c", "#0b2c3d"] },
  { sky: ["#e0f7fa", "#7fd8d0", "#1f7a8c"], water: ["#2a99a3", "#0c3a48"] },
];

const APART_PALETTES = [
  { wall: ["#3a2b4d", "#7a4b6a"], glow: "#ffb648" },
  { wall: ["#2b2140", "#5c3d63"], glow: "#ff9a5a" },
  { wall: ["#1f2a44", "#3c4f7a"], glow: "#ffd28a" },
  { wall: ["#33263a", "#6a3f55"], glow: "#ffbf6b" },
];

function poolScene({ sky, water }, seed) {
  const [s1, s2, s3] = sky;
  const [w1, w2] = water;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${s1}" /><stop offset="0.6" stop-color="${s2}" /><stop offset="1" stop-color="${s3}" />
      </linearGradient>
      <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${w1}" /><stop offset="1" stop-color="${w2}" />
      </linearGradient>
      <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff6d8" /><stop offset="1" stop-color="${s3}" stop-opacity="0" />
      </radialGradient>
      <filter id="b"><feGaussianBlur stdDeviation="14" /></filter>
    </defs>
    <rect width="${W}" height="${H * 0.42}" fill="url(#sky)" />
    <circle cx="${140 + (seed % 3) * 220}" cy="${H * 0.2}" r="120" fill="url(#sun)" filter="url(#b)" />
    <rect y="${H * 0.4}" width="${W}" height="${H * 0.6}" fill="url(#water)" />
    <path d="M0 ${H * 0.44} q60 10 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0" stroke="#ffffff" stroke-width="3" opacity="0.35" fill="none" />
    <path d="M0 ${H * 0.5} q60 12 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0" stroke="#ffffff" stroke-width="3" opacity="0.22" fill="none" />
    <path d="M0 ${H * 0.58} q60 14 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0" stroke="#bff2ec" stroke-width="3" opacity="0.2" fill="none" />
    <rect y="${H * 0.4}" width="${W}" height="14" fill="#ffffff" opacity="0.5" />
    <g opacity="0.9">
      ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${i * (W / 6)}" y="${H * 0.4 - 12}" width="${W / 6 - 4}" height="12" fill="#f4ede1" opacity="0.85" />`).join("")}
    </g>
  </svg>`;
}

function apartScene({ wall, glow }, seed) {
  const [w1, w2] = wall;
  const bars = [];
  let x = 40;
  let i = 0;
  while (x < W - 40) {
    const h = 70 + ((seed + i) % 5) * 26;
    bars.push(
      `<rect x="${x}" y="${H - 60 - h}" width="${46 + (i % 3) * 8}" height="${h}" rx="6" fill="#0b0714" opacity="${0.35 + (i % 3) * 0.1}" />`
    );
    x += 46 + (i % 3) * 8 + 22;
    i++;
  }
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${w1}" /><stop offset="1" stop-color="${w2}" />
      </linearGradient>
      <radialGradient id="glow" cx="0.72" cy="0.35" r="0.5">
        <stop offset="0" stop-color="${glow}" stop-opacity="0.55" /><stop offset="1" stop-color="${glow}" stop-opacity="0" />
      </radialGradient>
      <filter id="b"><feGaussianBlur stdDeviation="30" /></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#wall)" />
    <rect width="${W}" height="${H}" fill="url(#glow)" filter="url(#b)" />
    <rect x="${W * 0.58}" y="${H * 0.12}" width="${W * 0.32}" height="${H * 0.5}" rx="8" fill="#ffe9b8" opacity="0.18" />
    <rect x="${W * 0.58}" y="${H * 0.12}" width="${W * 0.32}" height="${H * 0.5}" rx="8" fill="none" stroke="#fff" stroke-opacity="0.25" stroke-width="4" />
    <line x1="${W * 0.74}" y1="${H * 0.12}" x2="${W * 0.74}" y2="${H * 0.62}" stroke="#fff" stroke-opacity="0.2" stroke-width="4" />
    <g>${bars.join("")}</g>
    <rect y="${H - 60}" width="${W}" height="60" fill="#0b0714" opacity="0.5" />
  </svg>`;
}

function eventScene(kind, seed) {
  if (kind === "concert") {
    const beams = [0, 1, 2, 3, 4]
      .map((i) => {
        const cx = 100 + i * 150;
        const hue = ["#ff5da2", "#5da2ff", "#ffd85d", "#5dffb0", "#c65dff"][i % 5];
        return `<polygon points="${cx},0 ${cx - 60},${H} ${cx + 60},${H}" fill="${hue}" opacity="0.18" />`;
      })
      .join("");
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0714"/><stop offset="1" stop-color="#1b0f2e"/></linearGradient>
      <filter id="b"><feGaussianBlur stdDeviation="10"/></filter></defs>
      <rect width="${W}" height="${H}" fill="url(#bg)" />
      <g filter="url(#b)">${beams}</g>
      <g opacity="0.9">${[0,1,2,3,4,5,6].map((i)=>`<rect x="${60+i*100}" y="${H-70}" width="70" height="70" fill="#0b0714" opacity="0.8"/>`).join("")}</g>
      <circle cx="${120+(seed%4)*160}" cy="90" r="6" fill="#fff" opacity="0.9"/>
      <circle cx="${260+(seed%3)*160}" cy="60" r="4" fill="#fff" opacity="0.7"/>
    </svg>`;
  }
  if (kind === "festival") {
    const flags = [0,1,2,3,4,5,6,7,8,9].map((i)=>{
      const hue = ["#ff9a5a","#ffd85d","#5dffb0","#5da2ff","#ff5da2"][i%5];
      const x = 20 + i * 78;
      return `<path d="M${x} 40 L${x+38} 40 L${x+19} 100 Z" fill="${hue}" opacity="0.85"/>`;
    }).join("");
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd28a"/><stop offset="1" stop-color="#e8703f"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#bg)" />
      <line x1="0" y1="40" x2="${W}" y2="40" stroke="#5c3d2e" stroke-width="4"/>
      ${flags}
      <rect y="${H*0.75}" width="${W}" height="${H*0.25}" fill="#5c3d2e" opacity="0.5"/>
    </svg>`;
  }
  // marché / communautaire
  const dots = Array.from({ length: 24 }, (_, i) => {
    const hue = ["#ff9a5a","#ffd85d","#5dffb0","#5da2ff","#ff5da2","#a5f3fc"][i % 6];
    const cx = 30 + ((i * 53 + seed * 17) % (W - 60));
    const cy = 40 + ((i * 97 + seed * 31) % (H - 80));
    return `<circle cx="${cx}" cy="${cy}" r="${10 + (i % 3) * 4}" fill="${hue}" opacity="0.5"/>`;
  }).join("");
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f9baa"/><stop offset="1" stop-color="#0b3d4c"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#bg)" />
    ${dots}
  </svg>`;
}

export async function generate() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });

  const files = { piscine: [], appartement: [], evenements: [] };

  for (let i = 0; i < 4; i++) {
    const svg = poolScene(POOL_PALETTES[i % POOL_PALETTES.length], i);
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    const fname = `piscine-${i + 1}.jpg`;
    await page.screenshot({ path: path.join(seedDir, fname), type: "jpeg", quality: 90 });
    files.piscine.push(`/seed/${fname}`);
  }
  for (let i = 0; i < 4; i++) {
    const svg = apartScene(APART_PALETTES[i % APART_PALETTES.length], i);
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    const fname = `appartement-${i + 1}.jpg`;
    await page.screenshot({ path: path.join(seedDir, fname), type: "jpeg", quality: 90 });
    files.appartement.push(`/seed/${fname}`);
  }
  const kinds = ["concert", "festival", "marche"];
  for (let i = 0; i < kinds.length; i++) {
    const svg = eventScene(kinds[i], i);
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    const fname = `evt-${i + 1}.jpg`;
    await page.screenshot({ path: path.join(evtDir, fname), type: "jpeg", quality: 90 });
    files.evenements.push(`/evenements/${fname}`);
  }

  await browser.close();
  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = await generate();
  console.log("Visuels générés :", files);
}
