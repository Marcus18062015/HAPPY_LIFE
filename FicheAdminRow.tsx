"use client";

import { useState } from "react";
import Link from "next/link";
import type { Fiche } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/constants";
import StatusBadge from "../StatusBadge";
import ToggleButton from "../ToggleButton";
import SubmitButton from "../SubmitButton";
import {
  validerFicheAction,
  refuserFicheAction,
  remettreEnAttenteAction,
  adminToggleFicheActiveAction,
} from "@/lib/actions/admin";

export default function FicheAdminRow({
  fiche,
  ownerNom,
}: {
  fiche: Fiche;
  ownerNom: string;
}) {
  const [showRefus, setShowRefus] = useState(false);
  const boundRefuser = refuserFicheAction.bind(null, fiche.id);

  return (
    <div className="rounded-2xl bg-white p-4 card-shadow ring-1 ring-slate-100">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/fiche/${fiche.id}`}
              target="_blank"
              className="font-semibold text-slate-800 hover:text-brand-teal"
            >
              {fiche.titre}
            </Link>
            <StatusBadge status={fiche.statut_validation} />
            <StatusBadge status={fiche.active ? "ACTIF" : "INACTIVE"} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {TYPE_LABELS[fiche.type]} · {fiche.zone} · Propriétaire : {ownerNom}
          </p>
          {fiche.motif_refus && fiche.statut_validation === "REFUSEE" && (
            <p className="mt-1 text-xs text-rose-500">Motif : {fiche.motif_refus}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {fiche.statut_validation !== "VALIDEE" && (
            <ToggleButton
              action={validerFicheAction.bind(null, fiche.id)}
              className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
            >
              Valider
            </ToggleButton>
          )}
          {fiche.statut_validation !== "REFUSEE" && (
            <button
              type="button"
              onClick={() => setShowRefus((v) => !v)}
              className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
            >
              Refuser
            </button>
          )}
          {fiche.statut_validation === "REFUSEE" && (
            <ToggleButton
              action={remettreEnAttenteAction.bind(null, fiche.id)}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Remettre en attente
            </ToggleButton>
          )}
          <ToggleButton
            action={adminToggleFicheActiveAction.bind(null, fiche.id, !fiche.active)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            {fiche.active ? "Désactiver" : "Activer"}
          </ToggleButton>
        </div>
      </div>

      {showRefus && (
        <form
          action={boundRefuser}
          onSubmit={() => setShowRefus(false)}
          className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row"
        >
          <input
            name="motif"
            placeholder="Motif du refus (visible par le propriétaire)"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-teal"
          />
          <SubmitButton className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
            Confirmer le refus
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
