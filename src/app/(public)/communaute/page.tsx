import Link from "next/link";
import { getCommunitySession } from "@/lib/communityAuth";
import { listPosts, listComments } from "@/lib/community";
import CommunityPostForm from "@/components/forms/CommunityPostForm";
import CommunityPostCard from "@/components/CommunityPostCard";
import { ChatIcon } from "@/components/icons";

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
          <Link
            href="/communaute/messages"
            aria-label="Mes messages"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 card-shadow ring-1 ring-slate-100 hover:text-brand-teal"
          >
            <ChatIcon className="h-5 w-5" />
          </Link>
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

