import { redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import OwnerResetPasswordForm from "@/components/forms/OwnerResetPasswordForm";

export const metadata = { title: "Réinitialiser le mot de passe — Espace propriétaire" };

export default async function OwnerResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const { userId } = await searchParams;
  if (!userId) redirect("/proprietaire/mot-de-passe-oublie");

  return (
    <AuthCard
      title="Réinitialiser le mot de passe"
      subtitle="Saisissez le code reçu et choisissez un nouveau mot de passe."
    >
      <OwnerResetPasswordForm userId={userId} />
    </AuthCard>
  );
}
