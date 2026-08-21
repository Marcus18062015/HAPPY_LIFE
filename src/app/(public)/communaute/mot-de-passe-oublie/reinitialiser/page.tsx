import { redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import CommunityResetPasswordForm from "@/components/forms/CommunityResetPasswordForm";

export const metadata = { title: "Réinitialiser le mot de passe — Communauté Happy Life" };

export default async function CommunityResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ membreId?: string }>;
}) {
  const { membreId } = await searchParams;
  if (!membreId) redirect("/communaute/mot-de-passe-oublie");

  return (
    <AuthCard
      title="Réinitialiser le mot de passe"
      subtitle="Saisissez le code reçu et choisissez un nouveau mot de passe."
    >
      <CommunityResetPasswordForm membreId={membreId} />
    </AuthCard>
  );
}
