// Génère une image "photo-style" de coucher de soleil sur piscine à débordement
// (dégradés + formes vectorielles rendus via Chromium) pour l'écran d'accueil
// "Commencer / Se connecter" et le bandeau hero — sans dépendre d'une
// bibliothèque de photos externe (aucun accès réseau requis).
import { chromium } from "playwright"; // Outil de dev ponctuel : nécessite `npm install playwright` en local (non requis pour l'usage normal de l'application, voir scripts/seed.mjs).
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
mkdirSync(publicDir, { recursive: true });

const W = 900;
const H = 1400;

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1b1140" />
      <stop offset="0.28" stop-color="#3d2160" />
      <stop offset="0.5" stop-color="#a94b6a" />
      <stop offset="0.68" stop-color="#e8703f" />
      <stop offset="0.8" stop-color="#ffc773" />
    </linearGradient>
    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fff6d8" stop-opacity="1" />
      <stop offset="0.35" stop-color="#ffd881" stop-opacity="0.95" />
      <stop offset="1" stop-color="#ff9a4d" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2fa4a8" />
      <stop offset="0.4" stop-color="#157a8c" />
      <stop offset="1" stop-color="#0b3d4c" />
    </linearGradient>
    <linearGradient id="pool" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0d5866" />
      <stop offset="1" stop-color="#04141c" />
    </linearGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.38" r="0.75">
      <stop offset="0.6" stop-color="#000000" stop-opacity="0" />
      <stop offset="1" stop-color="#04141c" stop-opacity="0.55" />
    </radialGradient>
    <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#04141c" stop-opacity="0" />
      <stop offset="1" stop-color="#04141c" stop-opacity="0.95" />
    </linearGradient>
    <filter id="blurSoft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="18" />
    </filter>
    <filter id="blurGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="40" />
    </filter>
  </defs>

  <!-- Ciel -->
  <rect x="0" y="0" width="${W}" height="${H * 0.62}" fill="url(#sky)" />

  <!-- Nuages -->
  <ellipse cx="${W * 0.22}" cy="${H * 0.16}" rx="180" ry="46" fill="#ffb98a" opacity="0.22" filter="url(#blurSoft)" />
  <ellipse cx="${W * 0.78}" cy="${H * 0.1}" rx="220" ry="50" fill="#f8879a" opacity="0.18" filter="url(#blurSoft)" />
  <ellipse cx="${W * 0.5}" cy="${H * 0.28}" rx="260" ry="40" fill="#ffd39c" opacity="0.2" filter="url(#blurSoft)" />

  <!-- Lueur du soleil -->
  <circle cx="${W * 0.5}" cy="${H * 0.42}" r="260" fill="url(#sun)" filter="url(#blurGlow)" />
  <circle cx="${W * 0.5}" cy="${H * 0.42}" r="70" fill="url(#sun)" />

  <!-- Île / palmiers au loin -->
  <path d="M0 ${H * 0.435} q60 -22 140 -6 q70 14 130 -4 q40 -10 90 4 v40 H0 Z" fill="#1c2f4a" opacity="0.85" />
  <path d="M60 ${H * 0.42} q-4 -30 -22 -38" stroke="#1c2f4a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.9" />
  <path d="M60 ${H * 0.42} q-24 -14 -30 2" stroke="#1c2f4a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.9" />
  <path d="M60 ${H * 0.42} q10 -30 30 -34" stroke="#1c2f4a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.9" />
  <path d="M160 ${H * 0.428} q-3 -26 -19 -33" stroke="#1c2f4a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.9" />
  <path d="M160 ${H * 0.428} q-20 -12 -26 2" stroke="#1c2f4a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.9" />

  <!-- Mer -->
  <rect x="0" y="${H * 0.44}" width="${W}" height="${H * 0.2}" fill="url(#sea)" />
  <path d="M0 ${H * 0.47} q${W * 0.1} 8 ${W * 0.2} 0 t${W * 0.2} 0 t${W * 0.2} 0 t${W * 0.2} 0 t${W * 0.2} 0" stroke="#ffe3b0" stroke-width="3" fill="none" opacity="0.35" />
  <path d="M0 ${H * 0.5} q${W * 0.1} 10 ${W * 0.2} 0 t${W * 0.2} 0 t${W * 0.2} 0 t${W * 0.2} 0 t${W * 0.2} 0" stroke="#ffe3b0" stroke-width="4" fill="none" opacity="0.28" />
  <path d="M0 ${H * 0.535} q${W * 0.1} 12 ${W * 0.2} 0 t${W * 0.2} 0 t${W * 0.2} 0 t${W * 0.2} 0 t${W * 0.2} 0" stroke="#bff2ec" stroke-width="4" fill="none" opacity="0.22" />
  <path d="M0 ${H * 0.58} q${W * 0.1} 10 ${W * 0.2} 0 t${W * 0.2} 0 t${W * 0.2} 0 t${W * 0.2} 0 t${W * 0.2} 0" stroke="#bff2ec" stroke-width="4" fill="none" opacity="0.2" />

  <!-- Piscine à débordement (premier plan) -->
  <rect x="0" y="${H * 0.62}" width="${W}" height="${H * 0.38}" fill="url(#pool)" />
  <ellipse cx="${W * 0.5}" cy="${H * 0.635}" rx="${W * 0.75}" ry="26" fill="#7fd8d0" opacity="0.35" />
  <ellipse cx="${W * 0.5}" cy="${H * 0.635}" rx="${W * 0.6}" ry="14" fill="#e7fbf7" opacity="0.3" />
  <path d="M0 ${H * 0.66} q${W * 0.15} 14 ${W * 0.3} 2 t${W * 0.3} 2 t${W * 0.3} 2 t${W * 0.3} 2" stroke="#3fb6ae" stroke-width="3" fill="none" opacity="0.3" />
  <path d="M0 ${H * 0.72} q${W * 0.15} 16 ${W * 0.3} 2 t${W * 0.3} 2 t${W * 0.3} 2 t${W * 0.3} 2" stroke="#2c8f8c" stroke-width="3" fill="none" opacity="0.25" />

  <!-- Vignette + fondu bas pour lisibilité du texte -->
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#vignette)" />
  <rect x="0" y="${H * 0.55}" width="${W}" height="${H * 0.45}" fill="url(#bottomFade)" />
</svg>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.setContent(
  `<!doctype html><html><head><style>html,body{margin:0;padding:0;}</style></head><body>${svg}</body></html>`
);
await page.waitForTimeout(50);
await page.screenshot({ path: path.join(publicDir, "hero-sunset.jpg"), type: "jpeg", quality: 92 });
await browser.close();
console.log("Image générée : public/hero-sunset.jpg");
