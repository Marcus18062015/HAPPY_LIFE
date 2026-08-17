import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import OwnerRegisterForm from "@/components/forms/OwnerRegisterForm";

export const metadata = { title: "Inscription propriétaire — Happy Life" };

export default function OwnerRegisterPage() {
  return (
    <AuthCard
      title="Devenir propriétaire partenaire"
      subtitle="Créez votre compte pour publier vos piscines ou appartements meublés."
      footer={
        <>
          Déjà un compte ?{" "}
          <Link href="/proprietaire/connexion" className="font-medium text-brand-teal">
            Se connecter
          </Link>
        </>
      }
    >
      <OwnerRegisterForm />
    </AuthCard>
  );
}
