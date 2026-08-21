import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import OwnerLoginForm from "@/components/forms/OwnerLoginForm";

export const metadata = { title: "Connexion propriétaire — Happy Life" };

type SearchParams = { suspendu?: string; attente?: string; inscrit?: string; reinitialise?: string };

export default async function OwnerLoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <AuthCard
      title="Espace propriétaire"
      subtitle="Connectez-vous pour gérer vos fiches et vos demandes."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/proprietaire/inscription" className="font-medium text-brand-teal">
            Créer un compte propriétaire
          </Link>
        </>
      }
    >
      {params.suspendu === "1" && (
        <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-rose-200">
          Ce compte a été suspendu par l&apos;administrateur.
        </p>
      )}
      {params.attente === "1" && (
        <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-700 ring-1 ring-amber-200">
          Ce compte est en attente de validation par l&apos;administrateur.
        </p>
      )}
      {params.inscrit === "1" && (
        <p className="mb-4 rounded-xl bg-brand-teal/10 px-3 py-2.5 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          Compte créé avec succès. Il doit maintenant être validé par
          l&apos;administrateur avant que vous puissiez vous connecter.
        </p>
      )}
      {params.reinitialise === "1" && (
        <p className="mb-4 rounded-xl bg-brand-teal/10 px-3 py-2.5 text-sm text-brand-deep ring-1 ring-brand-teal/30">
          Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.
        </p>
      )}
      <OwnerLoginForm />
    </AuthCard>
  );
}
