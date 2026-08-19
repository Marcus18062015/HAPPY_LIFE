"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { SplashSlide } from "@/lib/splashSlides";

const INTERVALLE_MS_DEFAUT = 4500;

export default function SplashCarousel({
  slides,
  intervalMs = INTERVALLE_MS_DEFAUT,
  // "splash" : positionnement pensé pour l'écran de démarrage plein écran.
  // "compact" : positionnement resserré, pour un bandeau plus bas (ex :
  // ProfileHero sur la page d'accueil, ~300-360px de hauteur).
  variant = "splash",
}: {
  slides: SplashSlide[];
  intervalMs?: number;
  variant?: "splash" | "compact";
}) {
  const [index, setIndex] = useState(0);
  const [detailOuvert, setDetailOuvert] = useState(false);

  // Fait défiler automatiquement les images les unes après les autres.
  // La rotation est mise en pause pendant que la fenêtre de description
  // est ouverte, pour ne pas changer l'image que la personne est en train
  // de lire.
  useEffect(() => {
    if (detailOuvert || slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [detailOuvert, slides.length, intervalMs]);

  if (slides.length === 0) return null;
  const slideActuel = slides[index];
  const compact = variant === "compact";

  return (
    <>
      <div className="absolute inset-0">
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.src}
              alt={slide.titre}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
        {/* Voile sombre pour garder le texte et le logo lisibles */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-[#04141c]/70" />
      </div>

      {/* Zone cliquable : ouvre la description de l'image actuellement affichée */}
      <button
        type="button"
        onClick={() => setDetailOuvert(true)}
        aria-label={`En savoir plus : ${slideActuel.titre}`}
        className={`absolute inset-x-0 top-0 z-10 ${compact ? "bottom-0" : "bottom-20"}`}
      />

      <span
        className={`pointer-events-none absolute z-10 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm ${
          compact ? "bottom-3 right-3" : "bottom-24 right-5"
        }`}
      >
        ⓘ En savoir plus
      </span>

      {/* Indicateurs de position, cliquables pour naviguer directement */}
      <div
        className={`absolute left-1/2 z-10 flex -translate-x-1/2 gap-2 ${
          compact ? "bottom-3" : "bottom-16"
        }`}
      >
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIndex(i);
            }}
            aria-label={`Voir l'image ${i + 1} sur ${slides.length}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>

      {detailOuvert && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 px-4 pb-8 sm:items-center"
          onClick={() => setDetailOuvert(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 w-full">
              <Image
                src={slideActuel.src}
                alt={slideActuel.titre}
                fill
                sizes="400px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setDetailOuvert(false)}
                aria-label="Fermer"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <h2 className="text-lg font-bold text-slate-900">{slideActuel.titre}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {slideActuel.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

