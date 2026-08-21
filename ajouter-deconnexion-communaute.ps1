$ErrorActionPreference = "Stop"

$racine = $PSScriptRoot
if (-not (Test-Path (Join-Path $racine "package.json"))) {
    $racine = "C:\Users\Marc\Desktop\Fichiers\HAPPY_PISCINE\HAPPY_LIFE"
}

Write-Host "=================================================="
Write-Host "Bouton deconnexion communaute - VERSION 1"
Write-Host "Dossier utilise comme racine du projet :"
Write-Host "  $racine"
Write-Host "=================================================="
Write-Host ""

if (-not (Test-Path (Join-Path $racine "package.json"))) {
    Write-Host "ERREUR : impossible de trouver package.json dans ce dossier." -ForegroundColor Red
    Write-Host "Ce script doit etre lance depuis (ou copie dans) le dossier HAPPY_LIFE."
    exit 1
}

$resultats = @{}

function Ecrire-Fichier {
    param(
        [string]$CheminRelatif,
        [string]$Contenu,
        [string]$SignatureAttendue
    )

    $chemin = Join-Path $racine $CheminRelatif
    $dossier = Split-Path -Path $chemin -Parent

    if (-not (Test-Path -LiteralPath $dossier)) {
        [System.IO.Directory]::CreateDirectory($dossier) | Out-Null
    }

    if (Test-Path -LiteralPath $chemin) {
        try {
            $item = Get-Item -LiteralPath $chemin -Force
            if ($item.IsReadOnly) {
                Set-ItemProperty -LiteralPath $chemin -Name IsReadOnly -Value $false
            }
        } catch {
            Write-Host "   Avertissement attributs : $_" -ForegroundColor Yellow
        }
    }

    Write-Host "-> $CheminRelatif"
    try {
        Set-Content -LiteralPath $chemin -Value $Contenu -Encoding UTF8 -Force
    } catch {
        Write-Host "   *** ECHEC DE L'ECRITURE : $_" -ForegroundColor Red
        Write-Host "   (le fichier est peut-etre ouvert dans un autre programme - fermez-le et relancez le script)" -ForegroundColor Red
        return $false
    }

    Start-Sleep -Milliseconds 120
    $verif = Get-Content -LiteralPath $chemin -Raw -ErrorAction SilentlyContinue
    if ($verif -and $verif.Contains($SignatureAttendue)) {
        Write-Host "   OK" -ForegroundColor Green
        return $true
    } else {
        Write-Host "   *** ECHEC DE LA VERIFICATION (contenu inattendu apres ecriture) ***" -ForegroundColor Red
        return $false
    }
}

$f0 = @'
type IconProps = { className?: string };

const base = "none";

export function MenuIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function HomeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function SearchIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  );
}

export function PlusCircleIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function UserIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" />
    </svg>
  );
}

export function PinIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  );
}

export function WaveIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 8s2-2 4-2 3 2 5 2 3-2 5-2 4 2 4 2" />
      <path d="M3 14s2-2 4-2 3 2 5 2 3-2 5-2 4 2 4 2" />
      <path d="M3 20s2-2 4-2 3 2 5 2 3-2 5-2 4 2 4 2" />
    </svg>
  );
}

export function HeartIcon({
  className = "h-5 w-5",
  filled = false,
}: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 20.5s-7.5-4.9-10-9.6C.4 7.6 2 4 5.6 3.4c2-.3 3.9.7 5 2.3 1.1-1.6 3-2.6 5-2.3C19.2 4 20.8 7.6 19.2 10.9c-2.5 4.7-10 9.6-10 9.6Z" />
    </svg>
  );
}

export function StarIcon({
  className = "h-4 w-4",
  filled = true,
}: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 17l-5.6 3.1 1.4-6.3-4.8-4.3 6.4-.6L12 3Z" />
    </svg>
  );
}

export function BellIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function CalendarIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function TicketIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.7 1.7 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.7 1.7 0 0 0 0-3V9Z" />
      <path d="M10 7v10" strokeDasharray="2.2 2.2" />
    </svg>
  );
}

export function VerifiedBadgeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="verified-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd76b" />
          <stop offset="1" stopColor="#f5a623" />
        </linearGradient>
      </defs>
      <path
        d="m12 1.5 2.4 1.4 2.7-.5 1.4 2.4 2.4 1.4-.5 2.7 1.4 2.4-1.9 2.1.5 2.7-2.7.5-1.4 2.4-2.7-.5L12 22.5l-2.4-1.4-2.7.5-1.4-2.4-2.7-.5.5-2.7-1.9-2.1 1.4-2.4-.5-2.7 2.4-1.4 1.4-2.4 2.7.5L12 1.5Z"
        fill="url(#verified-gold)"
      />
      <path
        d="m8.3 12.3 2.4 2.4 5-5.2"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowLeftIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function ShareIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.7 15.8 6.3M8.2 13.3l7.6 4.4" />
    </svg>
  );
}

