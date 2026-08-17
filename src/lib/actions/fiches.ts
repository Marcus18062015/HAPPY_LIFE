"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth";
import {
  createFiche,
  updateFiche,
  getFicheRawById,
  addPhotoToFiche,
  removePhotoFromFiche,
  setFicheActive,
} from "@/lib/data";
import type { FormState } from "./auth";

function parseFicheForm(formData: FormData) {
  const type = String(formData.get("type") || "PISCINE") as "PISCINE" | "APPARTEMENT";
  const titre = String(formData.get("titre") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const zone = String(formData.get("zone") || "").trim();
  const quartier = String(formData.get("quartier") || "").trim();
  const tarifIndicatif = String(formData.get("tarifIndicatif") || "").trim();
  const disponibilite = String(formData.get("disponibilite") || "").trim();
  const equipements = formData.getAll("equipements").map(String);
  return { type, titre, description, zone, quartier, tarifIndicatif, disponibilite, equipements };
}

export async function createFicheAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session || session.role !== "PROPRIETAIRE") {
    return { error: "Vous devez être connecté en tant que propriétaire." };
  }
  const data = parseFicheForm(formData);
  if (!data.titre || !data.zone || !data.description) {
    return { error: "Merci de renseigner au minimum le titre, la zone et la description." };
  }

  const fiche = createFiche({ ownerId: session.sub, ...data });

  const files = formData.getAll("photos").filter((f) => f instanceof File) as File[];
  await savePhotos(fiche.id, files);

  revalidatePath("/proprietaire");
  redirect("/proprietaire?cree=1");
}

export async function updateFicheAction(
  ficheId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session || session.role !== "PROPRIETAIRE") {
    return { error: "Vous devez être connecté en tant que propriétaire." };
  }
  const fiche = getFicheRawById(ficheId);
  if (!fiche || fiche.owner_id !== session.sub) {
    return { error: "Fiche introuvable." };
  }
  const data = parseFicheForm(formData);
  if (!data.titre || !data.zone || !data.description) {
    return { error: "Merci de renseigner au minimum le titre, la zone et la description." };
  }
  updateFiche(ficheId, data);

  const files = formData.getAll("photos").filter((f) => f instanceof File) as File[];
  await savePhotos(ficheId, files);

  revalidatePath("/proprietaire");
  revalidatePath(`/proprietaire/fiches/${ficheId}`);
  redirect(`/proprietaire/fiches/${ficheId}?enregistre=1`);
}

async function savePhotos(ficheId: string, files: File[]) {
  const validFiles = files.filter((f) => f && f.size > 0);
  if (validFiles.length === 0) return;
  const dir = path.join(process.cwd(), "public", "uploads", "fiches", ficheId);
  await fs.mkdir(dir, { recursive: true });
  for (const file of validFiles) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, filename), buffer);
    addPhotoToFiche(ficheId, `/uploads/fiches/${ficheId}/${filename}`);
  }
}

export async function deletePhotoAction(ficheId: string, photoPath: string) {
  const session = await getSession();
  if (!session || session.role !== "PROPRIETAIRE") return;
  const fiche = getFicheRawById(ficheId);
  if (!fiche || fiche.owner_id !== session.sub) return;
  removePhotoFromFiche(ficheId, photoPath);
  try {
    await fs.unlink(path.join(process.cwd(), "public", photoPath.replace(/^\//, "")));
  } catch {
    // fichier déjà absent, on ignore
  }
  revalidatePath(`/proprietaire/fiches/${ficheId}`);
}

export async function toggleFicheActiveAction(ficheId: string, active: boolean) {
  const session = await getSession();
  if (!session || session.role !== "PROPRIETAIRE") return;
  const fiche = getFicheRawById(ficheId);
  if (!fiche || fiche.owner_id !== session.sub) return;
  setFicheActive(ficheId, active);
  revalidatePath("/proprietaire");
}
