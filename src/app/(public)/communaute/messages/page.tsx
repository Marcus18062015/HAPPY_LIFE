import Link from "next/link";
import { redirect } from "next/navigation";
import { getCommunitySession } from "@/lib/communityAuth";
import { listConversationsForMember } from "@/lib/community";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages — Happy Life" };

function initiale(nom: string) {
  return nom.trim().charAt(0).toUpperCase() || "?";
}

export default async function CommunityMessagesPage() {
  const session = await getCommunitySession();
  if (!session) redirect("/communaute/connexion");

  const conversations = listConversationsForMember(session.sub);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <Link
          href="/communaute"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 card-shadow ring-1 ring-slate-100"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Messages</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          Aucune conversation pour l&apos;instant. Écrivez à un membre depuis le mur communauté.
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/communaute/messages/${c.id}`}
              className="flex items-center gap-3 rounded-2xl bg-white p-3.5 card-shadow ring-1 ring-slate-100 transition hover:-translate-y-0.5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full brand-gradient text-base font-bold text-white">
                {initiale(c.autreMembre?.nom || "?")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {c.autreMembre?.nom || "Membre Happy Life"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {c.dernierMessage?.texte || "Démarrer la conversation"}
                </p>
              </div>
              {c.nonLus > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-teal px-1.5 text-[11px] font-bold text-white">
                  {c.nonLus}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

