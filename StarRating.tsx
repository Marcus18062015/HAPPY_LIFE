import { StarIcon } from "./icons";

export function StarRatingBadge({ moyenne, total }: { moyenne: number; total: number }) {
  if (total === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur">
      <StarIcon className="h-3 w-3 text-amber-400" />
      {moyenne.toFixed(1)}
    </span>
  );
}

export function StarRatingStatic({
  note,
  size = "h-4 w-4",
}: {
  note: number;
  size?: string;
}) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon
          key={n}
          className={`${size} ${n <= Math.round(note) ? "text-amber-400" : "text-slate-200"}`}
        />
      ))}
    </span>
  );
}
