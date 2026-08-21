import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import OwnerForgotPasswordForm from "@/components/forms/OwnerForgotPasswordForm";

export const metadata = { title: "Mot de passe oublié — Espace propriétaire" };

export default function OwnerForgotPasswordPage() {
  return (
    <AuthCard
      title="Mot de passe oublié"
      subtitle="Indiquez l'email de votre compte propriétaire."
      footer={
        <>
          <Link href="/proprietaire/connexion" className="font-medium text-brand-teal">
            ← Retour à la connexion
          </Link>
        </>
      }
    >
      <OwnerForgotPasswordForm />
    </AuthCard>
  );
}
