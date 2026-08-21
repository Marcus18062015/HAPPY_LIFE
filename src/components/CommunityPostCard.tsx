"use client";

import { useState } from "react";
import Image from "next/image";
import { ChatIcon } from "./icons";
import ShareCommunityPostButton from "./ShareCommunityPostButton";
import CommunityCommentForm from "./forms/CommunityCommentForm";
import { deletePostAction, startConversationAction } from "@/lib/actions/community";
import type { CommunityPost, CommunityComment } from "@/lib/types";

function initiale(nom: string) {
  return nom.trim().charAt(0).toUpperCase() || "?";
}

function tempsEcoule(dateIso: string) {
  const diffMs = Date.now() - new Date(dateIso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.floor(heures / 24);
  return `il y a ${jours} j`;
}

export default function CommunityPostCard({
  post,
  comments,
  currentMemberId,
}: {
  post: CommunityPost;
  comments: CommunityComment[];
  currentMemberId: string | null;
}) {
  const [ouvert, setOuvert] = useState(false);
  const estAuteur = currentMemberId === post.auteur_id;

  return (
    <article className="overflow-hidden rounded-2xl bg-white card-shadow ring-1 ring-slate-100">
      <div className="flex items-center justify-between px-4 pt-3.5">
        <div className="flex items-center gap-2.5">
          {post.auteur?.avatar ? (
            <Image
              src={post.auteur.avatar}
              alt={post.auteur.nom}
              width={34}
              height={34}
              className="h-[34px] w-[34px] rounded-full object-cover"
            />
          ) : (
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full brand-gradient text-sm font-bold text-white">
              {initiale(post.auteur?.nom || "?")}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {post.auteur?.nom || "Membre Happy Life"}
            </p>
            <p className="text-[11px] text-slate-400">{tempsEcoule(post.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentMemberId && !estAuteur && (
            <form action={startConversationAction.bind(null, post.auteur_id)}>
              <button
                type="submit"
                aria-label="Envoyer un message"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <ChatIcon className="h-4 w-4" />
              </button>
            </form>
          )}
          {estAuteur && (
            <form action={deletePostAction.bind(null, post.id)}>
              <button
                type="submit"
                className="text-xs font-medium text-slate-400 hover:text-rose-500"
              >
                Supprimer
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="relative mt-3 aspect-square w-full bg-slate-100">
        <Image src={post.photo} alt={post.legende || "Publication"} fill sizes="480px" className="object-cover" />
      </div>

      <div className="px-4 py-3">
        {post.legende && <p className="text-sm text-slate-700">{post.legende}</p>}

        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setOuvert((v) => !v)}
            className="text-xs font-medium text-slate-400 hover:text-brand-teal"
          >
            {post.nbCommentaires > 0
              ? `${post.nbCommentaires} commentaire${post.nbCommentaires > 1 ? "s" : ""}`
              : "Commenter"}
          </button>
          <ShareCommunityPostButton postId={post.id} legende={post.legende} />
        </div>

        {ouvert && (
          <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2 text-sm">
                <span className="font-semibold text-slate-800">{c.auteur?.nom || "Membre"}</span>
                <span className="text-slate-600">{c.texte}</span>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-xs text-slate-400">Aucun commentaire pour l&apos;instant.</p>
            )}
            {currentMemberId ? (
              <CommunityCommentForm postId={post.id} />
            ) : (
              <p className="text-xs text-slate-400">
                Connectez-vous pour commenter cette publication.
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

