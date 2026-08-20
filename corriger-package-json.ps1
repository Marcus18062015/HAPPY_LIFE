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

$chemin = Join-Path $racine "package.json"

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

$packageJson = @'
{
  "name": "happy-life",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=22.0.0"
  },
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "eslint",
    "seed": "node scripts/seed.mjs",
    "cloud-build": "npm run seed && npm run build"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "jose": "^6.2.8",
    "next": "16.3.1",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "server-only": "^0.0.1",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^22.20.1",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.3.1",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
'@

Write-Host "-> package.json"
try {
    Set-Content -Path $chemin -Value $packageJson -Encoding UTF8 -Force
} catch {
    Write-Host "   *** ÉCHEC DE L'ÉCRITURE : $_" -ForegroundColor Red
    Write-Host "   (le fichier est probablement ouvert dans un autre programme — fermez-le et relancez le script)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Milliseconds 200
$verif = Get-Content -Path $chemin -Raw -ErrorAction SilentlyContinue
if ($verif -and $verif.Contains('"build": "next build --webpack"')) {
    Write-Host "   OK — contenu vérifié sur le disque." -ForegroundColor Green
} else {
    Write-Host "   *** ÉCHEC DE LA VÉRIFICATION." -ForegroundColor Red
    Write-Host "   Premiers caractères actuels : $($verif.Substring(0, [Math]::Min(200, $verif.Length)))" -ForegroundColor Red
}

Write-Host ""
Write-Host "=================================================="
Write-Host "TERMINÉ. Copiez TOUT le texte affiché ci-dessus et envoyez-le si un problème persiste."
Write-Host "=================================================="
