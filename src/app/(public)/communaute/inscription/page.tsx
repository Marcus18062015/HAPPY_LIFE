import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import CommunityRegisterForm from "@/components/forms/CommunityRegisterForm";

export const metadata = { title: "Rejoindre la communauté — Happy Life" };

export default function CommunityRegisterPage() {
  return (
    <AuthCard
      title="Rejoindre la communauté Happy Life"
      subtitle="Partagez vos photos et échangez avec les autres membres."
      footer={
        <>
          Déjà membre ?{" "}
          <Link href="/communaute/connexion" className="font-medium text-brand-teal">
            Se connecter
          </Link>
        </>
      }
    >
      <CommunityRegisterForm />
    </AuthCard>
  );
}

