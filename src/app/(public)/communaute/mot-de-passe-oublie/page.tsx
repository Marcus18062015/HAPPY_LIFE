import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import CommunityForgotPasswordForm from "@/components/forms/CommunityForgotPasswordForm";

export const metadata = { title: "Mot de passe oublié — Communauté Happy Life" };

export default function CommunityForgotPasswordPage() {
  return (
    <AuthCard
      title="Mot de passe oublié"
      subtitle="Indiquez le téléphone, WhatsApp ou email de votre compte communauté."
      footer={
        <>
          <Link href="/communaute/connexion" className="font-medium text-brand-teal">
            ← Retour à la connexion
          </Link>
        </>
      }
    >
      <CommunityForgotPasswordForm />
    </AuthCard>
  );
}
