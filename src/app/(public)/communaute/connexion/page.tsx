import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import CommunityLoginForm from "@/components/forms/CommunityLoginForm";

export const metadata = { title: "Connexion communauté — Happy Life" };

export default async function CommunityLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reinitialise?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthCard
      title="Espace communauté"
      subtitle="Connectez-vous pour publier et discuter avec les autres membres."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/communaute/inscription" className="font-medium text-brand-teal">
            Rejoindre la communauté
          </Link>
        </>
      }
    >
      {params.reinitialise === "1" && (
        <p className="mb-4 rounded-xl bg-brand-teal/10 px-3 py-2.5 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.
        </p>
      )}
      <CommunityLoginForm />
    </AuthCard>
  );
}
