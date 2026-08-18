const STYLES: Record<string, string> = {
  VALIDEE: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  EN_ATTENTE: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  REFUSEE: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  ACTIF: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  SUSPENDU: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  NOUVELLE: "bg-brand-teal/10 text-brand-deep ring-1 ring-brand-teal/30",
  TRAITEE: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  INACTIVE: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};

const LABELS: Record<string, string> = {
  VALIDEE: "Validée",
  EN_ATTENTE: "En attente de validation",
  REFUSEE: "Refusée",
  ACTIF: "Actif",
  SUSPENDU: "Suspendu",
  NOUVELLE: "Nouvelle",
  TRAITEE: "Traitée",
  INACTIVE: "Désactivée",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        STYLES[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {LABELS[status] || status}
    </span>
  );
}
