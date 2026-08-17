import ChangePasswordForm from "@/components/forms/ChangePasswordForm";

export const metadata = { title: "Mot de passe — Administration" };

export default function AdminMotDePassePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Mot de passe</h1>
      <p className="mt-1 text-sm text-slate-500">
        Modifiez le mot de passe de votre compte. Vous devrez le saisir à nouveau à
        votre prochaine connexion.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-5 card-shadow ring-1 ring-slate-100">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
