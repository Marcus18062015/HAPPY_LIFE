import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCommunitySession } from "@/lib/communityAuth";
import {
  getConversationById,
  estParticipant,
  listMessages,
  marquerConversationLue,
  toPublicProfile,
  getMemberById,
} from "@/lib/community";
import CommunityMessageForm from "@/components/forms/CommunityMessageForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Conversation — Happy Life" };

function initiale(nom: string) {
  return nom.trim().charAt(0).toUpperCase() || "?";
}

export default async function CommunityConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const session = await getCommunitySession();
  if (!session) redirect("/communaute/connexion");

  const { conversationId } = await params;
  const conversation = getConversationById(conversationId);
  if (!conversation || !estParticipant(conversation, session.sub)) {
    notFound();
  }

  const autreId =
    conversation.membre_1_id === session.sub ? conversation.membre_2_id : conversation.membre_1_id;
  const autreMembre = toPublicProfile(getMemberById(autreId));

  marquerConversationLue(conversationId, session.sub);
  const messages = listMessages(conversationId);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-6 sm:px-6">
      <div className="flex items-center gap-3 pb-4">
        <Link
          href="/communaute/messages"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 card-shadow ring-1 ring-slate-100"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full brand-gradient text-sm font-bold text-white">
          {initiale(autreMembre?.nom || "?")}
        </div>
        <h1 className="text-base font-semibold text-slate-900">
          {autreMembre?.nom || "Membre Happy Life"}
        </h1>
      </div>

      <div className="min-h-[50vh] space-y-2.5 rounded-2xl bg-white p-4 card-shadow ring-1 ring-slate-100">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-400">
            Dites bonjour à {autreMembre?.nom || "ce membre"} 👋
          </p>
        ) : (
          messages.map((m) => {
            const estMoi = m.expediteur_id === session.sub;
            return (
              <div key={m.id} className={`flex ${estMoi ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    estMoi
                      ? "brand-gradient rounded-br-sm text-white"
                      : "rounded-bl-sm bg-slate-100 text-slate-700"
                  }`}
                >
                  {m.texte}
                </p>
              </div>
            );
          })
        )}
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 md:bottom-0">
        <div className="mx-auto max-w-2xl">
          <CommunityMessageForm conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
}

