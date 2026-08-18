import AuthCard from "@/components/AuthCard";
import AdminLoginForm from "@/components/forms/AdminLoginForm";

export const metadata = { title: "Administration — Happy Life" };

export default function AdminLoginPage() {
  return (
    <AuthCard
      title="Administration Happy Life"
      subtitle="Réservé à l'équipe Happy Life."
    >
      <AdminLoginForm />
    </AuthCard>
  );
}