export function TagIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.6 3.5H6a2.5 2.5 0 0 0-2.5 2.5v6.6c0 .5.2 1 .5 1.4l8.4 8.4c.8.8 2 .8 2.8 0l6.6-6.6c.8-.8.8-2 0-2.8L13.4 4a2 2 0 0 0-.8-.5Z" />
      <circle cx="8.5" cy="8.5" r="1.5" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.85.5 3.58 1.36 5.07L2 22l5.08-1.33A9.96 9.96 0 0 0 12.02 22C17.54 22 22 17.52 22 12S17.54 2 12.02 2Zm0 18.15a8.13 8.13 0 0 1-4.15-1.14l-.3-.18-3.02.79.8-2.94-.2-.3a8.13 8.13 0 1 1 6.87 3.77Zm4.47-6.1c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.44-1.35-1.68-.14-.24-.02-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.05s.88 2.38 1 2.54c.12.16 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.11-.22-.17-.46-.29Z" />
    </svg>
  );
}

export function FacebookIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M13.5 22v-8.4h2.83l.42-3.28h-3.25V8.24c0-.95.26-1.6 1.63-1.6h1.74V3.72A23.6 23.6 0 0 0 14.36 3.6c-2.5 0-4.22 1.53-4.22 4.33v2.4H7.3v3.27h2.84V22h3.36Z" />
    </svg>
  );
}

export function TikTokIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M16.5 2h-3.1v13.4a2.6 2.6 0 1 1-1.85-2.5v-3.2a5.8 5.8 0 1 0 4.95 5.75V9.1a7.4 7.4 0 0 0 4.3 1.38V7.36A4.35 4.35 0 0 1 16.5 3.02V2Z" />
    </svg>
  );
}

export function MegaphoneIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 10v4a1 1 0 0 0 1 1h2l3.5 5V4L6 9H4a1 1 0 0 0-1 1Z" />
      <path d="M14 7a5 5 0 0 1 0 10M18 4a9 9 0 0 1 0 16" />
    </svg>
  );
}

// Espace communautaire (mur + messagerie) — deux silhouettes.
export function UsersIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 4.5a3.2 3.2 0 0 1 0 6.4M20.5 20a5 5 0 0 0-4.5-6" />
    </svg>
  );
}

export function ChatIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 5h16v11H8l-4 4V5Z" />
    </svg>
  );
}

export function ImageIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m21 15-5-5-9 9" />
    </svg>
  );
}

export function LogoutIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
'@
$f1 = @'
import Link from "next/link";
import { getCommunitySession } from "@/lib/communityAuth";
import { logoutCommunityAction } from "@/lib/actions/community";
import { listPosts, listComments } from "@/lib/community";
import CommunityPostForm from "@/components/forms/CommunityPostForm";
import CommunityPostCard from "@/components/CommunityPostCard";
import { ChatIcon, LogoutIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Communauté — Happy Life" };

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenue?: string; publie?: string }>;
}) {
  const params = await searchParams;
  const session = await getCommunitySession();
  const posts = listPosts();
  const commentsByPost = Object.fromEntries(posts.map((p) => [p.id, listComments(p.id)]));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Communauté</h1>
          <p className="mt-1 text-sm text-slate-500">
            Photos et discussions entre membres Happy Life.
          </p>
        </div>
        {session && (
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[120px] truncate text-xs text-slate-400 sm:block">
              Bonjour, {session.nom}
            </span>
            <Link
              href="/communaute/messages"
              aria-label="Mes messages"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 card-shadow ring-1 ring-slate-100 hover:text-brand-teal"
            >
              <ChatIcon className="h-5 w-5" />
            </Link>
            <form action={logoutCommunityAction}>
              <button
                type="submit"
                aria-label="Se déconnecter"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 card-shadow ring-1 ring-slate-100 hover:text-rose-600"
              >
                <LogoutIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {params.bienvenue === "1" && (
        <p className="mt-4 rounded-xl bg-brand-teal/10 px-4 py-3 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          Bienvenue dans la communauté Happy Life ✓
        </p>
      )}
      {params.publie === "1" && (
        <p className="mt-4 rounded-xl bg-brand-teal/10 px-4 py-3 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          Publication envoyée ✓
        </p>
      )}

      <div className="mt-6">
        {session ? (
          <CommunityPostForm />
        ) : (
          <div className="rounded-2xl bg-white p-5 text-center card-shadow ring-1 ring-slate-100">
            <p className="text-sm text-slate-600">
              Rejoignez la communauté pour publier des photos et discuter avec les autres
              membres.
            </p>
            <div className="mt-3 flex justify-center gap-2.5">
              <Link
                href="/communaute/inscription"
                className="rounded-full brand-gradient px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Rejoindre
              </Link>
              <Link
                href="/communaute/connexion"
                className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
              >
                Se connecter
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-5">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
            Aucune publication pour le moment — soyez le premier à partager une photo !
          </div>
        ) : (
          posts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              comments={commentsByPost[post.id] || []}
              currentMemberId={session?.sub ?? null}
            />
          ))
        )}
      </div>
    </div>
  );
}
'@

$resultats["src\components\icons.tsx"] = Ecrire-Fichier -CheminRelatif "src\components\icons.tsx" -Contenu $f0 -SignatureAttendue "LogoutIcon"
$resultats["src\app\(public)\communaute\page.tsx"] = Ecrire-Fichier -CheminRelatif "src\app\(public)\communaute\page.tsx" -Contenu $f1 -SignatureAttendue "Se déconnecter"

Write-Host ""
Write-Host "=================================================="
$total = $resultats.Count
$ok = ($resultats.Values | Where-Object { $_ -eq $true }).Count
Write-Host "TERMINE - $ok / $total fichiers corrects sur le disque."
Write-Host "=================================================="
