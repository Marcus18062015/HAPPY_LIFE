import Image from "next/image";
import { CalendarIcon, PinIcon } from "./icons";
import EvenementReserveDialog from "./EvenementReserveDialog";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function EvenementCard({
  id,
  titre,
  lieu,
  dateEvenement,
  image,
}: {
  id: string;
  titre: string;
  lieu: string;
  dateEvenement: string;
  image?: string | null;
}) {
  return (
    <div className="flex w-56 shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-white card-shadow ring-1 ring-slate-100">
      <div className="relative h-28 w-full overflow-hidden bg-slate-100">
        {image ? (
          <Image src={image} alt={titre} fill sizes="224px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center brand-gradient text-white/80 text-xs">
            Happy Life
          </div>
        )}
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-brand-deep shadow-sm">
          <CalendarIcon className="h-3 w-3" />
          {formatDate(dateEvenement)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-sm font-semibold text-slate-900 line-clamp-2">{titre}</p>
        <p className="flex items-center gap-1 text-xs text-slate-500">
          <PinIcon className="h-3 w-3 shrink-0 text-brand-teal" />
          <span className="line-clamp-1">{lieu}</span>
        </p>
        <EvenementReserveDialog evenementId={id} evenementTitre={titre} />
      </div>
    </div>
  );
}
