import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import CommunityLoginForm from "@/components/forms/CommunityLoginForm";

export const metadata = { title: "Connexion communauté — Happy Life" };

export default function CommunityLoginPage() {
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
      <CommunityLoginForm />
    </AuthCard>
  );
}

