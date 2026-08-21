import { redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import CommunityVerifyForm from "@/components/forms/CommunityVerifyForm";

export const metadata = { title: "Vérification du compte — Happy Life" };

export default async function CommunityVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ membreId?: string }>;
}) {
  const { membreId } = await searchParams;
  if (!membreId) redirect("/communaute/inscription");

  return (
    <AuthCard
      title="Vérifiez votre compte"
      subtitle="Saisissez le code à 6 chiffres pour activer votre compte communauté."
    >
      <CommunityVerifyForm membreId={membreId} />
    </AuthCard>
  );
}

