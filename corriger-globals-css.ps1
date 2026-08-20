$ErrorActionPreference = "Stop"

$racine = $PSScriptRoot
if (-not (Test-Path (Join-Path $racine "package.json"))) {
    $racine = "C:\Users\Marc\Desktop\Fichiers\HAPPY_PISCINE\HAPPY_LIFE"
}

Write-Host "=================================================="
Write-Host "Dossier utilisé comme racine du projet :"
Write-Host "  $racine"
Write-Host "=================================================="
Write-Host ""

if (-not (Test-Path (Join-Path $racine "package.json"))) {
    Write-Host "ERREUR : impossible de trouver package.json dans ce dossier." -ForegroundColor Red
    Write-Host "Ce script doit être lancé depuis (ou copié dans) le dossier HAPPY_LIFE."
    exit 1
}

$chemin = Join-Path $racine "src\app\globals.css"

Write-Host "--- Contenu actuel de globals.css (les 3 premières lignes) ---"
if (Test-Path $chemin) {
    Get-Content -Path $chemin -TotalCount 3 | ForEach-Object { Write-Host "  $_" }
} else {
    Write-Host "  (fichier introuvable)" -ForegroundColor Yellow
}
Write-Host ""

if (Test-Path $chemin) {
    try {
        $item = Get-Item $chemin -Force
        if ($item.IsReadOnly) {
            Write-Host "(le fichier était en lecture seule -> je retire cette protection)"
            Set-ItemProperty -Path $chemin -Name IsReadOnly -Value $false
        }
    } catch {
        Write-Host "Avertissement : impossible de lire les attributs ($_)" -ForegroundColor Yellow
    }
}

$globalsCss = @'
@import "tailwindcss";

:root {
  --background: #f7fafc;
  --foreground: #0f2b34;

  --brand-deep: #0b3d4c;
  --brand-teal: #0f9baa;
  --brand-cyan: #35d0c7;
  --brand-sun: #ffb648;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-brand-deep: var(--brand-deep);
  --color-brand-teal: var(--brand-teal);
  --color-brand-cyan: var(--brand-cyan);
  --color-brand-sun: var(--brand-sun);
  --font-sans: "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}

.brand-gradient {
  background-image: linear-gradient(120deg, #0b3d4c 0%, #0f9baa 55%, #35d0c7 100%);
}

.brand-gradient-text {
  background-image: linear-gradient(120deg, #0b3d4c 0%, #0f9baa 60%, #35d0c7 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.card-shadow {
  box-shadow: 0 1px 2px rgba(15, 43, 52, 0.07), 0 16px 32px -14px rgba(15, 43, 52, 0.24);
}

/* Fond façon "écran de démarrage" d'application mobile : dégradé sombre +
   halo chaud, comme sur la maquette de référence. */
.splash-gradient {
  background-image: radial-gradient(circle at 28% 15%, rgba(255, 182, 72, 0.35), transparent 45%),
    linear-gradient(165deg, #123b4f 0%, #0b2c3d 45%, #061820 100%);
}

.app-tabbar-shadow {
  box-shadow: 0 -6px 18px rgba(11, 44, 61, 0.08);
}

/* Encart publicitaire : défilement continu de droite à gauche. Le contenu
   est dupliqué une fois par PubliciteBanner ; translateX(-50%) fait donc
   défiler exactement une "copie" complète avant de boucler, sans saut
   visible. En pause au survol, désactivé si l'utilisateur préfère moins
   d'animations. */
@keyframes marquee-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.animate-marquee {
  animation-name: marquee-scroll;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.animate-marquee:hover {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .animate-marquee {
    animation: none;
  }
}
'@

Write-Host "-> src\app\globals.css"
try {
    Set-Content -Path $chemin -Value $globalsCss -Encoding UTF8 -Force
} catch {
    Write-Host "   *** ÉCHEC DE L'ÉCRITURE : $_" -ForegroundColor Red
    Write-Host "   (le fichier est probablement ouvert dans un autre programme — fermez-le et relancez le script)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Milliseconds 200
$verif = Get-Content -Path $chemin -Raw -ErrorAction SilentlyContinue
if ($verif -and $verif.Contains("16px 32px -14px") -and $verif.StartsWith('@import "tailwindcss";')) {
    Write-Host "   OK — le fichier commence bien par le code source attendu." -ForegroundColor Green
} else {
    Write-Host "   *** ÉCHEC DE LA VÉRIFICATION." -ForegroundColor Red
    Write-Host "   Premiers caractères actuels : $($verif.Substring(0, [Math]::Min(80, $verif.Length)))" -ForegroundColor Red
}

Write-Host ""
Write-Host "=================================================="
Write-Host "IMPORTANT : ne lancez PAS le programme d'installation local"
Write-Host "(1Installer.bat / 2-Lancer_Happy_Life.bat) avant d'avoir fait"
Write-Host "le Commit + Push dans GitHub Desktop. Ce programme semble"
Write-Host "réécrire ce fichier avec une version compilée, ce qui casse"
Write-Host "le déploiement en ligne si cette version est ensuite envoyée."
Write-Host "=================================================="
Write-Host ""
Write-Host "TERMINÉ. Copiez TOUT le texte affiché ci-dessus et envoyez-le si un problème persiste."
