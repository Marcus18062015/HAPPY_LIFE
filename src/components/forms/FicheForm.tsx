"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import type { Fiche } from "@/lib/types";
import {
  ZONES,
  EQUIPEMENTS_PISCINE,
  EQUIPEMENTS_APPARTEMENT,
} from "@/lib/constants";
import SubmitButton from "../SubmitButton";
import ToggleButton from "../ToggleButton";
import type { FormState } from "@/lib/actions/auth";

export default function FicheForm({
  action,
  initial,
  onDeletePhoto,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: Fiche;
  onDeletePhoto?: (photoPath: string) => Promise<void>;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const [type, setType] = useState<"PISCINE" | "APPARTEMENT">(initial?.type || "PISCINE");
  const equipementsOptions = type === "PISCINE" ? EQUIPEMENTS_PISCINE : EQUIPEMENTS_APPARTEMENT;

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Type de fiche</label>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as "PISCINE" | "APPARTEMENT")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          >
            <option value="PISCINE">Piscine</option>
            <option value="APPARTEMENT">Appartement meublé</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Zone</label>
          <select
            name="zone"
            defaultValue={initial?.zone || ""}
            required
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          >
            <option value="" disabled>
              Choisir une zone
            </option>
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Quartier / précision</label>
          <input
            name="quartier"
            defaultValue={initial?.quartier || ""}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
            placeholder="Ex : derrière l'école..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Tarif indicatif</label>
          <input
            name="tarifIndicatif"
            defaultValue={initial?.tarif_indicatif || ""}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
            placeholder="Ex : 15 000 FCFA / demi-journée"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Titre de l&apos;annonce</label>
        <input
          name="titre"
          defaultValue={initial?.titre || ""}
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          placeholder="Ex : Piscine familiale avec espace détente"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea
          name="description"
          defaultValue={initial?.description || ""}
          required
          rows={5}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          placeholder="Décrivez le lieu, l'ambiance, les conditions d'accès..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Équipements & services</label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {equipementsOptions.map((eq) => (
            <label key={eq} className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="equipements"
                value={eq}
                defaultChecked={initial?.equipements.includes(eq)}
                className="rounded border-slate-300 text-brand-teal focus:ring-brand-teal"
              />
              {eq}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Disponibilités <span className="text-slate-400">(indications simples, ex : jours/horaires)</span>
        </label>
        <textarea
          name="disponibilite"
          defaultValue={initial?.disponibilite || ""}
          rows={2}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
          placeholder="Ex : Ouvert tous les jours de 9h à 18h, sauf le lundi"
        />
      </div>

      {initial && initial.photos.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700">Photos actuelles</label>
          <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {initial.photos.map((p) => (
              <div key={p} className="group relative h-24 overflow-hidden rounded-lg bg-slate-100">
                <Image src={p} alt="" fill sizes="120px" className="object-cover" />
                {onDeletePhoto && (
                  <ToggleButton
                    action={() => onDeletePhoto(p)}
                    className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-rose-600 opacity-0 shadow group-hover:opacity-100"
                  >
                    Suppr.
                  </ToggleButton>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">
          {initial ? "Ajouter des photos" : "Photos"}
        </label>
        <input
          type="file"
          name="photos"
          accept="image/*"
          multiple
          className="mt-1 w-full text-sm text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-brand-teal/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-deep hover:file:bg-brand-teal/20"
        />
      </div>

      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <SubmitButton className="rounded-xl brand-gradient px-6 py-3 text-sm font-semibold text-white hover:opacity-90">
        {initial ? "Enregistrer les modifications" : "Créer la fiche"}
      </SubmitButton>
      {initial && (
        <p className="text-xs text-slate-400">
          Toute modification renvoie automatiquement la fiche en attente de validation par
          l&apos;administrateur.
        </p>
      )}
    </form>
  );
}
