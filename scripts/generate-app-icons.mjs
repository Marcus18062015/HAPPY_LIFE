// Génère les icônes de l'application (PWA / écran d'accueil mobile) à partir
// du même dessin que le logo (LogoMark.tsx), rendu via Chromium (Playwright)
// pour obtenir des PNG nets à chaque taille requise.
import { chromium } from "playwright"; // Outil de dev ponctuel : nécessite `npm install playwright` en local (non requis pour l'usage normal de l'application, voir scripts/seed.mjs).
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
mkdirSync(publicDir, { recursive: true });

// rx=0 : bord carré "plein cadre" — les systèmes (iOS/Android) appliquent
// eux-mêmes l'arrondi ou le masque au moment de l'affichage de l'icône.
function iconHtml(size) {
  return `<!doctype html><html><head><style>
    html,body{margin:0;padding:0;background:transparent;}
    svg{display:block;}
  </style></head><body>
  <svg width="${size}" height="${size}" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0b3d4c" />
        <stop offset="0.55" stop-color="#0f9baa" />
        <stop offset="1" stop-color="#35d0c7" />
      </linearGradient>
    </defs>
    <rect width="34" height="34" fill="url(#g)" />
    <path d="M6 20.5c1.6 1.6 3.2 1.6 4.8 0 1.6-1.6 3.2-1.6 4.8 0 1.6 1.6 3.2 1.6 4.8 0 1.6-1.6 3.2-1.6 4.8 0 1.6 1.6 3.2 1.6 4.8 0"
      stroke="white" stroke-width="1.8" stroke-linecap="round" fill="none" />
    <path d="M6 15.5c1.6 1.6 3.2 1.6 4.8 0 1.6-1.6 3.2-1.6 4.8 0 1.6 1.6 3.2 1.6 4.8 0 1.6-1.6 3.2-1.6 4.8 0 1.6 1.6 3.2 1.6 4.8 0"
      stroke="white" stroke-opacity="0.6" stroke-width="1.8" stroke-linecap="round" fill="none" />
  </svg>
  </body></html>`;
}

const browser = await chromium.launch();

async function shot(size, file, { opaque = false } = {}) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(iconHtml(size));
  const el = await page.$("svg");
  await el.screenshot({
    path: path.join(publicDir, file),
    omitBackground: !opaque,
  });
  await page.close();
}

await shot(192, "icon-192.png");
await shot(512, "icon-512.png");
await shot(512, "icon-512-maskable.png");
// apple-touch-icon : iOS n'aime pas la transparence -> fond opaque plein cadre
await shot(180, "apple-touch-icon.png", { opaque: true });

await browser.close();
console.log("Icônes générées dans public/: icon-192.png, icon-512.png, icon-512-maskable.png, apple-touch-icon.png");
